import { Collection, Filters, Tag } from "@shared/types";
import Modal from "../ui/Modal";
import { Calendar, Filter, FolderOpen, Tag as TagIcon, X } from "lucide-react";
import { useReducer } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import {  Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import api from "@frontend/utils/api";
import CollectionsPopover from "../CollectionsPopover";
import moment from "moment";
import TagsPopover from "../TagsPopover";

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
    collectionIds: "bg-blue-600", 
    dateRange: "bg-purple-600",
    uploadDateRange: "bg-teal-500",
    tags: "bg-red-500", 
    name: "bg-orange-500", 
  };
  

  const typeLabels = {
    collectionIds: "Collection",
    dateRange: "Date Taken",
    uploadDateRange: "Upload Date",
    name: "Name",
    tags: "Tag",
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
  function reducer(state: Filters, action: { type: string; payload: any }): Filters {
    switch (action.type) {
      
      case "ADD_COLLECTION":
        return { ...state, collectionIds: [...(state.collectionIds || []), action.payload] };
  
      case "REMOVE_COLLECTION": {
        const updatedCollectionIds = state.collectionIds?.filter((id) => id !== action.payload);
        if (updatedCollectionIds?.length === 0) {
          // If no collections are left, remove the key entirely
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { collectionIds, ...rest } = state;
          return rest;
        }
        return { ...state, collectionIds: updatedCollectionIds };
      }
  
      case "SET_DATE_TAKEN_RANGE":
        if (!action.payload) {
          // If no date range is provided, remove it from state
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { dateRange, ...rest } = state;
          return rest;
        }
        return {
          ...state,
          dateRange: {
            min: action.payload.min ?? state.dateRange?.min,
            max: action.payload.max ?? state.dateRange?.max,
          },
        };
  
      case "SET_DATE_UPLOAD_RANGE":
        if (!action.payload) {
          // If no upload date range is provided, remove it from state
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { uploadDateRange, ...rest } = state;
          return rest;
        }
        return {
          ...state,
          uploadDateRange: {
            min: action.payload.min ?? state.uploadDateRange?.min,
            max: action.payload.max ?? state.uploadDateRange?.max,
          },
        };
  
      case "ADD_TAG":
        return { ...state, tags: [...(state.tags || []), action.payload] };
  
      case "REMOVE_TAG": {
        const updatedTags = state.tags?.filter((tag) => tag.id !== action.payload);
        if (updatedTags?.length === 0) {
          // If no tags are left, remove the key entirely
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { tags, ...rest } = state;
          return rest;
        }
        return { ...state, tags: updatedTags };
      }
  
      case "CLEAR":
        return {};
  
      default:
        return state;
    }
  }
  

  const [filtersState, dispatch] = useReducer(reducer, {});
  
  const applyFilters = () => {
    onSetFilters(filtersState);
    onClose();
  };


  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => api.collections.getCollections(),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  //Submit

  const onCollectionToggle = (collection: Collection) => {
    if (filtersState.collectionIds?.includes(collection.id)) {
      dispatch({ type: "REMOVE_COLLECTION", payload: collection.id });
    } else {
      dispatch({ type: "ADD_COLLECTION", payload: collection.id });
    }
  };

  const onTagToggle = (tag: Tag) => {
    if (filtersState.tags?.find((t) => t.id === tag.id)) {
      dispatch({ type: "REMOVE_TAG", payload: tag.id });
    }
    else {
      dispatch({ type: "ADD_TAG", payload: tag });
    }
  }

  const removeNameFilter = () => {
    dispatch({ type: "SET_NAME", payload: "" });
  };

  const hasActiveFilters =
    filtersState.name ||
    (filtersState.collectionIds && filtersState.collectionIds.length > 0) ||
    (filtersState.dateRange && (filtersState.dateRange.min || filtersState.dateRange.max)) ||
    (filtersState.uploadDateRange && (filtersState.uploadDateRange.min || filtersState.uploadDateRange.max)) ||
    (filtersState.tags && filtersState.tags.length > 0);

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
                onClick={() => {dispatch({ type: "CLEAR", payload: null})}}
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
                      onCollectionToggle(findCollectionById(collectionId))
                    }
                    type="collectionIds"
                  />
                ))}

                {filtersState.dateRange && (filtersState.dateRange.min || filtersState.dateRange.max) && (
                <ActiveFilter
                  name={`${filtersState.dateRange.min ? moment(filtersState.dateRange.min).format("MM/DD/YYYY") : "Any"} - ${
                  filtersState.dateRange.max ? moment(filtersState.dateRange.max).format("MM/DD/YYYY") : "Any"
                  }`}
                  onRemove={() =>
                  dispatch({
                    type: "SET_DATE_TAKEN_RANGE",
                    payload: null,
                  })
                  }
                  type="dateRange"
                />
                )}

                {filtersState.uploadDateRange && (filtersState.uploadDateRange.min || filtersState.uploadDateRange.max) && (
                <ActiveFilter
                  name={`${
                  filtersState.uploadDateRange.min
                    ? moment(filtersState.uploadDateRange.min).format("MM/DD/YYYY")
                    : "Any"
                  } - ${
                  filtersState.uploadDateRange.max
                    ? moment(filtersState.uploadDateRange.max).format("MM/DD/YYYY")
                    : "Any"
                  }`}
                  onRemove={() =>
                  dispatch({
                    type: "SET_DATE_UPLOAD_RANGE",
                    payload: null,
                  })
                  }
                  type="uploadDateRange"
                />
                )}

                {filtersState.tags &&
                filtersState.tags.length > 0 &&
                filtersState.tags.map((tag) => (
                  <ActiveFilter
                    key={tag.id}
                    name={tag.name}
                    onRemove={() => onTagToggle(tag)}
                    type="tags"
                  />
                ))}
            </div>
          </div>
        )}

        <TabGroup>
            <TabList className="flex gap-4 w-full rounded-md dark:bg-onyx-gray p-1 items-center justify-center">
            <Tab
              key="date-taken"
              className="rounded-md px-3 py-1 font-semibold flex items-center gap-2 data-[selected]:bg-indigo data-[selected]:text-white w-full text-center justify-center transition-colors duration-100">
              <Calendar className="h-4 w-4" /> Date Taken
            </Tab>

            <Tab
              key="date-uploaded"
              className="rounded-md px-3 py-1 font-semibold flex items-center gap-2 data-[selected]:bg-indigo data-[selected]:text-white w-full text-center justify-center transition-colors duration-100">
              <Calendar className="h-4 w-4" /> Date Uploaded
            </Tab>
            </TabList>
            <TabPanels className="mt-3">
              <TabPanel key="date-taken" className="flex items-center gap-3">

                  <Input
                    type="date"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_DATE_TAKEN_RANGE",
                        payload: {
                          min: e.target.value,
                        },
                      })
                    }
                    className="!m-0"
                    value={filtersState.dateRange?.min || ''}
                  />

                  <p className="font-semibold">to</p>

                  <Input
                    type="date"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_DATE_TAKEN_RANGE",
                        payload: {
                          max: e.target.value,
                        },
                      })}
                      className="!m-0"

                      value={filtersState.dateRange?.max || ''}
                  />
              


                </TabPanel>
                  <TabPanel key="date-uploaded" className="flex items-center gap-3">
                  <Input
                    type="date"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_DATE_UPLOAD_RANGE",
                        payload: {
                          min: e.target.value,
                        },
                      })
                    }
                    className="!m-0"
                    value={filtersState.uploadDateRange?.min || ''}
                  />

                  <p className="font-semibold">to</p>

                  <Input
                    type="date"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_DATE_UPLOAD_RANGE",
                        payload: {
                          max: e.target.value,
                        },
                      })}
                      className="!m-0"
                      value={filtersState.uploadDateRange?.max || ''}
                  />
                </TabPanel>
            </TabPanels>
        </TabGroup>

        <div>
          <span className="text-sm/6 font-semibold gap-1">
            <FolderOpen className="h-3.5 w-3.5" />
            Collections
          </span>
          <CollectionsPopover
            selectedCollectionIds={filtersState.collectionIds}
            onToggle={onCollectionToggle}
          />
        </div>

        <div>
          <span className="text-sm/6 font-semibold gap-1">
            <TagIcon className="h-3.5 w-3.5" />
            Tags
          </span>
          <TagsPopover
            selectedTags={filtersState.tags}
            onToggle={onTagToggle}
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
