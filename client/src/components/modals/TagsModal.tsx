import { Tag } from "@shared/types";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { Suspense, useState } from "react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import api from "@frontend/utils/api";
import Spinner from "../ui/Spinner";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react"
import Button from "../ui/Button";


type Props = {
  isOpen: boolean;
  currentTags: Tag[];
  onClose: () => void;
};

const colors = {
    red: "#B22222",     // Firebrick
    orange: "#FF8C00",  // Dark Orange
    yellow: "#FFD700",  // Gold
    green: "#006400",   // Dark Green
    blue: "#1E90FF",    // Dodger Blue
    indigo: "#4f39f6",  // Original Indigo
    violet: "#9400D3",  // Dark Violet
  };

export default function TagsModal({ isOpen, onClose, currentTags }: Props) {
  const { data: userTags } = useSuspenseQuery({
    queryKey: ["userTags"],
    queryFn: () => api.tags.getTagsForUser(),
  });

  const photoId = Number(sessionStorage.getItem("photoId"));

  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedColor, setSelectedColor] =
    useState<keyof typeof colors>("red");

  const { mutateAsync: addTagMutation } = useMutation({
    mutationFn: async (data: { name: string; color?: string }) =>
      api.photos.addTagToPhoto(photoId, data),
  });

  const { mutateAsync: deleteTagMutation } = useMutation({
    mutationFn: async (tagId: number) =>
      api.tags.deleteTag(tagId),
  })

  const deleteTag = async (name: string) => {
    const tag = userTags?.find((tag) => tag.name === name);

    if (!tag) {
      toast.error("Tag not found");
      return;
    }


    const { success, error } = await deleteTagMutation(tag.id);
    
    if (!success || error ) {
      toast.error("Error deleting tag");
      return;
    }

    queryClient.setQueryData(["userTags"], (prev: Tag[]) => prev.filter(existingTag => existingTag.id !== tag.id));
  }

  const addTag = async (name: string, color?: string) => {
    if (!name) {
      toast.error("Tag name is required");
      return;
    }

    const allTags = await addTagMutation({ name, color });
    queryClient.setQueryData(["photoTags", photoId], allTags);

    const existing = userTags?.find((tag) => tag.name === name);
    if (!existing) {
      queryClient.setQueryData(
        ["userTags"],
        [...userTags, { name, color, id: allTags[allTags.length - 1].id }]
      );
    }
  };

  const createTag = async (name: string, color?: string) => {
    await addTag(name, color);
    setQuery("");
    onClose();
  };


  const TagItem = ({
    name,
    color,
    create = false
  }: {
    name: string
    color?: string
    create?: boolean
  }) => {

    return (
      <div className="flex items-center justify-between p-2 w-full">
        <span className="flex items-center gap-2">
          <div
            className="rounded-full w-4 h-4"
            style={{ backgroundColor: color || colors["indigo"] }}
          />
          <p>{name}</p>
        </span>
        {!create && <div className="flex items-center gap-2">
          <Plus
            className="w-4 h-4 cursor-pointer"
            onClick={() => addTag(name, color)}
          />
          
            <Trash2
              className="w-4 h-4 cursor-pointer"
              onClick={() => deleteTag(name)}
            />
        </div>}
      </div>
    )
  }
  

  const filteredTags =
    userTags?.filter(
      (tag) =>
        tag.name.includes(query.toLowerCase()) &&
        !currentTags.some((photoTag) => photoTag.id === tag.id)
    ) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Tags">
      <Suspense fallback={<Spinner />}>
        <div className="flex flex-col gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create new tag..."
          />

          {filteredTags.length > 0 && userTags.length > 0 && (
            <>
              <p className="font-semibold">Existing Tags</p>
              <div className="flex flex-col border rounded-md dark:border-onyx-light border-subtitle-light max-h-40 overflow-y-scroll">
                {filteredTags.map((tag, idx) => (
                  <TagItem
                    name={tag.name}
                    color={tag.color || undefined}
                    key={idx}
                  />
                ))}
              </div>
            </>
          )}

          {(filteredTags.length === 0 || userTags.length === 0) && (
            <>
              <p className="font-semibold">Create New Tag</p>
              <div className="flex flex-col border rounded-md dark:border-onyx-light border-subtitle-light">
                <TagItem
                  name={query}
                  color={colors[selectedColor]}
                  create
                />

                <p className="text-subtitle-light dark:text-subtitle-dark p-2 py-0 text-sm">
                  Select a color
                </p>
                <div className="flex gap-2 p-2">
                  {Object.entries(colors).map(([color, value]) => (
                    <div
                      key={color}
                      className={
                        "rounded-full w-7 h-7 cursor-pointer hover:border hover:border-black"
                      }
                      style={{ backgroundColor: value, color: value }}
                      onClick={() =>
                        setSelectedColor(color as keyof typeof colors)
                      }
                    />
                  ))}
                </div>
              </div>
              <Button onClick={() => createTag(query, colors[selectedColor])}>
                Create Tag
              </Button>
            </>
          )}
        </div>
      </Suspense>
    </Modal>
  );
}
