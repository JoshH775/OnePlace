import React from 'react'
import { PhotoProvider } from 'react-photo-view'
import PhotoOverlay from '@frontend/pages/Photos/PhotoOverlay'
import PhotoTile from '@frontend/pages/Photos/PhotoTile'
import { Photo } from '@shared/types'

type Props = {
    photos: Photo[]
    selectMode: boolean
    handleClick?: (photo: Photo) => void
}
export default function PhotoGallery({ photos = [], selectMode, handleClick = () => {} }: Props) {
  return (
    <div id="photos" className="flex flex-wrap gap-2 w-full">
      {photos.length > 0 && (
        <PhotoProvider
          overlayRender={(props) => (
            <PhotoOverlay overlayProps={props} photo={getOverlayPhoto(props.index, photos)} />
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
  )
}

function getOverlayPhoto(index: number, photos: Photo[]) {
    if (photos.length === 0) return null;
    if (index < 0) return photos[0];
    if (index >= photos.length) return photos[photos.length - 1];
    return photos[index];
  }