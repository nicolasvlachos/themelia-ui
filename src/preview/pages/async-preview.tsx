import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AsyncPreviewPage() {
	return (
		<ComponentPage
			title="Async preview"
			summary="A popover that fetches when it opens. The kit owns the surface, the trigger, the four states, and the three things that make hover-fetching hard to get right — aborting, racing, and refetching what it already has. The consumer owns the request and what a record looks like."
			importPath="@/components/features/async-preview"
			exports={["AsyncPreview", "PreviewTriggerCell", "useAsyncPreview", "createAsyncPreview",
				"AsyncPreviewRoot", "AsyncPreviewTrigger", "AsyncPreviewContent", "AsyncPreviewBody", "AsyncPreviewLoading", "AsyncPreviewError", "AsyncPreviewEmpty", "AsyncPreviewState", "useAsyncPreviewContext",
			]}
		>
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
				stacked
			/>

			<Example id="async-preview-rule" title="What the hook handles for you" stacked>
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
				<PropTable owner="useAsyncPreview"
					rows={[
						{ name: "type", type: "string", description: "Names the kind of record. Passed back to onShow so one fetcher can serve several types." },
						{ name: "context", type: "TContext", description: "Whatever the fetcher needs — usually an id. Handed to onShow unchanged." },
						{ name: "onShow / data", type: "(args) => Promise<TData | null> / TData | null", description: "Supply one. `data` is the static form: same component, same states, no request, for a row that already loaded what the preview shows." },
						{ name: "cacheKey", type: "string", description: "Identifies the record and enables the cache. Change it when the record changes; absent means each open fetches or consumes its hover prefetch." },
						{ name: "cachePolicy", type: '"cache-first" | "always"', default: '"cache-first"', description: "`always` refetches on every open — for a value that changes while the reader is on the page." },
						{ name: "staleTime", type: "number", default: "300_000", description: "How long a cache entry counts as fresh, in ms. Entries are evicted on read; nothing wakes up on a timer." },
						{ name: "setLoading / setMeta", api: ["AsyncPreviewShowArgs.setLoading", "AsyncPreviewShowArgs.setMeta"], type: "(value) => void", description: "Given to onShow. setLoading reports a slow step — “Decrypting…” — without resolving; setMeta carries a count or a permission alongside the record." },
						{ name: "prefetchOnHover", api: "AsyncPreviewTrigger.prefetchOnHover", type: "boolean", default: "true", description: "On the Trigger. Starts the fetch on pointer-enter, once per record. Not on focus: prefetching for every trigger a keyboard user tabs past would fire a request per row." },
						{ name: "Body children", api: "AsyncPreviewBody.children", type: "(data, state) => ReactNode", description: "Runs only in the success state, with data non-null — so `data.name` needs no guard." },
						{ name: "Loading / Error / Empty children", api: ["AsyncPreviewLoading.children", "AsyncPreviewError.children", "AsyncPreviewEmpty.children"], type: "ReactNode | (state) => ReactNode", description: "Replaces the default. The function form is what an error slot wants — it is the only way to show the error." },
						{ name: "clearAsyncPreview\u00adCache", api: "clearAsyncPreviewCache", type: "(cacheKey?: string) => void", description: "One key, or everything. Call it after a mutation invalidates a record." },
						{ name: "createAsync\u00adPreview()", api: "createAsyncPreview", type: "<TData, TContext, TType>() => parts", description: "Binds the generics once for a record shape used in more than one place, instead of restating them at every part." },
						{ name: "hasPreview / disabledReason", api: ["PreviewTriggerCell.hasPreview", "PreviewTriggerCell.disabledReason"], type: "boolean / ReactNode", description: "On PreviewTriggerCell. Off renders an inert span with the same rhythm. A reason becomes a tooltip on it." },
						{ name: "AsyncPreviewRoot / AsyncPreviewTrigger / AsyncPreviewContent / AsyncPreviewBody", type: "component", description: "The compound over useAsyncPreview. Compound rather than one `renderPreview` prop because the four states want four different shapes, and a single render prop makes the caller branch on all of them every time." },
						{ name: "AsyncPreviewLoading / AsyncPreviewError / AsyncPreviewEmpty / AsyncPreviewState", type: "component", description: "One per state, so each is styled where it is written. AsyncPreviewState is the escape hatch for a caller who genuinely wants to branch themselves." },
						{ name: "useAsyncPreviewContext", type: "hook", description: "The current state and data, for a part rendered outside the provided ones \u2014 a footer that counts results, a header that names what is loading." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
