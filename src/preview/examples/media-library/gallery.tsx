import { useState } from "react"

import {
	MediaLibraryDialog, MediaResourceGallery, type MediaLibraryItem,
} from "themelia-ui/features/media-library"

import { ASSETS, COLLECTIONS } from "./data"

export default function Gallery() {
	const [attached, setAttached] = useState<MediaLibraryItem[]>(ASSETS.slice(0, 4))
	const [primary, setPrimary] = useState("m1")
	const [picking, setPicking] = useState(false)

	return (
		<>
			<MediaResourceGallery
				items={attached}
				title="Venue media"
				description="The first is the cover."
				primaryId={primary}
				onPrimaryChange={setPrimary}
				onReorder={(_ids, items) => setAttached(items)}
				onRemove={(id) => setAttached((current) => current.filter((item) => item.id !== id))}
				onAdd={() => setPicking(true)}
				maxItems={6}
			/>
			{/* Add opens the library as a picker, offering only what is not attached yet. */}
			<MediaLibraryDialog
				open={picking}
				onOpenChange={setPicking}
				items={ASSETS.filter((asset) => !attached.some((item) => item.id === asset.id))}
				collections={COLLECTIONS}
				selectionMode="single"
				confirmOnSelect
				allowUpload={false}
				onConfirm={(items) => setAttached((current) => [...current, ...items])}
			/>
		</>
	)
}
