import { Input } from "@headlessui/react";
import { Suspense, useCallback, useState } from "react";
import IconButton from "../../components/ui/IconButton";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import { Filters, Photo } from "@shared/types";
// import JSZip from "jszip";
import AddToCollectionModal from "@frontend/components/modals/AddToCollectionModal";
import { ArrowDownToLine, Filter, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import Toolbar from "@frontend/components/ui/Toolbar";
import Header from "@frontend/components/Header";
import toast from "react-hot-toast";
import PhotoGallery from "@frontend/components/PhotoGallery";
import Button from "@frontend/components/ui/Button";
import FiltersModal from "@frontend/components/modals/FiltersModal";
import { debounce } from "lodash";


export default function Photos() {
  const [searchInput, setSearchInput] = useState("");
  const [addToCollectionModalOpen, setAddToCollectionModalOpen] =
    useState(false);
  const queryClient = useQueryClient();
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersModal, setFiltersModal] = useState(false);
  const [filters, setFilters] = useState({})



  queryClient.prefetchQuery({
    queryKey: ["userTags"],
    queryFn: () => api.tags.getTagsForUser(),
  });

  queryClient.prefetchQuery({
    queryKey: ["collections"],
    queryFn: () => api.collections.getCollections(),
  })


  const { mutateAsync: bulkDeleteMutation } = useMutation({
    mutationFn: async (photoIds: number[]) => api.photos.bulkDeletePhotos(photoIds),
  })

  const handleClick = (photo: Photo) => {
      const index = selectedPhotos.findIndex((p) => p.id === photo.id);
      if (index === -1) {
        setSelectedPhotos((prevState) => [...prevState, photo]);
      } else {
        setSelectedPhotos((prevState) =>
          prevState.filter((p) => p.id !== photo.id)
        );
      }
  };

  const applyFilters = (f: Filters) => {
    console.log("Applying filters:", f)
    if (!f) return
    setFilters(f)
  }
  
  const debouncedApplyFilters = useCallback(
    debounce((newFilters: Filters) => {
      setFilters(newFilters);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedApplyFilters({ ...filters, name: e.target.value });
  }


  const downloadSelected = async () => {
    alert("Download selected photos not implemented yet");
    // setLoading(true);
    // console.log("Downloading photos:", selectedPhotos);

    // const zip = new JSZip()

    // try {
    //   const buffers = await Promise.all(
    //     selectedPhotos.map(async (photo) => {
    //       const res = await api.req(`/photos/${photo.id}?download=true`)
    //       return await res.data
    //     }
    //     )
    //   );

    //   buffers.forEach((buffer, index) => {
    //     zip.file(selectedPhotos[index].filename, new ArrayBuffer(buffer), { binary: true });
    //   });

    //   console.log("Zipping photos:", zip);

    //   const content = await zip.generateAsync({ type: "blob" });
    //   const url = URL.createObjectURL(content);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = "photos.zip";
    //   a.click();
    //   document.body.removeChild(a);

    // } catch (error) {
    //   console.error("Error downloading photos:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const bulkDelete = async (photoIds: number[]) => {
    setLoading(true)
    toast.loading("Deleting photos...")
    const { success, error } = await bulkDeleteMutation(photoIds)
    if (!success || error) {
      toast.error(error || "Failed to delete photos")
    } else {
      toast.success("Photos deleted successfully")
      setSelectedPhotos([])
      queryClient.invalidateQueries({ queryKey: ["photos"] })
    }
  }

  return (
    <div className="w-full flex flex-col !justify-start p-5 gap-3 relative">
      <AddToCollectionModal
        isOpen={addToCollectionModalOpen}
        onClose={() => setAddToCollectionModalOpen(false)}
        photos={selectedPhotos}
      />

      <FiltersModal isOpen={filtersModal} onClose={() => setFiltersModal(false)} onSetFilters={applyFilters}  />
      <Header className="gap-4">
        <p className="text-3xl indigo-underline font-bold">Photos</p>
        <Input
          name="search"
          type="text"
          placeholder="Search all photos..."
          value={searchInput}
          onChange={handleSearchChange}
          className="w-full rounded-xl p-2 px-4 outline-none text-base border border-gray-300 dark:border-onyx-light"
        />

        <div className="flex gap-1">
          
        <div className="flex gap-1 relative">
  <Button onClick={() => setFiltersModal(true)} className="relative">
    <Filter className="h-7 w-7" />
  </Button>

  {Object.keys(filters).length > 0 && (
    <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/3 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 font-bold rounded-full">
      {Object.keys(filters).length}
    </span>
  )}
</div>
          <Button>
            <SlidersHorizontal className="h-7 w-7 " />
          </Button>
          <Button onClick={() => setSelectMode((prev) => !prev)}>
            <Plus className="h-7 w-7 " />
          </Button>
          
        </div>
      </Header>

        <PhotoGallery
          filters={filters}
          selectMode={selectMode}
          handleClick={handleClick} />

      <Toolbar isOpen={selectMode} loading={loading}>
        <IconButton
          icon={<Trash2 className="h-10 w-10 p-1" />}
          onClick={() => {bulkDelete(selectedPhotos.map((p) => p.id))}}
          disabled={loading || selectedPhotos.length === 0}
        />
        <IconButton
          icon={<Plus className="h-10 w-10 p-1" />}
          onClick={() => setAddToCollectionModalOpen(true)}
          disabled={loading || selectedPhotos.length === 0}
        />
        <IconButton
          icon={<ArrowDownToLine className="h-10 w-10 p-1" />}
          onClick={downloadSelected}
          disabled={loading || selectedPhotos.length === 0}
        />
      </Toolbar>
    </div>
  );
}

