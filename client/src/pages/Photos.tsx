import { Input } from "@headlessui/react";
import { useState } from "react";
import IconButton from "../components/ui/IconButton";
import { ArrowsUpDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

export default function Photos(){
    const [searchInput, setSearchInput] = useState("")
    
    return (
        <div className="content flex-col !justify-start p-4">

            <div id='tools' className="flex items-center w-full">
                    <Input
                name="search"
                type="text"
                placeholder="Search all photos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl p-2 px-4 outline-none text-base border border-gray-300 dark:border-onyx-light"
            />

            <IconButton icon={<ArrowsUpDownIcon className="h-10 p-2"/>} onClick={() => console.log('sort')} className="ml-2" />
            <IconButton icon={<FunnelIcon className="h-10 p-2"/>} onClick={() => console.log('filter')}  />
            </div>
        </div>
    )
}