import { Field } from "@headlessui/react"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import LabelledInput from "../ui/LabelledInput"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import api from "@frontend/utils/api"
import { Collection } from "@shared/types"

type CreateCollectionModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function CreateCollectionModal({ isOpen, onClose }: CreateCollectionModalProps) {

  const queryClient = useQueryClient()
    const { mutateAsync } = useMutation({
      mutationFn: (data: { name: string; description: string }) => {
        return api.createCollection(data)
      },
      onSuccess: (collection) => {
        queryClient.setQueryData(['collections'], (collections: Collection[]) => [...collections, collection])
      }
    })
  
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value
      const description = (e.currentTarget.elements.namedItem("description") as HTMLInputElement).value
  
      toast.promise(
        mutateAsync({ name, description }),
        {
          loading: "Creating collection...",
          success: "Collection created!",
          error: "Failed to create collection",
        }
      )
  
      onClose()
    }
  
    return (
      <Modal title="Create Collection" isOpen={isOpen} onClose={onClose}>
        <form className="w-full" onSubmit={handleSubmit}>
          <div>
            <Field>
              <LabelledInput label="Name" id="name" type="text" placeholder="Collection name..." />
            </Field>
            <Field>
              <LabelledInput label="Description" id="description" type="text" placeholder="Description..." />
            </Field>
          </div>
          <Button type="submit" className="w-full mt-2">
            Create collection
          </Button>
        </form>
      </Modal>
    )
  }