import { Input } from "@headlessui/react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { TabPanel, Tabs } from "../ui/Tabs";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/api";

type Props = {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadPhotosModal({isOpen, onClose}: Props) {
    const [selectedTab, setSelectedTab] = useState(0);

    const queryClient = useQueryClient();

    const urlRef = useRef<HTMLInputElement>(null);

    const { mutate, isPending } = useMutation({
        mutationFn: uploadPhotos
    })

    async function uploadPhotos() {
        console.log("Uploading photos...")
        if (selectedTab === 0) {
            console.log("Uploading from file...")
            
        } else {
            console.log("Uploading from link...")

            if (urlRef.current?.value){
                await api.uploadPhotoFromUrl(urlRef.current.value)
                queryClient.invalidateQueries({ queryKey: ["photos"] })
                onClose()
            } else {
                console.error("No URL provided")
            }
        }

    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Photos">
            <div className="flex flex-col gap-3">
                <Tabs tabs={["File Upload", "Link"]} selectedTab={selectedTab} onTabChange={setSelectedTab}>
                    <TabPanel className="min-h-38">
                        <input type="file" />
                    </TabPanel >
                    <TabPanel className="min-h-38">
                        <Input type="text" placeholder="Paste link here..." className='w-full p-2 rounded-md' ref={urlRef}/>
                    </TabPanel>
                <Button onClick={mutate} className="mt-4" disabled={isPending}>Upload</Button>

                </Tabs>
            </div>
        </Modal>
    )
}