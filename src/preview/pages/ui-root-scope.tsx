import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function UIRootScopePage() {
	return (
		<ComponentPage>
			<Example
				example="ui-root-scope/ui-scope-density"
				title="A scope is a region"
				description="Each card sets its own density. The scope writes only its OWN overrides — everything else cascades in from above — so a nested scope is a nested scope rather than a fresh start."
			/>

			<Example
				example="ui-root-scope/ui-scope-nesting"
				title="Nesting merges"
				description="The cascade merges the custom properties and context merges the JavaScript half, so an inner scope changing density inherits the outer scope's theme without restating it. There is no depth limit and no remount: writing a custom property is ordinary state."
			/>

			<Example
				example="ui-root-scope/ui-scope-render"
				title="render decides the element"
				description="A scope forced to be a div is unusable exactly where one is most wanted — inside a table, a definition list, or any markup with an opinion about its children. It renders what you ask for."
			/>

			<Example
				example="ui-root-scope/ui-portal-host"
				title="Popups stay inside the scope"
				description="A portal renders outside the scope's DOM subtree, and both scoping mechanisms — custom properties and the `[data-density]` / `[data-theme]` selectors — work by inheritance down it. So a menu opened inside a compact region would come out at the ROOT's density. `UIPortalHost` renders the portal target inside the scope instead, and the cascade does the rest."
				overflowing
			/>

			<Example id="ui-root-rule" title="Which one to reach for">
				<Callout label="Rule">
					<code>UIRoot</code> once per React root, for the application's defaults. It
					renders no element — a box at the top of every app that used one is a layout
					node nobody asked for — and it touches the document only when you name a{" "}
					<code>documentTarget</code>. <code>UIScope</code> everywhere else.{" "}
					<code>UIProvider</code> composes both and infers the job: outermost, a root that
					themes <code>documentElement</code> plus a scope; nested, a scope only.
				</Callout>
			</Example>

			<Example id="ui-root-api" title="API">
				<PropTable owners={["CSPProvider", "UIRoot", "UIScope", "UIPortalHost", "Scope"]} />
				<PropTable symbols={["useUIPortalContainer"]} />
			</Example>

			<Example id="ui-provider-hooks" title="Reading the config">
				<Callout>
					Every hook reads the nearest scope, falling back to the root and then to the
					library's own defaults. The resolution a component follows is{" "}
					<code>props.value ?? useFooConfig().value ?? fallback</code> — so a consumer who
					pins a prop always wins, and a component that pins one takes the choice away from
					the provider.
				</Callout>
				<PropTable
					symbols={[
						"useUIConfig",
						"useFormatting",
						"useMoneyConfig",
						"useDatesConfig",
						"useOverlayConfig",
						"useTypographyConfig",
						"useDensity",
						"useScale",
						"useDefaults",
						"UIConfigContext",
						"UINestedContext",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
