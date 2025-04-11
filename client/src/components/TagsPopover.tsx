import api from "@frontend/utils/api";
import { Input, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Tag } from "@shared/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Search } from "lucide-react";
import { useState } from "react";

type Props = {
  selectedTags?: Tag[];
  onToggle: (tag: Tag) => void;
};

export default function TagsPopover({ selectedTags = [], onToggle }: Props) {
  const [query, setQuery] = useState("");

  const { data: tags } = useSuspenseQuery({
    queryKey: ["userTags"],
    queryFn: () => api.tags.getTagsForUser(),
  });

  const filteredTags = tags.filter((t) => t.name.includes(query)) || [];

  const TagItem = ({
    tag,
    onClick,
  }: {
    tag: Tag;
    onClick: (tag: Tag) => void;
  }) => {
    const checked = !!selectedTags.find((t) => t.id === tag.id);

    return (
      <div
        key={tag.id}
        className="w-full font-semibold cursor-pointer flex justify-between p-2 items-center hover:dark:bg-onyx-light rounded-md"
        onClick={() => onClick(tag)}
      >
        <span className="gap-2">
        <div
          className="h-4 w-4 rounded-full bg-indigo"
          style={{ backgroundColor: tag.color || '' }}
        />
        {tag.name}
        </span>
        <Input type="checkbox" className="p-2" checked={checked} readOnly />
      </div>
    );
  };

  return (
    <Popover className="relative">
      <PopoverButton className="w-full bg-indigo text-white data-[hover]:bg-indigo-700 flex justify-between px-4 py-2 rounded-md items-center font-semibold">
        {selectedTags.length > 0
          ? `${selectedTags.length} tags selected`
          : "Select tags..."}
        <ChevronsUpDown className="w-4 h-4" />
      </PopoverButton>
      <PopoverPanel
        anchor="bottom"
        className="flex flex-col border shadow-md border-gray-300 dark:border-onyx-light mt-2 bg-white dark:bg-onyx-gray  pt-0 rounded-md items-center !w-[var(--button-width)] transition duration-200 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0"
        transition
      >
        <span
          className="w-full border-b 
        border-gray-300 dark:border-onyx-light px-2 py-2 gap-2"
        >
          <Search className="w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Tags..."
            className="w-full lr-2 py-1 px-0.5 rounded-md"
          />
        </span>

        <div className="p-2 flex flex-col w-full max-h-120 overflow-y-auto">
          {filteredTags.map((tag) => (
            <TagItem key={tag.id} tag={tag} onClick={onToggle} />
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
}
