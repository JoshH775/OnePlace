import { ArrowUpTrayIcon } from "@heroicons/react/24/outline"
import Button from "../components/ui/Button"
import { GoogleIcon, DropboxIcon, OneDriveIcon } from "../components/ui/CustomIcons"


export default function Home() {


    const noPhotos = true

    return (
        <div className="content">
            {noPhotos && <div className="flex flex-col items-center justify-center gap-3 border border-gray-300 dark:border-onyx-light h-fit w-1/2 rounded-md p-12 max-w-[575px]">
                <h1 className="text-2xl font-bold">No Photos Yet</h1>
                <p className="text-center">Import your photos from cloud services or upload them directly to get started!</p>

                <Button onClick={() => { }} variant="outlined">
                    <GoogleIcon className="h-7"/>
                    Import from Google Photos
                </Button>

                <Button onClick={() => { }} variant="outlined">
                    <DropboxIcon className="h-7"/>
                    Import from Dropbox
                </Button>

                <Button onClick={() => { }} variant="outlined">
                    <OneDriveIcon className="h-7"/>
                    Import from OneDrive
                </Button>
                
                <hr/>

                <Button onClick={() => { }} >
                    <ArrowUpTrayIcon className="h-7"/>
                    Upload Photos
                </Button>
            </div>}

        </div>
    )
}
