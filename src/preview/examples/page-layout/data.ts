import { ArchiveIcon, DownloadIcon, PencilIcon, ShareIcon, TrashIcon } from "lucide-react"

import type { PageAction } from "themelia-ui/layout/page"

export const RECORD_ACTIONS: PageAction[] = [
	{ label: "Edit", icon: PencilIcon, placement: "inline", onClick: () => {} },
	{ label: "Duplicate", icon: ShareIcon, appearance: "outline", tone: "neutral", onClick: () => {} },
	{ label: "Export", icon: DownloadIcon, appearance: "outline", tone: "neutral", onClick: () => {} },
	{ label: "Archive", icon: ArchiveIcon, onClick: () => {} },
	{ label: "Delete", icon: TrashIcon, tone: "destructive", placement: "menu", onClick: () => {} },
]
