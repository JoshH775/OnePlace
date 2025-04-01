import { Collection, Filters } from "@shared/types";
import Modal from "../ui/Modal";
import { Calendar, Filter, FolderOpen, Search, X } from "lucide-react";
import { useReducer } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { Field, Label } from "@headlessui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import api from "@frontend/utils/api";
import CollectionsPopover from "../CollectionsPopover";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function reducer(state: Filters, action: {type: string; payload: any }): Filters {
    switch (action.type) {
      case "SET_NAME": {
        if (action.payload.length === 0) {
          return { ...state, name: undefined };
        }
        return { ...state, name: action.payload };
      }
      case "ADD_COLLECTION": 
      return { ...state, collectionIds: [...state.collectionIds || [], action.payload] }
      case "REMOVE_COLLECTION":
        return {
          ...state,
          collectionIds: state.collectionIds?.filter((id) => id !== action.payload),
        };
      case "SET_DATE_RANGE":
        console.log(action.payload);
        return {
          ...state,
          dateRange: {
            min: action.payload.min || state.dateRange?.min,
            max: action.payload.max || state.dateRange?.max,
          },
        };
      default:
        return state;

    }
  }

  const [filtersState, dispatch] = useReducer(reducer, {});
  
  const applyFilters = () => {
    onSetFilters(filtersState);
    onClose();
  };

  const { data: tags } = useSuspenseQuery({
    queryKey: ["tags"],
    queryFn: () => api.tags.getTagsForUser(),
  });

  const { data: collections } = useSuspenseQuery({
    queryKey: ["collections"],
    queryFn: () => api.collections.getCollections(),
  });

  //Submit

  const addCollection = (collection: Collection) => {
    if (filtersState.collectionIds?.includes(collection.id)) {
      dispatch({ type: "REMOVE_COLLECTION", payload: collection.id });
    } else {
      dispatch({ type: "ADD_COLLECTION", payload: collection.id });
    }
  };

  const removeNameFilter = () => {
    dispatch({ type: "SET_NAME", payload: "" });
  };

  const hasActiveFilters =
    filtersState.name ||
    (filtersState.collectionIds && filtersState.collectionIds.length > 0) ||
    filtersState.dateRange ||
    filtersState.uploadDateRange;

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
              >
                Clear all
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {filtersState.name && (
                <ActiveFilter
                  name={filtersState.name}
                  onRemove={removeNameFilter}
                  type="name"
                />
              )}
              {filtersState.collectionIds &&
                filtersState.collectionIds.length > 0 &&
                filtersState.collectionIds.map((collectionId) => (
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
            value={filtersState.name}
            onChange={(e) => dispatch({ type: "SET_NAME", payload: e.target.value })}
            placeholder="Search by name..."
          />
        </Field>

        <div>
            <span className="text-sm/6 font-semibold gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Date Uploaded
            </span>
            <div className="w-full flex items-center gap-3">
                <Input type="date" value={moment(filtersState.dateRange?.min).format('YYYY-MM-DD')} className="!w-fit !p-1 rounded-sm" onChange={(e) => dispatch({type: 'SET_DATE_RANGE', payload: { min: e.target.value}})}/>
                <p>to</p>
                <input type="date" value={moment(filtersState.dateRange?.max).format('YYYY-MM-DD')} className="dark:bg-onyx-light border dark:border-gray-500 p-1 rounded-sm"/>
            </div>
        </div>

        <div>
          <span className="text-sm/6 font-semibold gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            Collections
          </span>
          <CollectionsPopover
            selectedCollectionIds={filtersState.collectionIds}
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
