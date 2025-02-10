import { Input } from "@headlessui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar(){

    const [searchInput, setSearchInput] = useState("")

    console.log(searchInput)

    const filterKeys = [
        'name',
        'date',
        'location',
        'fileType',
    ]


    const navigate = useNavigate();
    return (
        <Input
        name="search"
        type="text"
        placeholder="Search all photos..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full rounded-3xl p-2 px-4 outline-none text-base border border-gray-300 dark:border-onyx-light"
        onClick={() => navigate("/")}
      />
    )
}