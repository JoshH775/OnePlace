import { FolderOpen } from "lucide-react";
import { Collection } from "@shared/types";
import moment from "moment";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const CollectionTile = ({ collection, index }: { collection: Collection, index: number }) => {

  const navigate = useNavigate()

  const imgSrc = collection.coverPhotoId ? `/api/photos/${collection.coverPhotoId}?thumbnail=true` : "https://media.istockphoto.com/id/931643150/vector/picture-icon.jpg?s=612x612&w=0&k=20&c=St-gpRn58eIa8EDAHpn_yO4CZZAnGD6wKpln9l3Z3Ok=";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex flex-grow flex-col w-full "
      onClick={() => navigate(`/collections/${collection.id}`)}
    >
      <div className="shadow-lg dark:shadow-none border border-gray-300  dark:border-onyx-light rounded-md hover:border-indigo hover:text-indigo transition-all duration-200 ">
      <img
        src={imgSrc}
        alt={collection.name}
        className="w-full h-40 object-cover rounded-t-md"
      />
      <div className="p-4">
        <p className="text-lg font-semibold">{collection.name}</p>
        <p className="text-sm text-subtitle-light dark:text-subtitle-dark">
          {collection.description || 'No description'}
        </p>
      </div>
      <span className="p-2 py-1 gap-2 border-t dark:border-onyx-light border-light dark:text-subtitle-dark text-subtitle-light">
        <FolderOpen className="h-4" />
        Created {moment(collection.createdAt).format("LL")}
      </span>
      </div>
    </motion.div>
  )
}

export default CollectionTile