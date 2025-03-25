import api from "@frontend/utils/api"
import type { Tag } from "@shared/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"

type Props = {
    tag: Tag
    edit: boolean
}

export default function Tag({ tag, edit }: Props) {

    const photoId = Number(sessionStorage.getItem("photoId"))

    const queryClient = useQueryClient()

    const { mutateAsync: deleteTagMutation } = useMutation({
        mutationFn: async () => api.photos.removeTagFromPhoto(photoId, tag.id)
    })

    const deleteTag = async () => {
        const newTags = await deleteTagMutation()
        queryClient.setQueryData(["photoTags", photoId], newTags)
    }

    return (
        <div className="tag" >
            <span className="font-semibold text-center flex gap-2 text-white px-2 py-1 text-sm rounded-full items-center" style={{ backgroundColor: tag.color || '#4f39f6'}}>{tag.name}
                {edit && <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => edit && deleteTag()}/>}
            </span>
        </div>
    )
}