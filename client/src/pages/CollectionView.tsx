import PhotoGallery from "@frontend/components/PhotoGallery";
import Spinner from "@frontend/components/ui/Spinner";
import api from "@frontend/utils/api";
import { Collection } from "@shared/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CollectionView() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
      navigate("/collections");
  }

  const { data, isError } = useSuspenseQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      const response = await api.req(`/collections/${id}`);
      if (response.status !== 200 || !response.data) {
        if (response.status === 404) {
          throw new Error("Collection not found");
        }
        throw new Error("Error fetching collection");
      }

      const collection = response.data as Collection;

      const photos = await api.getPhotos({ collectionId: parseInt(id!) });
      return { collection, photos };
    },
  });

  console.log(data);

  return (
    <Suspense fallback={<Spinner />}>
      {isError || !data ? (
        <div className="flex-grow flex justify-center items-center font-bold text-3xl w-full">
          Collection not found!
        </div>
      ) : (
        <div className="w-full flex-grow flex flex-col p-5">
          <p className="text-3xl font-bold indigo-underline mb-3">
            {data.collection.name}
          </p>
          <p className="dark:text-subtitle-dark text-subtitle-light mb-2">
            {data.collection.description}
          </p>

          <PhotoGallery
            photos={data.photos}
            selectMode={false}
        />
        </div>
      )}
    </Suspense>
  );
}
