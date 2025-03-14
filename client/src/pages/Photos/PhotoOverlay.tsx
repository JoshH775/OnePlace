import AddToCollectionModal from "@frontend/components/modals/AddToCollectionModal";
import IconButton from "@frontend/components/ui/IconButton";
import Toolbar from "@frontend/components/ui/Toolbar";
import api from "@frontend/utils/api";
import { Photo } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { OverlayRenderProps } from "react-photo-view/dist/types";

type Props = {
  overlayProps: OverlayRenderProps;
  photo: Photo;
};

export default function PhotoOverlay({ overlayProps, photo }: Props) {
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: updatePhoto } = useMutation({
    mutationFn: async (updatedPhoto: Photo) => {
        toast.loading("Updating photo...");
        await api.req(`/photos/${photo.id}`, {
            method: "PUT",
            body: {
                ...updatedPhoto,
            }
        });
        toast.dismiss();
        toast.success("Photo updated!");
    },
  });

  const { mutate: deletePhoto } = useMutation({
    mutationFn: async () => {
      toast.loading("Deleting photo...");
      await api.req(`/photos/${photo.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.dismiss();
      toast.success("Photo deleted!");
    },
  });

  return (
    <>
      <AddToCollectionModal
        isOpen={collectionModalOpen}
        photos={[photo]}
        onClose={() => setCollectionModalOpen(false)}
      />

      {overlayProps.overlayVisible && (
        <div className={` absolute z-20 h-full flex flex-col w-full`}>
          <motion.div
            id="image-header"
            className="flex justify-between items-center text-black dark:text-white bg-white/90 dark:bg-onyx-light/80 shadow-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="gap-2">
              <p>
                ({overlayProps.index + 1} / {overlayProps.images.length})
              </p>
              <p>•</p>
              <p>{photo.filename}</p>
            </span>
            <button onClick={overlayProps.onClose}>Close</button>
          </motion.div>

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 100 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="absolute bottom-10 left-[50%] w-full flex justify-between items-center "
          >
            <Toolbar isOpen className="static">
              <IconButton
                icon={<Plus className="w-7 h-" />}
                onClick={() => {
                  setCollectionModalOpen(true);
                  console.log("ehehehehehe");
                }}
              />
              <IconButton
                icon={<Trash className="w-7 h-7" />}
                onClick={deletePhoto}
              />
            </Toolbar>
          </motion.div>
        </div>
      )}
    </>
  );
}
