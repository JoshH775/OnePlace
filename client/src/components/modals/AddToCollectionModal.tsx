import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@frontend/utils/api";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { Collection, Photo } from "@shared/types";
import Input from "../ui/Input";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import toast from "react-hot-toast";

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
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [query, setQuery] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => api.getCollections(),
    enabled: isOpen,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (photoIds: number[]) =>
      api.addPhotosToCollection(selectedCollection!.id.toString(), photoIds),
  })

  const filteredCollections =
    collections?.filter((collection) => {
      return (
        collection.name.toLowerCase().includes(query.toLowerCase()) ||
        collection.description?.toLowerCase().includes(query.toLowerCase())
      );
    }) || [];


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCollection) {
      toast.error("Please select a collection");
      return;
    }

    const photoIds = photos.map((photo) => photo.id);
    const promise = mutateAsync(photoIds);

    toast.promise(promise, {
      loading: "Adding photos to collection...",
      success: "Photos added to collection",
      error: "Failed to add photos to collection",
    });

    onClose();


  };

  const handleSelectCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setQuery(collection.name);
  }

  const handleBlur = () => {
    setResultsVisible(false);
    if (selectedCollection) {
      setQuery(selectedCollection.name);
  }}

  return (
    <Modal title="Add to Collection" isOpen={isOpen} onClose={onClose}>
      {isLoading && <Spinner />}
      <form className="w-full" onSubmit={handleSubmit}>
        <Input
          placeholder="Search collections"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setResultsVisible(true)}
          onBlur={handleBlur}
        />

        <AnimatePresence>
          {resultsVisible && filteredCollections && filteredCollections.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full dark:bg-onyx-gray rounded-lg flex flex-col gap-2 shadow-xl border dark:border-none border-light"
            >
              {filteredCollections.map((collection) => {
                const isSelected = selectedCollection?.id === collection.id;
                return <span key={collection.id} className="p-2 justify-between cursor-pointer hover:dark:bg-onyx-light hover:bg-light rounded-lg" onClick={() => handleSelectCollection(collection)}>
                  {collection.name}
                {isSelected && <Check className="w-5 h-5" />}</span>
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" className="w-full mt-2" disabled={isPending}>
          Add to collection
        </Button>
      </form>
    </Modal>
  );
}
