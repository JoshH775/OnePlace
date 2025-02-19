import Modal from "../ui/Modal";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "../../utils/api";
import ExifReader from "exifreader";
import { ProtoPhoto } from "../../utils/types";
import moment from "moment";


type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UploadPhotosModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (acceptedFiles: { file: File, metadata: ProtoPhoto }[]) => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      return api.uploadPhotos(acceptedFiles);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const failedFiles = [];

      const filesWithMetadata: { file: File, metadata: ProtoPhoto }[] = []

      for (const file of acceptedFiles) {
        const { valid, type, tags } = await validateFileForUpload(file);

        if (!valid) {
          console.log(`File ${file.name} is not a valid image type`);
          failedFiles.push(file);
          continue;
        }

        const latitude = tags["GPSLatitude"]?.description as number | undefined;
        const longitude = tags["GPSLongitude"]?.description as
          | number
          | undefined;

        let location = null;

        if (latitude && longitude) {
          location = `${latitude}/${longitude}`;
          if (tags["GPSAltitude"]?.description) {
            location += `/${tags["GPSAltitude"].description.split(" ")[0]}`;
          }
        }

        let date: string | Date | undefined = tags["DateTime"]?.description;
        if (!date) {
          date = moment(file.lastModified).toDate();
        } else {
          date = moment(date, "YYYY:MM:DD HH:mm:ss").toDate();
        }

        const protoFile: ProtoPhoto = {
          filename: file.name,
          location: location,
          alias: null,
          compressed: 0,
          size: file.size,
          googleId: null,
          date: date,
          type: `image/${type}`,
        };

        console.log("ProtoFile:", protoFile);
        filesWithMetadata.push({ file, metadata: protoFile });
      }

      mutate(filesWithMetadata);
    },
    [mutate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Photos">
      <div className="flex flex-col gap-3">
        <div {...getRootProps()} className="border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-6">
        {isPending && <p>Uploading...</p>}
          {!isPending && (
            <>
              <input {...getInputProps()} accept=".jpg, .jpeg, .png, .raw, .tiff, .nef, .webp" />
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
  const validTypes = ["jpeg", "jpg", "png", "raw", "tiff", "nef", "webp"];
  const tags = await ExifReader.load(file);

  if (!validTypes.includes(tags['FileType'].value)) {
    return { valid: false, type: tags['FileType'].value, tags };
  }

  return { valid: true, type: tags['FileType'].value, tags };
}
