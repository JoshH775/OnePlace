import { Photo } from "@shared/types";
import { useState } from "react";

type Props = {
  photo: Photo;
  selectMode: boolean;
  onClick: (photo: Photo) => void;
};

export default function PhotoTile(props: Props) {
  const { photo, selectMode, onClick } = props;

  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleClick = () => {
    if (selectMode) {
      setSelected(!selected);
    }
    onClick(photo);
  }

  return (
    <div
      key={photo.id}
      onClick={handleClick}
      className={`relative max-h-60 max-w-80 min-h-60 min-w-40 rounded-lg aspect-square cursor-pointer hover:scale-102 transform transition-all duration-200 ease-in-out ${
        selectMode ? "scale-95 duration-200" : ""
      }`}
    >
      {selectMode && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full border-2 border-indigo-600 flex items-center justify-center">
          <div className={`w-3 h-3 bg-indigo-600 rounded-full ${selected ? 'scale-100' : 'scale-0'} transition-transform duration-50`}></div>
        </div>
      )}

      {loading && (
        <div className="w-full h-full bg-gray-800 animate-pulse rounded-lg" />
      )}

      <img
        src={`/api/photos/${photo.id}?thumbnail=true`}
        alt={photo.alias ?? ""}
        className={`w-full h-full object-cover rounded-lg ${loading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}