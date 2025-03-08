import { Input } from "@headlessui/react";
import { useState } from "react";
import IconButton from "../../components/ui/IconButton";
import {
  ArrowDownTrayIcon,
  ArrowsUpDownIcon,
  CheckCircleIcon as CheckIconOutline,
  FunnelIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckIconSolid } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import NoPhotos from "../../components/NoPhotos";
import PhotoTile from "./PhotoTile";
import { Photo } from "@shared/types";
import JSZip from "jszip";


export default function Photos() {
  const [searchInput, setSearchInput] = useState("");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const filters = {};
  const { data, isLoading } = useQuery({
    queryKey: ["photos", filters],
    queryFn: () => api.getPhotos(filters),
  });

  if (!data || (data.length === 0 && !isLoading)) {
    return (
      <div className="content">
        <NoPhotos />
      </div>
    );
  }

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
    <div className="content flex-col !justify-start p-6 gap-3 relative">
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
          icon={<ArrowsUpDownIcon className="h-10 p-1" />}
          onClick={() => console.log("sort")}
          className="ml-2"
        />
        <IconButton
          icon={<FunnelIcon className="h-10 p-1" />}
          onClick={() => console.log("filter")}
        />
        <IconButton
          icon={
            selectMode ? (
              <CheckIconSolid className="w-10" />
            ) : (
              <CheckIconOutline className="w-10" />
            )
          }
          onClick={() => setSelectMode((prevState) => !prevState)}
        />
      </div>

      <div id="photos" className="flex flex-wrap gap-2 w-full">
        {isLoading ? (
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

      <div
        id="toolbar"
        className={`flex items-center justify-center shadow-lg gap-6 w-fit rounded-full border dark:bg-onyx dark:border-onyx-light p-2 ease-out px-7 absolute transition-all top-[92%] ${
          selectMode ? "scale-100 opacity-100" : "scale-80 opacity-0"
        } ${loading ? "bg-gray-400 cursor-not-allowed " : ""}`}
      >
        <IconButton
          icon={<TrashIcon className="h-10 p-1" />}
          onClick={() => console.log("delete")}
          disabled={loading}
        />
        <IconButton
          icon={<PlusIcon className="h-10 p-1" />}
          onClick={() => console.log("add to album")}
          disabled={loading}
        />
        <IconButton
          icon={<ArrowDownTrayIcon className="h-10 p-1" />}
          onClick={downloadSelected}
          disabled={loading}
        />
      </div>
    </div>
  );
}
