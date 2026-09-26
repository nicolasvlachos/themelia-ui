import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ResourcePage() {
	return (
		<ComponentPage
			title="Resource shells"
			summary="The skeleton every list and detail screen shares: a header identifying the thing, a toolbar, a body, sometimes an aside, and the three states that replace the body while it waits, fails, or comes back empty. The shells own that; the table, the form, and the fetch stay the screen's."
			importPath="@/components/features/resource"
			exports={["ResourceIndexShell", "ResourceShowShell", "TabbedResourceShell", "ResourceDetailsSection",
				"ResourceHeader", "ResourceActionBar", "ResourceEmptyState",
			]}
		>
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
				<PropTable owner="TabbedResourceShell"
					rows={[
						{ name: "title / description / actions", type: "ReactNode", description: "Feed the generated header. Omit them and pass slots.header when the header is not a title and a description." },
						{ name: "loading / empty", type: "boolean", description: "Replace the body. `empty` is a boolean rather than an inference from children — a screen with a header row and no data still has children, and only the screen knows 'no records' from 'no records MATCHING'." },
						{ name: "error", type: "ReactNode | Error", description: "Anything truthy replaces the body. See the rule above for which half it takes." },
						{ name: "onRetry", type: "() => void", description: "Wiring it puts a retry control on the generated error state. Without it there is nothing to offer." },
						{ name: "slots", type: "ResourceShellSlots", description: "header, toolbar, aside, footer, loading, empty, error. Every one has a generated default; the slot is for the screen where configuring that default prop by prop is worse than replacing it." },
						{ name: "TabbedResourceShell tabs", type: "OverflowTabItem[]", required: true, description: "Goes into the toolbar slot, so slots.toolbar still wins outright." },
						{ name: "ResourceHeader media / avatarUrl / icon", type: "ReactNode / string / ComponentType", description: "Ordered, not exclusive. A screen knows one of the three, and which one depends on what the record is — a person has an avatar, a settings section has an icon." },
						{ name: "ResourceActionBar sticky", type: "boolean", default: "false", description: "Pins the bar below the shell header, not the viewport top — for a bar carrying a selection count, which is needed exactly when a static bar has scrolled away." },
						{ name: "ResourceDetailsSection metadata", type: "MetadataListItem[]", description: "Structured facts before any free-form body. metadataColumns is a ceiling; the list steps down at narrow widths on its own." },
						{ name: "ResourceDetailsSection padding / surface", type: '"sm" | "md" | "lg" / ContentBlockSurface', default: '"md" / "bordered"', description: "Use surface=\"plain\" when the section sits inside a frame that already has chrome." },
						{ name: "ResourceHeader / ResourceActionBar", type: "component", description: "The title block and the verb row of an index or show screen, for a page that wants the shell\u2019s rhythm without its whole frame." },
						{ name: "ResourceEmptyState", type: "component", description: "One of the three states the shells swap in for content. loading, error and empty are replacements rather than overlays \u2014 they take the space the content will take, so nothing reflows when it arrives." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
