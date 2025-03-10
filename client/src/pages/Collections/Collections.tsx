import CreateCollectionModal from "@frontend/components/modals/CreateCollectionModal";
import Button from "@frontend/components/ui/Button";
import IconButton from "@frontend/components/ui/IconButton";
import api from "@frontend/utils/api";
import { FolderOpenIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import NoCollections from "./NoCollections";
import { Collection } from "@shared/types";
import moment from "moment";
import { Input } from "@headlessui/react";
import _ from "lodash";

export default function Collections() {


  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);

  const [query, setQuery] = useState("");

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections", query],
    queryFn: () => api.getCollections(query),
  });

  const CollectionCard = ({ collection }: { collection: Collection }) => {
    return (
        <div className="flex flex-grow flex-col w-full dark:border-onyx-light border rounded-md hover:border-indigo hover:text-indigo transition duration-200">
            <img src={`/api/photos/${collection.coverPhotoId}?thumbnail=true`} alt={collection.name} className="w-full h-40 object-cover rounded-t-md" />
            <div className="p-4">
                <p className="text-lg font-semibold">{collection.name}</p>
                <p className="text-sm text-gray-500 dark:text-subtitle-dark">{collection.description}</p>
            </div>
            <span className="p-2 py-1 gap-2 border-t border-onyx-light dark:text-subtitle-dark">
                <FolderOpenIcon className="h-4" />
                Created {moment(collection.createdAt).format('LL')}</span>
        </div>
    )
  }

  const debounceQuery = _.debounce((value: string) => setQuery(value), 500);

  return (
    <div className="p-5 w-full flex-grow flex flex-col">
      <CreateCollectionModal
        isOpen={createCollectionModalOpen}
        onClose={() => setCreateCollectionModalOpen(false)}
      />


      <div className="flex justify-between items-center p-2">
        <p className="font-bold indigo-underline text-3xl">Collections</p>
        <Input
          name="search"
          type="text"
          placeholder="Search collections..."
          onChange={(e) => debounceQuery(e.target.value)}
          className=" flex-grow mx-4 rounded-xl p-2 px-4 outline-transparent focus:outline-indigo text-base border border-gray-300 dark:border-onyx-light"
        />
        
        <Button
          className="bg-indigo rounded-md !w-fit"
          onClick={() => setCreateCollectionModalOpen(true)}
        >
          Create Collection
          <PlusIcon className="h-5 w-5 fill-white stroke-white text-white" />
        </Button>
      </div>

      {!isLoading && (!collections || collections.length === 0) && (
        <NoCollections />
      )}

      {/* Render collections here if there are any */}
      {collections && collections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
            ))}
            <div className="flex flex-grow flex-col w-full justify-center items-center border-dashed border-onyx-light hover:border-indigo transition duration-200 border-2 rounded-md p-6">
                <p className="text-lg font-semibold">Create a new collection</p>
                <IconButton icon={<PlusIcon className="w-9 p-1" />} onClick={() => setCreateCollectionModalOpen(true)} className=" p-1 m-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Click the button above to create your first collection</p>
            </div>  
        </div>
      )}
    </div>
  );
}