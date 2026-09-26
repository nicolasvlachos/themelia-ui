import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Text } from "themelia-ui/base/typography"
import { MediaLibraryDialog } from "themelia-ui/features/media-library"

import { ASSETS, COLLECTIONS } from "./data"

export default function LibraryDialog() {
	const [open, setOpen] = useState(false)
	const [picked, setPicked] = useState<string | null>(null)

	return (
		<>
			<Button type="button" onClick={() => setOpen(true)}>Pick an asset</Button>
			<MediaLibraryDialog
				open={open}
				onOpenChange={setOpen}
				items={ASSETS}
				collections={COLLECTIONS}
				selectionMode="single"
				confirmOnSelect
				allowUpload={false}
				onConfirm={(items) => setPicked(items[0]?.name ?? null)}
			/>
			{!!picked && <Text role="status" size="sm" type="secondary">picked {picked}</Text>}
		</>
	)
}
