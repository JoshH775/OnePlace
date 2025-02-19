import { Input } from "@headlessui/react";
import { useState } from "react";
import IconButton from "../components/ui/IconButton";
import { ArrowsUpDownIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";
import NoPhotos from "../components/NoPhotos";

export default function Photos() {
  const [searchInput, setSearchInput] = useState("");

  const filters = {};
  const { data, isLoading } = useQuery({
    queryKey: ["photos", filters],
    queryFn: () => api.getPhotos(filters),
  });
  console.log(data);

  if (!data || (data.length === 0 && !isLoading)) {
    return (
      <div className="content">
        <NoPhotos />
      </div>
    );
  }

  return (
    <div className="content flex-col !justify-start p-6 gap-3">
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
      </div>

      <div id="photos" className="grid grid-cols-4 gap-2 w-full">
  {isLoading ? (
    <div>Loading...</div>
  ) : (
    data.map((photo) => {
      // Check if the image is a landscape image
      return (
        <div 
          key={photo.id}
          className=" max-h-60 max-w-80 min-h-60 min-w-40 rounded-lg aspect-square">
          <img src={`/api/photos/${photo.id}`} alt={photo.alias ?? ''} className="w-full h-full object-cover rounded-lg" />
        </div>
      );
    })
  )}
</div>
    </div>
  );
}
