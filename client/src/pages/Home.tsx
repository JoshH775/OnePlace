import { ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import Button from "../components/ui/Button"
import { GoogleIcon, DropboxIcon, OneDriveIcon } from "../components/ui/CustomIcons"
import { importFromGoogle } from "../utils/googleUtils"
import { useState } from "react"
import UploadPhotosModal from "../components/modals/UploadPhotosModal"


export default function Home() {

    const [uploadModalOpen, setUploadModalOpen] = useState(false)

    const noPhotos = true


    const toggleUploadModal = () => {
        console.log("toggle")
        setUploadModalOpen(!uploadModalOpen)
        console.log(uploadModalOpen)
    }

    return (
        <div className="content w-full">
            <UploadPhotosModal isOpen={uploadModalOpen} onClose={toggleUploadModal} />

            {noPhotos && <div className="flex flex-col items-center justify-center gap-3 border border-gray-300 dark:border-onyx-light h-fit w-1/2 rounded-md p-12 max-w-[575px]">
                <h1 className="text-2xl font-bold">No Photos Yet</h1>
                <p className="text-center">Import your photos from cloud services or upload them directly to get started!</p>

                <Button onClick={importFromGoogle} variant="outlined">
                    <GoogleIcon className="h-7"/>
                    Import from Google Photos
                </Button>

                <Button onClick={() => { }} variant="outlined" disabled>
                    <DropboxIcon className="h-7"/>
                    Import from Dropbox
                </Button>

                <Button onClick={() => { }} variant="outlined" disabled>
                    <OneDriveIcon className="h-7"/>
                    Import from OneDrive
                </Button>
                
                <div className="flex items-center gap-3 w-full">
                    <hr className="w-1/2"/>
                    <p className="text-gray-500">OR</p>
                    <hr className="w-1/2"/>
                </div>

                <Button onClick={toggleUploadModal} >
                    <ArrowUpTrayIcon className="h-7"/>
                    Upload Photos
                </Button>
            </div>}

        </div>
    )
}
