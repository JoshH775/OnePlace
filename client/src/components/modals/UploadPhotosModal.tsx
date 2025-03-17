import Modal from "../ui/Modal";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "../../utils/api";
import ExifReader from "exifreader";
import moment from "moment";
import toast from "react-hot-toast";
import { ProtoPhoto } from "@shared/types";
import { useAuth } from "../AuthProvider";
import _ from "lodash";
import { CHUNK_SIZE, TimestampFormat } from "@shared/constants";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UploadPhotosModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const compress = useAuth().user?.settings.compress_before_upload === "true";

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({
      acceptedFiles,
      compress,
    }: {
      acceptedFiles: { file: File; metadata: ProtoPhoto }[];
      compress: boolean;
    }) => {

      //Performing chunking before sending through api
      const totalSize = acceptedFiles.reduce(
        (acc, { file }) => acc + file.size,
        0
      );

      if (totalSize > CHUNK_SIZE) {
        const chunks = _.chunk(
          acceptedFiles,
          Math.ceil(acceptedFiles.length / 2)
        );

        const results = await Promise.allSettled(
          chunks.map((chunk) => api.uploadPhotos(chunk, compress))
        );
        const allSuccess = results.every(
          (result) => result.status === "fulfilled"
        );
        return allSuccess;
      } else {
        return api.uploadPhotos(acceptedFiles, compress);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      onClose();
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const failedFiles = [];
      const filesWithMetadata: { file: File; metadata: ProtoPhoto }[] = [];

      for (const file of acceptedFiles) {
        const { valid, metadata } = await parseFileMetadata(file);

        if (!valid || !metadata) {
          console.log(`File ${file.name} is not a valid image type`);
          toast.error(`File ${file.name} is not a valid image type`);
          failedFiles.push(file);
          continue;
        }

        filesWithMetadata.push({ file, metadata });
      }

      if (failedFiles.length > 0) {
        console.log("Failed files:", failedFiles);
        return;
      }

      if (filesWithMetadata.length === 0) {
        return;
      }

      const upload = mutateAsync({
        acceptedFiles: filesWithMetadata,
        compress,
      });
      toast.promise(upload, {
        loading: "Uploading photos...",
        success: "Photos uploaded successfully!",
        error: "Failed to upload photos",
      });
    },
    [mutateAsync, compress]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Photos">
      <div className="flex flex-col gap-3">
        <div
          {...getRootProps()}
          className="border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6"
        >
          {isPending && <p>Uploading...</p>}
          {!isPending && (
            <>
              <input {...getInputProps()} />
              <div>
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

async function validateFileForUpload(
  file: File
): Promise<{ valid: boolean; type: string; tags: ExifReader.Tags }> {
  const validTypes = ["jpeg", "jpg", "png", "webp"];
  const tags = await ExifReader.load(file);

  if (!validTypes.includes(tags["FileType"].value)) {
    return { valid: false, type: tags["FileType"].value, tags };
  }

  return { valid: true, type: tags["FileType"].value, tags };
}

async function parseFileMetadata(
  file: File
): Promise<{ valid: boolean; metadata: ProtoPhoto | null }> {
  const { valid, type, tags } = await validateFileForUpload(file);

  if (!valid) {
    return { valid, metadata: null };
  }

  const latitude = tags["GPSLatitude"]?.description as number | undefined;
  const longitude = tags["GPSLongitude"]?.description as number | undefined;

  let location = null;

  if (latitude && longitude) {
    location = `${latitude}/${longitude}`;
    if (tags["GPSAltitude"]?.description) {
      location += `/${tags["GPSAltitude"].description.split(" ")[0]}`;
    }
  }

  let date = null
  const dateTaken = tags['DateCreated']
  if (dateTaken) {
    date = dateTaken.value
  }

  const metadata: ProtoPhoto = {
    filename: file.name,
    location: location,
    alias: null,
    compressed: false,
    size: file.size,
    date: date,
    type: `image/${type}`,
  };

  return { valid, metadata };
}
