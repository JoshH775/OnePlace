import ConfirmationModal from "@frontend/components/modals/ConfirmationModal";
import PhotoGallery from "@frontend/components/PhotoGallery";
import Button from "@frontend/components/ui/Button";
import Spinner from "@frontend/components/ui/Spinner";
import api from "@frontend/utils/api";
import { Collection } from "@shared/types";
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
      const response = await api.req(`/collections/${id}`);
      if (response.status !== 200 || !response.data) return null

      const collection = response.data as Collection;

      const photos = await api.getPhotos({ collectionId: parseInt(id!) });
      return { collection, photos };
    },
  });

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: async () => {
        toast.loading('Deleting collection...')
        const { status } = await api.req(`/collections/${id}`, { method: "DELETE" });
        console.log(status, 'status')
        if (status !== 200) {
            toast.error('Error deleting collection')
            throw new Error("Error deleting collection");
        }
        else {
            console.log('returning status')
            return status
        }

    },
    onSuccess: () => {
            console.log('RJARJAJRAJRJARJA')
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Collection deleted!");
            navigate("/collections");
    }})

    
    


  return (
    <Suspense fallback={<Spinner />}>
      {isError || !data ? (
        <div className="flex-grow flex justify-center items-center font-bold text-3xl w-full">
          Collection not found!
        </div>
      ) : (
        <div className="w-full flex-grow flex flex-col p-5">
        <ConfirmationModal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={deleteMutation} />

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
