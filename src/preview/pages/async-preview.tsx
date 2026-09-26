import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AsyncPreviewPage() {
	return (
		<ComponentPage>
			<Example
				example="async-preview/async-preview-basic"
				title="Fetching on open"
				description="onShow receives a signal and returns the record. Everything else — the spinner, the retry, the empty case — is already written, so a preview is the fetch plus what the record looks like."
			/>

			<Example
				example="async-preview/async-preview-states"
				title="The four states"
				description="idle before the first open, then one of loading, success, error, empty. A fetch that resolves to null or undefined is empty, not failed — “we looked and there is nothing” is a different sentence from “we could not look”, and a preview that conflates them sends the reader to check a record that is fine."
			/>

			<Example
				example="async-preview/preview-trigger-cell"
				title="PreviewTriggerCell"
				description="The trigger shaped for a table cell. It renders a button only when there is a preview to open — the last row has no customer, so it keeps the column's rhythm with no caret, no pointer, and no popup ARIA. A column where nine rows are clickable and the tenth only looks clickable is a column a reader stops trusting."
			/>

			<Example id="async-preview-rule" title="What the hook handles for you">
				<Callout label="Rule">
					Three things, and they are the reason this is not a <code>useEffect</code> in a
					popover. <strong>Abort</strong>: the preview closes or changes record, the request is cancelled,
					and the rejection is swallowed rather than shown as an error.{" "}
					<strong>Race</strong>: two rows hovered in quick succession resolve out of order,
					and every response is checked against a request id before it writes state — so
					the second row never shows the first row&rsquo;s record. <strong>Repeat</strong>:
					a module-scope cache keyed by <code>cacheKey</code> serves a repeated hover
					without a request. No <code>cacheKey</code>, no cache — which is right for a
					preview whose context does not identify a record.
				</Callout>
			</Example>

			<Example id="async-preview-api" title="API">
				<PropTable
					owners={[
						"useAsyncPreview",
						"AsyncPreviewShowArgs",
						"AsyncPreviewTrigger",
						"AsyncPreviewBody",
						"AsyncPreviewSlotProps",
						"PreviewTriggerCell",
					]}
				/>
				<PropTable
					symbols={[
						"AsyncPreviewRoot",
						"AsyncPreviewContent",
						"AsyncPreviewLoading",
						"AsyncPreviewError",
						"AsyncPreviewEmpty",
						"AsyncPreviewState",
						"useAsyncPreviewContext",
						"clearAsyncPreviewCache",
						"createAsyncPreview",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
