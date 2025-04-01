import { Collection, Filters } from "@shared/types";
import Modal from "../ui/Modal";
import { Calendar, Filter, FolderOpen, Search, X } from "lucide-react";
import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Field, Label } from "@headlessui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import api from "@frontend/utils/api";
import CollectionsPopover from "../CollectionsPopover";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSetFilters: (filters: Filters) => void;
};

const ActiveFilter = ({
  name,
  onRemove,
  type,
}: {
  name: string;
  onRemove: () => void;
  type: keyof Filters;
}) => {
  const bgColors = {
    collectionIds: "bg-indigo",
    dateRange: "bg-red-100",
    uploadDateRange: "bg-green-100",
    name: "bg-red-500",
  };

  const typeLabels = {
    collectionIds: "Collection",
    dateRange: "Date",
    uploadDateRange: "Upload Date",
    name: "Name",
  };
  return (
    <span
      className={`font-semibold text-center flex gap-2 text-white px-2 py-1 text-sm rounded-full items-center ${bgColors[type]}`}
    >
      <p className="text-xs">
        {typeLabels[type]}: {name}
      </p>
      <X className="h-3.5 w-3.5 cursor-pointer" onClick={onRemove} />
    </span>
  );
};

export default function FiltersModal({ isOpen, onClose, onSetFilters }: Props) {
  const [filters, setFilters] = useState<Filters>({
    collectionIds: [],
    name: "",
    uploadDateRange: { min: '2025-03-16 19:28:28', max: '2025-03-29 19:27:28'}
  });

  console.log(filters);

  const { data: tags } = useSuspenseQuery({
    queryKey: ["tags"],
    queryFn: () => api.tags.getTagsForUser(),
  });

  const { data: collections } = useSuspenseQuery({
    queryKey: ["collections"],
    queryFn: () => api.collections.getCollections(),
  });

  //Submit
  const applyFilters = () => {
    onSetFilters(filters);
    onClose();
  };

  const removeNameFilter = () => {
    const updatedFilters = { ...filters };
    delete updatedFilters.name;
    setFilters(updatedFilters);
  };

  const addCollection = (collection: Collection) => {
    setFilters((prevFilters) => {
      const collectionIds = prevFilters.collectionIds || [];

      if (collectionIds.includes(collection.id)) {
        return {
          ...prevFilters,
          collectionIds: collectionIds.filter((id) => id !== collection.id),
        };
      } else {
        return {
          ...prevFilters,
          collectionIds: [...collectionIds, collection.id],
        };
      }
    });
  };

  const setUploadDateRange = (value: string, key: 'min' | 'max') =>  {
    setFilters((prevFilters) => {
        const range = { ...prevFilters.uploadDateRange, [key]: value}
        return {
            ...prevFilters,
            uploadDateRange: range

        }
    })
  }

  const hasActiveFilters =
    filters.name ||
    (filters.collectionIds && filters.collectionIds.length > 0) ||
    filters.dateRange ||
    filters.uploadDateRange;

  function findCollectionById(id: number) {
    return collections.find((c) => c.id === id) as Collection;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Photos"
      icon={<Filter className="w-7 h-7" />}
    >
      <div className="flex flex-col gap-3">
        {hasActiveFilters && (
          <div id="active-filters" className="flex flex-col gap-2">
            <span className="text-sm font-semibold justify-between">
              Active Filters
              <span
                className="text-xs cursor-pointer"
                onClick={() => setFilters({})}
              >
                Clear all
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.name && (
                <ActiveFilter
                  name={filters.name}
                  onRemove={removeNameFilter}
                  type="name"
                />
              )}
              {filters.collectionIds &&
                filters.collectionIds.length > 0 &&
                filters.collectionIds.map((collectionId) => (
                  <ActiveFilter
                    key={collectionId}
                    name={`${findCollectionById(collectionId).name}`}
                    onRemove={() =>
                      addCollection(findCollectionById(collectionId))
                    }
                    type="collectionIds"
                  />
                ))}
            </div>
          </div>
        )}

        <Field>
          <Label className="text-sm/6 font-semibold flex items-center gap-1">
            <Search className="h-3.5 w-3.5" />
            Name
          </Label>
          <Input
            name="search"
            className="mt-1 text-sm"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            placeholder="Search by name..."
          />
        </Field>

        <div>
            <span className="text-sm/6 font-semibold gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Date Uploaded
            </span>
            <div className="w-full flex items-center gap-3">
                <Input type="date" value={moment(filters.uploadDateRange?.min).format('YYYY-MM-DD')} ref={} className="!w-fit !p-1 rounded-sm"/>
                <p>to</p>
                <input type="date" value={moment(filters.uploadDateRange?.max).format('YYYY-MM-DD')} className="dark:bg-onyx-light border dark:border-gray-500 p-1 rounded-sm"/>
            </div>
        </div>

        <div>
          <span className="text-sm/6 font-semibold gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            Collections
          </span>
          <CollectionsPopover
            selectedCollectionIds={filters.collectionIds}
            onToggle={addCollection}
          />
        </div>

        <hr className="!border-gray-300 dark:!border-onyx-light" />
        <section className="buttons flex gap-4 w-full">
          <Button className="w-1/2" onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button className="w-1/2" onClick={applyFilters}>
            Apply Filters
          </Button>
        </section>
      </div>
    </Modal>
  );
}
