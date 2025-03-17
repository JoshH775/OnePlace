import IconButton from "@frontend/components/ui/IconButton";
import api from "@frontend/utils/api";
import { Photo } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, X, ZoomIn, ZoomOut } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { OverlayRenderProps } from "react-photo-view/dist/types";
import PhotoInfoPanel from "./PhotoInfoPanel";

type Props = {
  overlayProps: OverlayRenderProps;
  photo: Photo | null;
};

export default function PhotoOverlay({ overlayProps, photo }: Props) {
  const [editPanelOpen, setEditPanelOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: deletePhoto } = useMutation({
    mutationFn: async () => {
      toast.loading("Deleting photo...");
      await api.req(`/photos/${photo!.id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      console.log("onSuccesss");
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      toast.dismiss();
      toast.success("Photo deleted!");
    },
  });

  if (!photo) return null;

  return (
    <>
      {overlayProps.overlayVisible && (
        <div
          className={` absolute z-[20] h-full touch-none flex flex-col w-full pointer-events-none`}
        >
          <motion.div
            id="image-header"
            className="flex justify-between items-center text-black dark:text-white bg-white/90 dark:bg-onyx-light/80 shadow-lg p-4 pointer-events-auto"
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
              />
              <IconButton
                icon={<ZoomOut className="w-6 h-6" />}
                onClick={() => {
                  overlayProps.onScale(-2);
                }}
              />

              <IconButton
                icon={<Info className="w-6 h-6" />}
                onClick={() => setEditPanelOpen(!editPanelOpen)}
              />
              <IconButton
                icon={<X className="w-6 h-6" />}
                onClick={overlayProps.onClose}
              />
            </span>
          </motion.div>

          <PhotoInfoPanel photo={photo} isOpen={editPanelOpen} />
        </div>
      )}
    </>
  );
}
