import { useRef, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { MediaLibrary, type MediaLibraryItem } from "themelia-ui/features/media-library"

import { ASSETS, COLLECTIONS } from "./data"

export default function Library() {
	const [selected, setSelected] = useState<string[]>(["m1"])
	const [note, setNote] = useState<string | null>(null)
	const failNext = useRef(false)
	const uploadSequence = useRef(0)

	return (
		<>
			<MediaLibrary
				items={ASSETS}
				collections={COLLECTIONS}
				value={selected}
				onValueChange={setSelected}
				onItemUpdate={async (item) => {
					await new Promise((resolve) => setTimeout(resolve, 400))
					if (failNext.current) { failNext.current = false; throw new Error("Sample save failed") }
					setNote(`Saved ${item.name}`)
				}}
				onItemDelete={async (item) => {
					await new Promise((resolve) => setTimeout(resolve, 400))
					if (failNext.current) { failNext.current = false; throw new Error("Sample delete failed") }
					setNote(`Deleted ${item.name}`)
				}}
				onUpload={async (files, options, { files: staged, setProgress, signal }) => {
					for (let step = 20; step <= 100; step += 20) {
						await new Promise((resolve) => setTimeout(resolve, 120))
						if (signal.aborted) return
						for (const file of staged ?? []) setProgress(file.id, step)
					}
					if (failNext.current) { failNext.current = false; throw new Error("Sample upload failed") }
					setNote(`Uploaded ${files.length}`)
					return files.map((file): MediaLibraryItem => ({ id: `uploaded-${++uploadSequence.current}`, name: file.name, type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file", size: file.size, uploadedAt: new Date(), ...options }))
				}}
				onConfirm={(items) => setNote(`using ${items.length}`)}
			/>
			<Stack direction="horizontal" align="center" gap="sm" wrap>
				<Button tone="neutral" appearance="outline" onClick={() => { failNext.current = true; setNote("The next save, delete, or upload will fail once.") }}>
					Fail next action
				</Button>
				<Text size="sm" type="secondary">Preview recovery without mixing test controls into the library toolbar.</Text>
			</Stack>
			{!!note && <Text role="status" size="sm" type="secondary">{note}</Text>}
		</>
	)
}
