import Button from "@frontend/components/ui/Button";
import { Photo, UpdatablePhotoProperties } from "@shared/types";
import {
  Box,
  Calendar,
  CalendarFold,
  MapPin,
  Plus,
  Save,
  SquarePen,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import moment from "moment";
import { useState } from "react";
import Field from "./Field";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@frontend/utils/api";
import toast from "react-hot-toast";
import { TimestampFormat } from "@shared/constants";
import Tag from "./Tag";
import TagsModal from "@frontend/components/modals/TagsModal";

type Props = {
  photo: Photo;
  isOpen: boolean;
};

export default function PhotoInfoPanel({ photo, isOpen }: Props) {
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);

  const { data: photoTags } = useQuery({
    queryKey: ["photoTags", photo.id],
    queryFn: () => api.photos.getTagsForPhoto(photo.id),
  });

  const openModal = () => {
    //Prefetching the user tags in case the user wants to add to tags
    queryClient.prefetchQuery({
      queryKey: ["userTags"],
      queryFn: () => api.tags.getTagsForUser(),
    });
    setTagsModalOpen(true);
  };

  const { mutateAsync: updateMutation } = useMutation({
    mutationFn: async (photo: Photo) => api.photos.updatePhoto(photo),
  });

  const savePhoto = async () => {
    setEditMode(false);
    const elements = Array.from(
      document.querySelectorAll<HTMLInputElement>(".field-input")
    );

    const labelMap: Record<string, keyof UpdatablePhotoProperties> = {
      "Date Taken": "date",
      Location: "location",
    };

    const values: Record<string, string> = {};

    elements.forEach((element) => {
      switch (element.id) {
        case "Date Taken":
          values[labelMap[element.id]] = moment(element.value).format(
            TimestampFormat
          );
          break;
        default:
          values[labelMap[element.id]] = element.value;
      }
    });

    const updatedPhoto: Photo = {
      ...photo,
      ...values,
    };

    if (JSON.stringify(photo) === JSON.stringify(updatedPhoto)) {
      return;
    }

    const { success, error } = await updateMutation(updatedPhoto);

    if (!success || error) {
      toast.error("Error updating photo");
    } else {
      toast.success("Photo updated");
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <TagsModal
            isOpen={tagsModalOpen}
            currentTags={photoTags ?? []}
            onClose={() => setTagsModalOpen(false)}
          />
          <motion.div
            className="flex flex-col bg-white text-black h-full pointer-events-auto left-0 place-self-end w-90 p-4"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 100 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <span className="justify-between gap-4 mb-6">
              <div>
                <p className="text-xl font-bold">Photo Information</p>
                <p className="text-sm text-subtitle-light">{photo.filename}</p>
              </div>
              <Button
                onClick={editMode ? savePhoto : () => setEditMode(true)}
                variant="outlined"
                className="!text-black hover:!text-white !w-fit text-base"
              >
                <span className="gap-2">
                  {editMode ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <SquarePen className="w-4 h-4" />
                      Edit
                    </>
                  )}
                </span>
              </Button>
            </span>

            <div>
              <p className="font-semibold text-lg pb-1 w-full">Details</p>
              <hr className="mb-4" />

              <Field
                icon={
                  <CalendarFold className="text-subtitle-light w-5.5 h-5.5" />
                }
                label="Date Uploaded"
                value={photo.createdAt}
                edit={false}
                type="date"
              />

              {photo.date && (
                <Field
                  icon={
                    <Calendar className="text-subtitle-light w-5.5 h-5.5" />
                  }
                  label="Date Taken"
                  value={photo.date}
                  edit={editMode}
                  type="date"
                />
              )}

              <Field
                icon={<Box className="w-5.5 h-5.5 text-subtitle-light" />}
                label="File Size"
                value={`${convertSizeToLabel(photo.size).value} ${
                  convertSizeToLabel(photo.size).label
                }`}
                edit={false}
              />

              {photo.location && (
                <Field
                  icon={<MapPin className="w-5.5 h-5.5 text-subtitle-light" />}
                  label="Location"
                  value={formatLocation(photo.location)}
                  edit={editMode}
                  onClick={() => {
                    const anchor = document.createElement("a");
                    const link = generateGoogleMapsLink(
                      photo.location as string
                    );
                    anchor.href = link;
                    anchor.target = "_blank";
                    anchor.click();
                    document.removeChild(anchor);
                  }}
                />
              )}
            </div>

            {/* Tags */}
            <div>
              <span>
                <p className="font-semibold text-lg w-full">Tags</p>
                {editMode && photoTags && (
                  <Button
                    variant="outlined"
                    className="!text-black hover:!text-white !w-fit text-base  text-nowrap px-1 py-1"
                    onClick={openModal}
                  >
                    <Plus className="w-4 h-4" />
                    Add Tag
                  </Button>
                )}
              </span>
              <hr className="mb-4 mt-1" />

              <div className="flex w-full items-center gap-2 flex-wrap">
                {photoTags && photoTags.length > 0 &&
                  photoTags.map((tag) => (
                    <Tag tag={tag} edit={editMode} key={tag.name} />
                  ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function convertSizeToLabel(bytes: number) {
  if (bytes < 1024) {
    return { label: "bytes", value: bytes.toString() };
  } else if (bytes < 1024 * 1024) {
    return { label: "KB", value: (bytes / 1024).toFixed(2) };
  } else {
    return { label: "MB", value: (bytes / (1024 * 1024)).toFixed(2) };
  }
}

function generateGoogleMapsLink(location: string) {
  const coords = location.split("/");
  const lat = coords[0];
  const lng = coords[1];
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function formatLocation(location: string) {
  const coords = location.split("/");
  const lat = coords[0];
  const lng = coords[1];

  const formattedLat = lat.slice(0, lat.indexOf(".") + 4);
  const formattedLng = lng.slice(0, lng.indexOf(".") + 4);
  return `${formattedLat} / ${formattedLng}`;
}
