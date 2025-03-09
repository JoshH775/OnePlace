import CreateCollectionModal from "@frontend/components/modals/CreateCollectionModal";
import api from "@frontend/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Collections() {

    const { data: collections, isLoading } = useQuery({
        queryKey: ["collections"],
        queryFn: () => api.getCollections(),
    });

    const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(true);


    return (
        <div className="content p-5 w-full">
            <CreateCollectionModal isOpen={createCollectionModalOpen} onClose={() => {setCreateCollectionModalOpen(false)}}/>
            <p className="font-bold indigo-underline text-4xl">Collections</p>
        </div>
    )
}