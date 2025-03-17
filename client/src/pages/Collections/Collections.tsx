import CreateCollectionModal from "@frontend/components/modals/CreateCollectionModal";
import Button from "@frontend/components/ui/Button";
import api from "@frontend/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import NoCollections from "./NoCollections";
import { Input } from "@headlessui/react";
import _ from "lodash";
import Header from "@frontend/components/Header";
import { Plus } from "lucide-react";
import CollectionTile from "./CollectionsTile";

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col w-full dark:border-onyx-light border rounded-md">
    <div className="w-full h-40 bg-gray-300 dark:bg-onyx rounded-t-md"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-onyx rounded"></div>
      <div className="h-4 bg-gray-300 dark:bg-onyx rounded w-2/3"></div>
    </div>
  </div>
)


export default function Collections() {


  const [createCollectionModalOpen, setCreateCollectionModalOpen] = useState(false);

  const [query, setQuery] = useState("");

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections", query],
    queryFn: () => api.getCollections(query),
    refetchOnWindowFocus: false,
  });

  const debounceQuery = _.debounce((value: string) => setQuery(value), 500);

  return (
    <div className=" p-5 w-full flex-grow flex flex-col">
      <CreateCollectionModal
        isOpen={createCollectionModalOpen}
        onClose={() => setCreateCollectionModalOpen(false)}
      />

  <Header>
    <p className="text-3xl font-bold indigo-underline">Collections</p>
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
          <Plus className="h-5 w-5 fill-white stroke-white text-white" />
        </Button>
  </Header> 

      {!isLoading && (!collections || collections.length === 0) && (
        <NoCollections />
      )}

{isLoading ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
    {Array.from({ length: 4 }).map((_, idx) => (
      <SkeletonCard key={idx} />
    ))}
  </div>
) : (
  collections && collections.length > 0 ? (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4"
    >
      {collections.map((collection, idx) => (
        <CollectionTile key={collection.id} collection={collection} index={idx} />
      ))}
    </div>
  ) : (
    <NoCollections />
  )
)}

    </div>
  );
}