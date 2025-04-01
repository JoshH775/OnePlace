import api from "@frontend/utils/api";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
} from "@headlessui/react";
import {
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Suspense, useState } from "react";
import {  ChevronsUpDown, Search } from "lucide-react";
import { Input } from "@headlessui/react";
import { Collection } from "@shared/types";

type Props = {
  selectedCollectionIds?: number[]
  onToggle: (collection: Collection) => void;
};

export default function CollectionsPopover({
  selectedCollectionIds = [],
  onToggle,
}: Props) {

  const [query, setQuery] = useState("");

  const { data: collections } = useSuspenseQuery({
    queryKey: ["collections"],
    queryFn: () => api.collections.getCollections(),
  });

  const filteredCollections =
    collections.filter(
      (collection) =>
        collection.name.includes(query) ||
        collection.description?.includes(query)
    ) || [];

    const CollectionItem = ({collection}: { collection: Collection}) => {
      const checked = !!selectedCollectionIds.find((c) => c === collection.id)


      return (<div
      key={collection.id}
      className="w-full font-semibold cursor-pointer flex justify-between p-2  hover:dark:bg-onyx-light rounded-md"
      onClick={() => {onToggle(collection)}}
    >
      {collection.name}
      <Input type="checkbox" className="p-2" checked={checked} readOnly />
    </div>)


    }

  return (
    <Popover className="relative">
      <PopoverButton className="w-full bg-indigo text-white data-[hover]:bg-indigo-700 flex justify-between px-4 py-2 rounded-md items-center font-semibold">
        {selectedCollectionIds.length > 0
          ? `${selectedCollectionIds.length} collections selected`
          : "Select collections..."}
        <ChevronsUpDown className="w-4 h-4" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom"
        className="flex flex-col border shadow-md border-gray-300 dark:border-onyx-light mt-2 bg-white dark:bg-onyx-gray  pt-0 rounded-md items-center !w-[var(--button-width)] transition duration-200 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0"
        transition
      >
        <span
          className="w-full border-b 
        border-gray-300 dark:border-onyx-light px-2 py-2 gap-2"
        >
          <Search className="w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Collections..."
            className="w-full lr-2 py-1 px-0.5 rounded-md"
          />
        </span>

        <Suspense fallback={<p>Loading...</p>}>
          <div className="p-2 flex flex-col w-full">
            {filteredCollections.map((collection) => (
              <CollectionItem key={collection.id} collection={collection} />
            ))}
          </div>
        </Suspense>
      </PopoverPanel>
    </Popover>
  );
}
