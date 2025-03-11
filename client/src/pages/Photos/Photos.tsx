import { Input } from "@headlessui/react";
import { useState } from "react";
import IconButton from "../../components/ui/IconButton";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import NoPhotos from "./NoPhotos";
import PhotoTile from "./PhotoTile";
import { Photo } from "@shared/types";
// import JSZip from "jszip";
import AddToCollectionModal from "@frontend/components/modals/AddToCollectionModal";
import { ArrowDownToLine, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { SelectOutline, SelectSolid } from "@frontend/components/ui/CustomIcons";
import Toolbar from "@frontend/components/ui/Toolbar";


export default function Photos() {
  const [searchInput, setSearchInput] = useState("");

  const [addToCollectionModalOpen, setAddToCollectionModalOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const filters = {};
  const { data, isLoading } = useQuery({
    queryKey: ["photos", filters],
    queryFn: () => api.getPhotos(filters),
  });



  const handleSelect = (photo: Photo) => {
    const index = selectedPhotos.findIndex((p) => p.id === photo.id);
    if (index === -1) {
      setSelectedPhotos((prevState) => [...prevState, photo]);
    } else {
      setSelectedPhotos((prevState) =>
        prevState.filter((p) => p.id !== photo.id)
      );
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
  }

  return (
    <div className="w-full flex flex-col !justify-start p-6 gap-3 relative">
      <AddToCollectionModal isOpen={addToCollectionModalOpen} onClose={() => setAddToCollectionModalOpen(false)} photos={selectedPhotos} />
      <div id="tools" className="flex items-center w-full">
        <Input
          name="search"
          type="text"
          placeholder="Search all photos..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl p-2 px-4 outline-none text-base border border-gray-300 dark:border-onyx-light"
        />

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

      <div id="photos" className="flex flex-wrap gap-2 w-full">
        {isLoading || !data ? (
          <div>Loading...</div>
        ) : (
          data.map((photo) => {
            return (
              <PhotoTile
                key={photo.id}
                photo={photo}
                selectMode={selectMode}
                onSelect={handleSelect}
              />
            );
          })
        )}
      </div>

     
     <Toolbar isOpen={selectMode} loading={loading}>
        <IconButton
          icon={<Trash2 className="h-10 w-10 p-1" />}
          onClick={() => console.log("delete")}
          disabled={loading}
        />
        <IconButton
          icon={<Plus className="h-10 w-10 p-1" />}
          onClick={() => setAddToCollectionModalOpen(true)}
          disabled={loading}
        />
        <IconButton
          icon={<ArrowDownToLine className="h-10 w-10 p-1" />}
          onClick={downloadSelected}
          disabled={loading}
        />
      </Toolbar>

    </div>
  );
}
