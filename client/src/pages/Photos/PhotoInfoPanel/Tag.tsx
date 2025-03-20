import type { Tag } from "@shared/types"
import { X } from "lucide-react"

type Props = {
    tag: Tag
    edit: boolean
}

export default function Tag({ tag, edit }: Props) {
    return (
        <div className="tag">
            <span className="font-semibold text-center flex gap-2 text-white px-2 py-1 bg-indigo text-sm rounded-full" style={{ backgroundColor: tag.color || ''}}>{tag.name}
                {edit && <X className="w-3.5 h-3.5 cursor-pointer" />}
            </span>
        </div>
    )
}