import Modal from "../ui/Modal";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import api from "../../utils/api";
import ExifReader from 'exifreader';

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadPhotosModal({isOpen, onClose}: Props) {

    const queryClient = useQueryClient();


    const { mutate, isPending } = useMutation({
        mutationFn: (acceptedFiles: File[]) => {
            queryClient.invalidateQueries({queryKey: ["photos"]})
            return api.uploadPhotos(acceptedFiles)
        },
    })

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        
        for (const file of acceptedFiles) {
            if (!file.type.startsWith("image/")) {
                alert("Only images are allowed")
            }
            const tags = await ExifReader.load(file);
            console.log(tags);



        }
        

        mutate(acceptedFiles)
    }, [mutate])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Photos">
            <div className="flex flex-col gap-3">
                <div {...getRootProps()}>
                    <input {...getInputProps()} accept=".jpg, .jpeg, .png, .raw" />
                    <div className="border border-dashed border-gray-300 dark:border-onyx-light rounded-md p-6">
                        {isDragActive ? (
                            <p>Drop the files here ...</p>
                        ) : (
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}