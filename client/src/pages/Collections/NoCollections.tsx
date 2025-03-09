export default function NoCollections() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-onyx dark:text-white text-2xl font-semibold">
        No collections found
      </div>
      <div className="text-gray-500 dark:text-gray-400 text-sm mt-2">
        Create a collection to organize your photos
      </div>
    </div>
  );
}