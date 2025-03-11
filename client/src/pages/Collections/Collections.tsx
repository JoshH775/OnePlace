import CreateCollectionModal from "@frontend/components/modals/CreateCollectionModal";
import Button from "@frontend/components/ui/Button";
import api from "@frontend/utils/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import NoCollections from "./NoCollections";
import { Collection } from "@shared/types";
import moment from "moment";
import { Input } from "@headlessui/react";
import _ from "lodash";
import {motion} from "motion/react"
import { FolderOpen, Plus } from "lucide-react";
import Header from "@frontend/components/Header";

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col w-full dark:border-onyx-light border rounded-md">
    <div className="w-full h-40 bg-gray-300 dark:bg-onyx rounded-t-md"></div>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-gray-300 dark:bg-onyx rounded"></div>
      <div className="h-4 bg-gray-300 dark:bg-onyx rounded w-2/3"></div>
    </div>
  </div>
)

const CollectionCard = ({ collection, index }: { collection: Collection, index: number }) => {
  console.log('Rendering collection card', collection);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex flex-grow flex-col w-full "
    >
      <div className="shadow-lg dark:shadow-none border border-gray-300  dark:border-onyx-light rounded-md hover:border-indigo hover:text-indigo transition-all duration-200 ">
      <img
        src={`/api/photos/${collection.coverPhotoId ?? 216}?thumbnail=true`}
        alt={collection.name}
        className="w-full h-40 object-cover rounded-t-md"
      />
      <div className="p-4">
        <p className="text-lg font-semibold">{collection.name}</p>
        <p className="text-sm text-subtitle-light dark:text-subtitle-dark">
          {collection.description || 'No description'}
        </p>
      </div>
      <span className="p-2 py-1 gap-2 border-t dark:border-onyx-light border-light dark:text-subtitle-dark text-subtitle-light">
        <FolderOpen className="h-4" />
        Created {moment(collection.createdAt).format("LL")}
      </span>
      </div>
    </motion.div>
  )
}

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
        <CollectionCard key={collection.id} collection={collection} index={idx} />
      ))}
    </div>
  ) : (
    <NoCollections />
  )
)}

    </div>
  );
}