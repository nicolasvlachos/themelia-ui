import { FileIcon, FilmIcon, ImageIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { MediaLibraryItemType } from "./media-library.types"

export const TYPE_ICON: Record<MediaLibraryItemType, ReactNode> = {
	image: <ImageIcon />,
	video: <FilmIcon />,
	file: <FileIcon />,
}
