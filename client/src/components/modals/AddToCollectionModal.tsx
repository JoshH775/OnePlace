import { Field } from "@headlessui/react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import LabelledInput from "../ui/LabelledInput";
import { Collection, Photo } from "@shared/types";
import api from "@frontend/utils/api";
import Spinner from "../ui/Spinner";
import { useQuery } from "@tanstack/react-query";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState } from "react";

type AddToCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
};

export default function AddToCollectionModal({
  isOpen,
  onClose,
  photos,
}: AddToCollectionModalProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection>();
  const [query, setQuery] = useState("");

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => api.getCollections(),
    enabled: isOpen,
  });

  const filteredCollections = collections?.filter((collection) =>
    collection.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const collection = (
      e.currentTarget.elements.namedItem("collection") as HTMLInputElement
    ).value;
    console.log("Add to collection", collection);

    onClose();
  };

  return (
    <Modal title="Add to Collection" isOpen={isOpen} onClose={onClose}>
      {isLoading && <Spinner />}
      <form className="w-full" onSubmit={handleSubmit}>
        <Combobox
          value={selectedCollection}
          onChange={(value) => setSelectedCollection(value ?? undefined)}
          onClose={() => setQuery("")}
        >
          <ComboboxInput
            placeholder="Search for collection..."
            className="w-full p-2 border dark:border-onyx-light rounded-md"
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <ComboboxOptions className="w-full p-2 dark: bg-onyx-light mt-2 rounded-lg">
            {filteredCollections?.map((collection) => (
              <ComboboxOption key={collection.id} value={collection}>
                {collection.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>

        <Button type="submit" className="w-full mt-2">
          Add to collection
        </Button>
      </form>
    </Modal>
  );
}
