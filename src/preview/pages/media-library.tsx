import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MediaLibraryPage() {
	return (
		<ComponentPage>
			<Example
				example="media-library/library"
				title="Asset manager"
				description="Switch between the visual grid, compact list, and metadata table. Select visible assets without losing selections outside your search. Open details to edit metadata; a failed save keeps your draft ready to retry."
			/>

			<Example
				example="media-library/async-library"
				title="Loading and recovery"
				description="A local service simulation with a short delay. Search and sort, simulate a failed request, then try again: filters and selection stay in place. Search for an absent filename to see no matches, or switch to an empty library. Select an asset and use it to complete the flow."
			/>

			<Example
				example="media-library/bulk-actions"
				title="Acting on a selection"
				description="A library being browsed rather than picked from has no footer for a selection to go to. `bulkActions` puts it in the shared batch bar — the same control the data table and product variants use. It is suppressed when the library is a picker, because that footer already reports the count."
			/>

			<Example
				example="media-library/library-dialog"
				title="As a picker"
				description="The same browser in the kit's modal surface. `confirmOnSelect` turns picking into confirming and removes the footer — the shape a single-select picker wants, where there is nothing left to press."
			/>

			<Example
				example="media-library/gallery"
				title="Attached to a record"
				description="Not a browser: the library is where assets are found, this is where the chosen ones live on the record. Reordering is buttons rather than a drag — move-earlier and move-later work with a keyboard, a screen reader, and a touch screen; a drag works with one of the three."
			/>

			<Example id="media-rules" title="What the library decides">
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
				<PropTable owner="MediaLibrary" />
				<PropTable
					symbols={[
						"MediaResourceGallery",
						"useMediaLibrary",
						"MediaLibraryGrid",
						"MediaLibraryCard",
						"MediaLibraryList",
						"MediaLibraryTable",
						"MediaLibrarySelectionBar",
						"MediaLibraryToolbar",
						"MediaLibraryDetailPanel",
						"MediaLibraryUploadPanel",
						"MediaLibraryFooter",
						"MediaLibraryFooterSummary",
						"MediaLibraryFooterActions",
						"MediaLibraryEmptyState",
						"MediaPreview",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
