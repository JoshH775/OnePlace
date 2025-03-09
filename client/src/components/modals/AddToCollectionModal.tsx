import { Field } from "@headlessui/react"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import LabelledInput from "../ui/LabelledInput"
import { Photo } from "@shared/types"
import api from "@frontend/utils/api"
import Spinner from "../ui/Spinner"
import { useQuery } from "@tanstack/react-query"

type AddToCollectionModalProps = {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
}

export default function AddToCollectionModal({ isOpen, onClose, photos }: AddToCollectionModalProps) {

    const { data: collections, isLoading } = useQuery({
        queryKey: ["collections"],
        queryFn: () => api.getCollections(),
    });

    console.log("Collections", collections)


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const collection = (e.currentTarget.elements.namedItem("collection") as HTMLInputElement).value
    console.log("Add to collection", collection)

    onClose()
  }

  return (
    <Modal title="Add to Collection" isOpen={isOpen} onClose={onClose}>
        {isLoading && <Spinner />}
      <form className="w-full" onSubmit={handleSubmit}>
        <Field>
          <LabelledInput label="Collection" id="collection" type="text" />
        </Field>
        <Button type="submit" className="w-full mt-2">
          Add to collection
        </Button>
      </form>
    </Modal>
  )
}
