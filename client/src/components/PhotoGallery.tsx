import { PhotoProvider } from "react-photo-view";
import PhotoOverlay from "@frontend/pages/Photos/PhotoOverlay";
import PhotoTile from "@frontend/pages/Photos/PhotoTile";
import { Filters, Photo } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import api from "@frontend/utils/api";
import Spinner from "./ui/Spinner";

type Props = {
  filters?: Filters;
  selectMode: boolean;
  handleClick?: (photo: Photo) => void;
};
export default function PhotoGallery({
  filters = {},
  selectMode,
  handleClick = () => {},
}: Props) {
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos", filters],
    queryFn: () => api.photos.getPhotos(filters),
  });

  return (
    <div id="photos" className="flex flex-wrap gap-2 w-full">
      {isLoading && <Spinner />}

      {(!photos || (photos.length === 0 && !isLoading)) && (
        <div className="w-full flex justify-center items-center h-96 text-gray-500 dark:text-gray-400">
          <p>No photos found</p>
        </div>
      )}

      {photos?.length > 0 && (
        <PhotoProvider
          overlayRender={(props) => (
            <PhotoOverlay
              overlayProps={props}
              photo={getOverlayPhoto(props.index, photos)}
            />
          )}
          bannerVisible={false}
        >
          {photos.map((photo) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              selectMode={selectMode}
              onClick={handleClick}
            />
          ))}
        </PhotoProvider>
      )}
    </div>
  );
}

function getOverlayPhoto(index: number, photos: Photo[]) {
  if (photos.length === 0) return null;
  if (index < 0) return photos[0];
  if (index >= photos.length) return photos[photos.length - 1];
  return photos[index];
}
