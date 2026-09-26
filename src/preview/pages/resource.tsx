import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ResourcePage() {
	return (
		<ComponentPage>
			<Example
				example="resource/resource-index"
				title="ResourceIndexShell"
				description="A list screen. loading, error, and empty REPLACE the body rather than sitting beside it — a screen showing a spinner above a stale table is giving two answers to the same question, and the reader has no way to tell which one is current."
			/>

			<Example
				example="resource/resource-show"
				title="ResourceShowShell"
				description="A detail screen, with an aside. The aside drops below the body on a CONTAINER query, not a media query — the same shell sits inside a full-width page and inside a split pane, and only the container knows which."
			/>

			<Example
				example="resource/tabbed-resource"
				title="TabbedResourceShell"
				description="The show shell with a tab row in its toolbar. The tabs scroll rather than wrap: wrapping onto a second line changes the page's height as the reader switches, which shifts everything below them."
			/>

			<Example
				example="resource/resource-empty"
				title="ResourceEmptyState"
				description="The shell's empty state on its own, for a screen supplying its own through slots.empty. It is `Empty` with the resource hook applied, so an illustration, a footer, and the dashed affordance all work exactly as they do there."
			/>

			<Example id="resource-rule" title="What `error` accepts">
				<Callout label="Rule">
					An <code>Error</code>, a string, or a number is a <strong>message</strong> and
					becomes the generated error state&rsquo;s description. Any other truthy node is
					rendered <strong>instead of</strong> the generated state — which is how a screen
					supplies a 404 panel that is not really an error at all. Both replace the body;
					neither sits beside it.
				</Callout>
			</Example>

			<Example id="resource-api" title="API">
				<PropTable owners={["TabbedResourceShell", "ResourceHeader", "ResourceActionBar", "ResourceDetailsSection"]} />
				<PropTable symbols={["ResourceEmptyState"]} />
			</Example>
		</ComponentPage>
	)
}
