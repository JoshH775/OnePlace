import { Input } from "@headlessui/react";
import { Suspense, useState } from "react";
import IconButton from "../../components/ui/IconButton";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import NoPhotos from "./NoPhotos";
import PhotoTile from "./PhotoTile";
import { Photo } from "@shared/types";
// import JSZip from "jszip";
import AddToCollectionModal from "@frontend/components/modals/AddToCollectionModal";
import { ArrowDownToLine, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import {
  SelectOutline,
  SelectSolid,
} from "@frontend/components/ui/CustomIcons";
import Toolbar from "@frontend/components/ui/Toolbar";
import Header from "@frontend/components/Header";
import PhotoViewer from "./PhotoViewer";
import Spinner from "@frontend/components/ui/Spinner";
import { PhotoProvider } from "react-photo-view";


export default function Photos() {
  const [searchInput, setSearchInput] = useState("");

  const [addToCollectionModalOpen, setAddToCollectionModalOpen] =
    useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);

  const filters = {};
  const { data } = useSuspenseQuery({
    queryKey: ["photos", filters],
    queryFn: () => api.getPhotos(filters),
  });

  const handleClick = (photo: Photo) => {
    if (selectMode) {
      const index = selectedPhotos.findIndex((p) => p.id === photo.id);
      if (index === -1) {
        setSelectedPhotos((prevState) => [...prevState, photo]);
      } else {
        setSelectedPhotos((prevState) =>
          prevState.filter((p) => p.id !== photo.id)
        );
      }
    } else {
      console.log("Opening photo viewer");
      setCurrentPhotoId(photo.id);
      console.log(photo.id, currentPhotoId);
      // setPhotoViewerOpen(true);
    }
  };

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

  return (
    <div className="w-full flex flex-col !justify-start p-5 gap-3 relative">
      <AddToCollectionModal
        isOpen={addToCollectionModalOpen}
        onClose={() => setAddToCollectionModalOpen(false)}
        photos={selectedPhotos}
      />
      <Header className="gap-4">
        <p className="text-3xl indigo-underline font-bold">Photos</p>
        <Input
          name="search"
          type="text"
          placeholder="Search all photos..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl p-2 px-4 outline-none text-base border border-gray-300 dark:border-onyx-light"
        />

        <div className="flex gap-1">
          <IconButton
            icon={<ArrowDownToLine className="h-10 w-10 p-1" />}
            onClick={() => console.log("sort")}
            className="ml-2"
          />
          <IconButton
            icon={<SlidersHorizontal className="h-10 w-10 p-1" />}
            onClick={() => console.log("filter")}
          />
          <IconButton
            icon={
              selectMode ? (
                <SelectSolid className="h-10 w-10 p-1" />
              ) : (
                <SelectOutline className="h-10 w-10 p-1" />
              )
            }
            onClick={() => setSelectMode((prevState) => !prevState)}
          />
        </div>
      </Header>

      <Suspense fallback={<Spinner />}>
        <div id="photos" className="flex flex-wrap gap-2 w-full">
          <PhotoProvider
          >
          {data.map((photo) => {
            return (
              <PhotoTile
                key={photo.id}
                photo={photo}
                selectMode={selectMode}
                onClick={handleClick}
              />
            );
          })}
          </PhotoProvider>
        </div>
      </Suspense>



      <Toolbar isOpen={selectMode} loading={loading}>
        <IconButton
          icon={<Trash2 className="h-10 w-10 p-1" />}
          onClick={() => console.log("delete")}
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
