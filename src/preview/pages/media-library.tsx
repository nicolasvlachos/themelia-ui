import { useRef, useState } from "react"

import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	MediaLibrary, MediaLibraryDialog, MediaResourceGallery,
	type MediaLibraryItem,
} from "@/components/features/media-library"

import { ASSETS, COLLECTIONS } from "../examples/media-library/data"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MediaLibraryPage() {
	const [selected, setSelected] = useState<string[]>(["m1"])
	const [note, setNote] = useState<string | null>(null)
	const [open, setOpen] = useState(false)
	const failNext = useRef(false)
	const uploadSequence = useRef(0)

	const [attached, setAttached] = useState<MediaLibraryItem[]>(ASSETS.slice(0, 4))
	const [bulkAssets, setBulkAssets] = useState(ASSETS)
	const [bulkSelected, setBulkSelected] = useState<string[]>([ASSETS[0]!.id, ASSETS[1]!.id])
	const [primary, setPrimary] = useState("m1")

	return (
		<ComponentPage
			title="Media library"
			summary="The asset browser: search, filter, sort, select, edit, upload. Every field is read through an accessor, because nobody's asset records look like ours — they come from S3, Cloudinary, a media collection, a CMS, each with its own field names."
			importPath="@/components/features/media-library"
			exports={["MediaLibrary", "MediaLibraryDialog", "MediaResourceGallery", "useMediaLibrary",
				"MediaLibraryCard", "MediaLibraryGrid", "MediaLibraryTable", "MediaLibrarySelectionBar", "MediaLibraryList", "MediaLibraryToolbar", "MediaLibraryDetailPanel", "MediaLibraryUploadPanel", "MediaLibraryFooter", "MediaLibraryFooterSummary", "MediaLibraryFooterActions", "MediaLibraryEmptyState", "MediaPreview",
			]}
		>
			<Example
				id="library"
				title="Asset manager"
				description="Switch between the visual grid, compact list, and metadata table. Select visible assets without losing selections outside your search. Open details to edit metadata; a failed save keeps your draft ready to retry."
				stacked
				code={`<MediaLibrary
  items={assets}
  collections={collections}
  value={selected}
  onValueChange={setSelected}
  onItemUpdate={(item, patch) => api.updateAsset(item.id, patch)}
  onItemDelete={(item) => api.deleteAsset(item.id)}
  onUpload={(files, options, helpers) =>
    api.upload(files, options, helpers.files, helpers.setProgress, helpers.signal)}
  onConfirm={(items) => attach(items)}
/>`}
			>
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
					<Button tone="neutral" buttonStyle="outline" onClick={() => { failNext.current = true; setNote("The next save, delete, or upload will fail once.") }}>
						Fail next action
					</Button>
					<Text size="sm" type="secondary">Preview recovery without mixing test controls into the library toolbar.</Text>
				</Stack>
				{!!note && <Text role="status" size="sm" type="secondary">{note}</Text>}
			</Example>

			<Example
				example="media-library/async-library"
				title="Loading and recovery"
				description="A local service simulation with a short delay. Search and sort, simulate a failed request, then try again: filters and selection stay in place. Search for an absent filename to see no matches, or switch to an empty library. Select an asset and use it to complete the flow."
				stacked
			/>

			<Example
				id="bulk-actions"
				title="Acting on a selection"
				description="A library being browsed rather than picked from has no footer, so a selection had nowhere to go. `bulkActions` puts it in the shared batch bar — the same control the data table and product variants use. It is suppressed when the library is a picker, because that footer already reports the count."
				stacked
				code={`<MediaLibrary
  items={assets}
  bulkActions={({ selectedItems, clearSelection }) => (
    <>
      <Button tone="neutral" buttonStyle="ghost">Download</Button>
      <Button tone="destructive" buttonStyle="ghost"
        onClick={() => { remove(selectedItems); clearSelection() }}>
        Delete
      </Button>
    </>
  )}
/>`}
			>
				{/*
				 * `transform` establishes a containing block, so the floating bar docks to this
				 * example instead of the viewport. Without it the bar attaches itself to whichever
				 * library happens to be on screen, and this page has three. The same gotcha applies
				 * in an app: a floating bar inside a transformed ancestor docks to that ancestor.
				 */}
				<div style={{ transform: "translate(0)", position: "relative", width: "100%" }}>
				<MediaLibrary
					items={bulkAssets}
					collections={COLLECTIONS}
					value={bulkSelected}
					onValueChange={setBulkSelected}
					bulkActions={({ selectedCount, clearSelection }) => (
						<>
							<Button type="button" tone="neutral" buttonStyle="ghost" onClick={() => { setBulkAssets((assets) => assets.map((asset) => bulkSelected.includes(asset.id) ? { ...asset, public: true } : asset)); setNote(`Made ${selectedCount} assets public`); clearSelection() }}>
								Make public
							</Button>
							<Button
								type="button"
								tone="destructive"
								buttonStyle="ghost"
								onClick={() => {
									setBulkAssets((assets) => assets.filter((asset) => !bulkSelected.includes(asset.id)))
									setNote(`Deleted ${selectedCount}`)
									clearSelection()
								}}
							>
								Delete
							</Button>
						</>
					)}
				/>
				</div>
			</Example>

			<Example
				id="library-dialog"
				title="As a picker"
				description="The same browser in the kit's modal surface. `confirmOnSelect` turns picking into confirming and removes the footer — the shape a single-select picker wants, where there is nothing left to press."
				stacked
				code={`<MediaLibraryDialog
  open={open}
  onOpenChange={setOpen}
  items={assets}
  selectionMode="single"
  confirmOnSelect
  onConfirm={([asset]) => setCover(asset)}
/>`}
			>
				<Button type="button" onClick={() => setOpen(true)}>Pick an asset</Button>
				<MediaLibraryDialog
					open={open}
					onOpenChange={setOpen}
					items={ASSETS}
					collections={COLLECTIONS}
					selectionMode="single"
					confirmOnSelect
					allowUpload={false}
					onConfirm={(items) => setNote(`picked ${items[0]?.name}`)}
				/>
			</Example>

			<Example
				id="gallery"
				title="Attached to a record"
				description="Not a browser: the library is where assets are found, this is where the chosen ones live on the record. Reordering is buttons rather than a drag — move-earlier and move-later work with a keyboard, a screen reader, and a touch screen; a drag works with one of the three."
				stacked
				code={`<MediaResourceGallery
  items={attached}
  primaryId={coverId}
  onPrimaryChange={setCoverId}
  onReorder={(ids, items) => setAttached(items)}
  onRemove={(id) => detach(id)}
  onAdd={() => setPickerOpen(true)}
  maxItems={8}
/>`}
			>
				<MediaResourceGallery
					items={attached}
					title="Venue media"
					description="The first is the cover."
					primaryId={primary}
					onPrimaryChange={setPrimary}
					onReorder={(_ids, items) => setAttached(items)}
					onRemove={(id) => setAttached((current) => current.filter((item) => item.id !== id))}
					onAdd={() => setOpen(true)}
					maxItems={6}
				/>
			</Example>

			<Example id="media-rules" title="What the library decides" stacked>
				<Callout label="Rule">
					Every field is read through an <strong>accessor</strong>, defaulting to{" "}
					<code>MediaLibraryItem</code>'s own names. Nobody's asset records look like ours, and
					the alternative — mapping every asset into our shape on every render — throws away
					identity and breaks selection.
				</Callout>
				<Text size="sm" type="secondary">
					A <code>fetcher</code> switches the library to server mode, and{" "}
					<code>items</code> is then ignored <strong>entirely</strong>: a server that just
					returned page one of a search must not be re-filtered by a client that cannot see the
					other pages.
				</Text>
				<Text size="sm" type="secondary">
					Edits use local patches and roll back on failure while keeping the draft. Deletes
					remove assets after the handler succeeds. Upload handlers return created records;
					remote libraries then refresh their results. Supply <code>applyItemPatch</code>
					to apply edits to a custom record shape.
				</Text>
				<Text size="sm" type="secondary">
					Single-select <strong>replaces</strong> rather than toggling off: pressing another
					asset means “that one instead”, and pressing the same one meaning “none” leaves a
					picker with nothing chosen and no way back.
				</Text>
			</Example>

			<Example id="media-api" title="API">
				<PropTable owner="MediaLibrary"
					rows={[
						{ name: "items / fetcher", type: "TItem[] / (params) => Promise", description: "One or the other. Without a fetcher the library searches, filters, and sorts `items` itself; with one, the fetcher owns all three." },
						{ name: "accessors", type: "MediaLibraryAccessors", description: "Reads id, name, src, type, size, and the rest off your own shape. Supply only the ones that differ from MediaLibraryItem's names." },
						{ name: "value / onValueChange", type: "string[] / (ids, items) => void", description: "Controlled or not. The handler gets the resolved assets too, so a consumer never has to look them up again." },
						{ name: "selectionMode", type: "single | multiple", description: "Single replaces rather than toggling off — see the rule above." },
						{ name: "confirmOnSelect", type: "boolean", description: "Picking is confirming: fires onConfirm immediately and removes the footer. The shape a single-select picker wants." },
						{ name: "onItemUpdate / onItemDelete", type: "(item, patch?) => void | Promise", description: "Awaited. A rejection rolls the local overlay back and reaches onError; the panel stays open so the reader can see what failed." },
						{ name: "onUpload", type: "(files, options, helpers) => Promise", description: "helpers carries stable staged files/IDs, an AbortSignal, setProgress, and setFileStatus. Failed files stay queued for retry. Returning the created items adds AND selects them — the reader uploaded them in order to use them." },
						{ name: "collections / typeFilters", type: "options[] / filters[]", description: "What the toolbar offers. A single type filter draws no control." },
						{ name: "slots", type: "MediaLibrarySlots", description: "headerStart/End, toolbarEnd, empty, loading, error, footer, uploadEmpty, plus renderItem and renderDetail." },
						{ name: "MediaResourceGallery", type: "component", description: "The assets attached to a record, in order — with reorder, cover, and detach. `onAdd` usually opens the library dialog." },
						{ name: "useMediaLibrary", type: "hook", description: "The whole state without the chrome. Its stable refetch() retries the current query without clearing filters or selection; fetchError identifies fetch failures separately from mutation errors." },
						{ name: "MediaLibraryGrid / MediaLibraryCard / MediaLibraryList / MediaLibraryTable", type: "component", description: "Composable visual grid, compact rows, and metadata table. Each uses the same accessors and selection callbacks." },
						{ name: "MediaLibrarySelectionBar", type: "component", description: "Result counts, pending announcements, and selection of visible results. Hidden selections are preserved." },
						{ name: "applyItemPatch", type: "(item, patch) => item", description: "Maps a standard metadata patch onto a consumer-owned record shape. Defaults to merging fields onto MediaLibraryItem." },
						{ name: "MediaLibraryToolbar / MediaLibraryDetailPanel", type: "component", description: "Search, filter and view controls, and the panel for the selected asset. The detail is a COLUMN rather than an overlay: an overlay would cover the grid the reader is comparing against." },
						{ name: "MediaLibraryUploadPanel", type: "component", description: "The drop target and queue inside the library, so uploading happens where the assets are rather than behind a second dialog." },
						{ name: "MediaLibraryFooter / MediaLibraryFooterSummary / MediaLibraryFooterActions", type: "component", description: "The selection bar: what is chosen, and what can be done with it. Split so a consumer can keep the count and supply their own verbs." },
						{ name: "MediaLibraryEmptyState / MediaPreview", type: "component", description: "The state with no assets, and the thumbnail that handles an image, a video, a PDF and a file with no preview at all \u2014 the last being the case a gallery usually forgets." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
