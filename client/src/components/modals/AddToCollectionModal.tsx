import { useState } from "react"
import {

} from "@headlessui/react"
import { useQuery } from "@tanstack/react-query"
import api from "@frontend/utils/api"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import Spinner from "../ui/Spinner"
import { Collection, Photo } from "@shared/types"
import _ from "lodash"
import LabelledInput from "../ui/LabelledInput"
import Input from "../ui/Input"

type AddToCollectionModalProps = {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
}

export default function AddToCollectionModal({
  isOpen,
  onClose,
  photos,
}: AddToCollectionModalProps) {
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [query, setQuery] = useState("")


  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections", query],
    queryFn: () => api.getCollections(query),
    enabled: isOpen,
  })


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCollection) return
    console.log("Add to collection", selectedCollection)
    onClose()
  }

  const debouncedQuery = _.debounce((query: string) => setQuery(query), 300)

  return (
    <Modal title="Add to Collection" isOpen={isOpen} onClose={onClose}>
      <form className="w-full" onSubmit={handleSubmit}>
        <Input placeholder="Search collections..." onChange={(e) => debouncedQuery(e.target.value)} />


        <Button type="submit" className="w-full mt-2">
          Add to collection
        </Button>
      </form>
    </Modal>
  )
}
