import Button from "@frontend/components/ui/Button";
import { Photo, UpdatablePhotoProperties } from "@shared/types";
import {
  Box,
  Calendar,
  CalendarFold,
  MapPin,
  Save,
  SquarePen,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import moment from "moment";
import { useState } from "react";
import Input from "@frontend/components/ui/Input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@frontend/utils/api";
import toast from "react-hot-toast";
import { TimestampFormat } from "@shared/constants";

type Props = {
  photo: Photo;
  isOpen: boolean;
};

type FieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  edit: boolean;
  type?: "text" | "location" | "date";
  onClick?: () => void;
};

const Field = ({
  label,
  icon,
  value,
  edit,
  onClick,
  type = "text",
}: FieldProps) => {
  const [input, setInput] = useState(value);

  if (!edit && type === "date") {
    value = moment(value).format("LLL");
  }

  return (
    <div
      className={`flex w-full gap-3 items-center mb-2 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={!edit ? onClick : undefined}
    >
      {icon}
      <div className="flex flex-col w-full">
        <p className="text-black font-semibold text-base">{label}</p>

        {!edit && <p className="text-subtitle-light text-sm">{value}</p>}

        {edit && (
          <Input
            id={label}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="!bg-white py-1 !m-0 field-input"
            type={type === "date" ? "datetime-local" : undefined}
          />
        )}

        {edit && type === "location" && (
          <p className="text-sm text-subtitle-light">
            🛈 Format: Latitude/Longitude (e.g., 35.6895/139.6917)
          </p>
        )}
      </div>
    </div>
  );
};

export default function PhotoInfoPanel({ photo, isOpen }: Props) {
  const [editMode, setEditMode] = useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: async (photo: Photo) => {
      const { status } = await api.req("/photos", {
        method: "PUT",
        body: { photo },
      });

      if (status !== 201) {
        throw Error("Photo update failed");
      }

      return photo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });

  const savePhoto = () => {
    setEditMode(false);
    const elements = Array.from(
      document.querySelectorAll<HTMLInputElement>(".field-input")
    );

    const labelMap: Record<string, keyof UpdatablePhotoProperties> = {
      "Date Taken": "date",
      Location: "location",
      filename: "filename",
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

    toast.promise(mutateAsync(updatedPhoto), {
      success: "Photo successfully updated!",
      loading: "Updating Photo...",
      error: "Update failed!",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
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

          <p className="font-semibold text-lg pb-1 w-full border-b border-subtitle-dark mb-4">
            Details
          </p>

          <Field
            icon={<CalendarFold className="text-subtitle-light w-5.5 h-5.5" />}
            label="Date Uploaded"
            value={photo.createdAt}
            edit={false}
            type="date"
          />

          {photo.date && (
            <Field
              icon={<Calendar className="text-subtitle-light w-5.5 h-5.5" />}
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
                const link = generateGoogleMapsLink(photo.location as string);
                anchor.href = link;
                anchor.target = "_blank";
                anchor.click();
                document.removeChild(anchor);
              }}
            />
          )}
        </motion.div>
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
