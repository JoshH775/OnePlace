import ConfirmationModal from "@frontend/components/modals/ConfirmationModal";
import PhotoGallery from "@frontend/components/PhotoGallery";
import Button from "@frontend/components/ui/Button";
import Spinner from "@frontend/components/ui/Spinner";
import api from "@frontend/utils/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function CollectionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  if (!id) {
      navigate("/collections");
  }

  const { data, isError } = useSuspenseQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      const collection = await api.collections.getCollectionById(parseInt(id!));
      const photos = await api.collections.getPhotosForCollection(parseInt(id!));

      return { collection, photos };
    }
  });

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: async () => api.collections.deleteCollection(id!)
  });

  const deleteCollection = async () => {
    toast.loading("Deleting collection...");
    const { success, error } = await deleteMutation();

    if (!success || error) {
      toast.error("Error deleting collection");
      return;
    }

    toast.dismiss();
    toast.success("Collection deleted");
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    navigate("/collections");
  }
    
    


  return (
    <Suspense fallback={<Spinner />}>
      {isError || !data.collection ? (
        <div className="flex-grow flex justify-center items-center font-bold text-3xl w-full">
          Collection not found!
        </div>
      ) : (
        <div className="w-full flex-grow flex flex-col p-5">
        <ConfirmationModal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={deleteCollection} />

            <span className="justify-between w-full">
            <p className="text-3xl font-bold indigo-underline mb-3">
            {data.collection.name}
          </p>
          <Button
            variant="danger"
            className="!w-fit rounded-md"
            onClick={() => {setConfirmModalOpen(true)}}
            ><Trash2 className="h-6 w-6 text-white" /> Delete Collection </Button>
            </span>

          <p className="dark:text-subtitle-dark text-subtitle-light mb-2">
            {data.collection.description}
          </p>

          <PhotoGallery
            photos={data.photos}
            selectMode={false}
        />
        </div>
      )}
    </Suspense>
  );
}
