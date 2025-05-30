import IconButton from "@frontend/components/ui/IconButton";
import api from "@frontend/utils/api";
import { Photo } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { OverlayRenderProps } from "react-photo-view/dist/types";
import PhotoInfoPanel from "./PhotoInfoPanel/PhotoInfoPanel";
import ConfirmationModal from "@frontend/components/modals/ConfirmationModal";

type Props = {
  overlayProps: OverlayRenderProps;
  photo: Photo | null;
};

export default function PhotoOverlay({ overlayProps, photo }: Props) {
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const queryClient = useQueryClient();

  sessionStorage.setItem("photoId", photo!.id.toString());

  const { mutateAsync } = useMutation({
    mutationFn: async () => api.photos.deletePhoto(photo!.id),
  })

  //Prefetching the photo tags in case the user wants to see them
  queryClient.prefetchQuery({
    queryKey: ["photoTags", photo?.id],
    queryFn: () => api.photos.getTagsForPhoto(photo!.id),
  })


  // For later
  // queryClient.prefetchQuery({
  //   queryKey: ["photoCollections", photo?.id],
  //   queryFn: () => api.photos.getCollectionsForPhoto(photo!.id),
  // })

  

  if (!photo) return null;

  const deletePhoto = async () => {
    toast.loading("Deleting photo...");
    const { success, error } = await mutateAsync();

    if (!success || error) {
      toast.error("Error deleting photo");
      return;
    }

    toast.dismiss();
    toast.success("Photo deleted");
    queryClient.invalidateQueries({ queryKey: ["photos"] });
  }

  return (
    <>
      {overlayProps.overlayVisible && (
        <div
          className={` absolute z-[20] h-full touch-none flex flex-col w-full pointer-events-none`}
        >
          <ConfirmationModal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={() => {
            deletePhoto();
            overlayProps.onClose();}}
           />
          <motion.div
            id="image-header"
            className="flex justify-between items-center text-white bg-onyx-light/80 shadow-lg p-4 pointer-events-auto"
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

            <span className="gap-2">
              <IconButton
                icon={<ZoomIn className="w-6 h-6" />}
                onClick={() => {
                  overlayProps.onScale(2);
                }}
                className="text-white hover:bg-onyx-light"
              />
              <IconButton
                icon={<ZoomOut className="w-6 h-6" />}
                onClick={() => {
                  overlayProps.onScale(-2);
                }}
                className="text-white hover:bg-onyx-light"

              />

              <IconButton
                icon={<Info className="w-6 h-6" />}
                onClick={() => setEditPanelOpen(!editPanelOpen)}
                className="text-white hover:bg-onyx-light"

              />
              <IconButton
                icon={<X className="w-6 h-6" />}
                onClick={overlayProps.onClose}
                className="text-white hover:bg-onyx-light"
              />

              <IconButton
                icon={<Trash2 className="w-6 h-6" />}
                onClick={() => setConfirmModalOpen(true)}
                className="text-white hover:bg-onyx-light"
              />
            </span>
          </motion.div>

          <PhotoInfoPanel photo={photo} isOpen={editPanelOpen}  />
        </div>
      )}
    </>
  );
}
