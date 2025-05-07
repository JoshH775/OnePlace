import Modal from "../ui/Modal";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "../../utils/api";
import ExifReader from "exifreader";
import toast from "react-hot-toast";
import { ProtoPhoto } from "@shared/types";
import { useAuth } from "../AuthProvider";
import _ from "lodash";
import { CHUNK_SIZE, TimestampFormat } from "@shared/constants";
import moment from "moment";

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
      acceptedFiles: { file: File; metadata: ProtoPhoto }[]; // Array of files with their metadata
      compress: boolean; // Whether to compress files before upload
    }) => {
      // Calculate the total size of all files
      const totalSize = acceptedFiles.reduce(
        (acc, { file }) => acc + file.size,
        0
      );

      // If the total size exceeds the chunk size, split the files into chunks
      if (totalSize > CHUNK_SIZE) {
        const chunks = _.chunk(
          acceptedFiles,
          Math.ceil(acceptedFiles.length / 2) // Split into two chunks
        );

        // Upload each chunk in parallel and wait for all to complete
        const results = await Promise.allSettled(
          chunks.map((chunk) => api.photos.uploadPhotos(chunk, compress))
        );

        // Check if all uploads were successful
        const allSuccess = results.every(
          (result) => result.status === "fulfilled"
        );
        return allSuccess;
      } else {
        // If total size is within the limit, upload all files at once
        return api.photos.uploadPhotos(acceptedFiles, compress);
      }
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      toast.loading("Preparing photos for upload...");

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

      toast.dismiss();
      toast.loading("Uploading photos ...");
      const success = await mutateAsync({
        acceptedFiles: filesWithMetadata,
        compress,
      });

      if (success) {
        toast.dismiss();
        toast.success("Photos uploaded successfully");
        queryClient.invalidateQueries({ queryKey: ["photos"] });
        onClose();
      }
    },
    [mutateAsync, compress, queryClient, onClose]
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

/**
 * Parses metadata from a given file and validates it for upload.
 *
 * @param file - The file to be parsed and validated.
 * @returns A promise that resolves to an object containing:
 *          - `valid`: A boolean indicating whether the file is valid for upload.
 *          - `metadata`: A `ProtoPhoto` object containing the parsed metadata if valid, or `null` if invalid.
 *
 * The metadata includes:
 * - `filename`: The name of the file.
 * - `location`: A string representing the GPS coordinates (latitude/longitude/altitude) if available, or `null`.
 * - `alias`: Always `null` (reserved for future use).
 * - `compressed`: A boolean indicating whether the file is compressed (always `false`).
 * - `size`: The size of the file in bytes.
 * - `date`: The formatted date the photo was taken, or `null` if unavailable or invalid.
 * - `type`: The MIME type of the file (e.g., `image/jpeg`).
 *
 * The function uses EXIF tags to extract GPS and date information, and validates the date using predefined formats.
 */
async function parseFileMetadata(
  file: File
): Promise<{ valid: boolean; metadata: ProtoPhoto | null }> {
  const { valid, type, tags } = await validateFileForUpload(file);

  if (!valid) {
    return { valid, metadata: null };
  }

  const latitude = tags["GPSLatitude"]?.description as number | undefined;
  const longitude = tags["GPSLongitude"]?.description as number | undefined;

  console.log(tags);

  let location = null;

  if (latitude && longitude) {
    location = `${latitude}/${longitude}`;
    if (tags["GPSAltitude"]?.description) {
      location += `/${tags["GPSAltitude"].description.split(" ")[0]}`;
    }
  }

  let date = null;
  const dateTaken = tags["DateTimeOriginal"] || tags["DateCreated"];

  const possibleFormats = ["YYYY:MM:DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss.SS"];

  if (dateTaken) {
    const parsedDate = moment(dateTaken.description, possibleFormats, true);
    if (parsedDate.isValid()) {
      date = parsedDate.format(TimestampFormat);
    }
  }

  const metadata: ProtoPhoto = {
    filename: file.name,
    location: location,
    alias: null,
    compressed: false,
    size: file.size,
    date: date || null,
    type: `image/${type}`,
  };

  return { valid, metadata };
}
