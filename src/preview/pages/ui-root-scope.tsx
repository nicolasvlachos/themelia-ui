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
				<PropTable
					rows={[
						{ name: "CSPProvider", type: "{ nonce?, disableStyleElements?, children }", description: "Passes the request nonce and inline-style policy to every Base UI-backed primitive below it. Place it once around the React root during SSR; disableStyleElements is for consumers that provide the equivalent positioning CSS themselves." },
						{ name: "UIRoot config", type: "UIConfig", description: "The application's defaults, merged over the library's own. Resolution is component prop → nearest scope → root config → component fallback." },
						{ name: "UIRoot documentTarget", type: '"documentElement" | "body" | false', default: "false", description: "Which element gets the theme and density attributes. Explicit on purpose: mirroring onto the document is the only way a root can own the page canvas, and it is also the only thing here that touches state outside the tree. A component that reaches for the document unasked fights the next React root, the next test, and any app already managing its own `data-theme`." },
						{ name: "UIRoot — restores, never removes", api: "UIRoot", type: "behaviour", description: "It captures what each attribute was before it mounted and puts it back on unmount. Deleting them instead would take an app's own theme with it whenever a provider unmounted inside that app." },
						{ name: "UIRoot — one owner, handed on", api: "UIRoot", type: "behaviour", description: "Two independent React roots — a host app and an embedded widget — both think they are the top. Each asks for the document and the OLDEST root still mounted owns it; the rest leave it alone. When the owner unmounts the document goes to the next root in line rather than reverting, so a widget still on the page is still honoured. body and documentElement are tracked separately, and a final unmount restores what was there before the first root arrived — not what the previous owner wrote." },
						{ name: "UIScope config / transparent", type: "UIConfig / boolean", default: "— / true", description: "Its own overrides only; inherited values already cascade in. transparent removes the element from layout with display: contents — custom properties still inherit through it, because inheritance does not depend on the box." },
						{ name: "UIScope render", type: "ReactElement", description: "The element the scope becomes. Base UI's contract, and the same one Item and Stack use." },
						{ name: "UIScope — never the document", api: "UIScope", type: "behaviour", description: "A region governs its subtree. Reaching past it is the root's job, and only when asked." },
						{ name: "UIPortalHost", type: "{ container?, children }", description: "Keeps popups inside this subtree so they inherit the scope around them. Renders one display: contents element as the portal target — a box would become a flex or grid item in whatever laid the scope out. Pass container to use an element the application already manages, such as a shadow root or its own overlay layer." },
						{ name: "useUIPortalContainer", type: "(explicit?) => container | undefined", description: "What a portal in this subtree should target: the explicit argument, then the nearest UIPortalHost, then undefined — which leaves the primitive's own default alone. undefined rather than document.body on purpose: the primitive's default is the thing that knows about shadow roots, SSR and nested portals." },
						{ name: "container (on every popup)", api: "@/components/base/popover#PopoverContent.container", type: "HTMLElement | ShadowRoot | null", description: "DropdownMenu, ContextMenu, Select, Tooltip, HoverCard, Popover, NavigationMenu and Toaster each accept one, and it wins over the scoped host. With no host and no prop, each primitive keeps its own default." },
						{ name: "Scope", type: "{ vars, as?, transparent?, className?, style? }", description: "A token boundary with no config machinery. Overriding a factor needs a scope boundary, not just any element: derived tokens are declared at :root, [`data-ui-scope`], [`data-density`], [`data-theme`], .light and .dark, so a plain div that sets `--density-scale` sets a variable nothing reads. Scope renders `data-ui-scope`, which puts the element on that list. Use it when the change is purely tokens." },
					]}
				/>
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
					rows={[
						{ name: "useUIConfig", type: "() => ResolvedUIConfig", description: "The whole resolved configuration at this point in the tree. Prefer a narrower hook: this one re-renders on any change." },
						{ name: "useFormatting", type: "() => FormattingConfig", description: "Locale and number formatting shared by the primitives." },
						{ name: "useMoneyConfig", type: "() => MoneyConfig", description: "Currency, its placement and fraction digits — what Money reads when the prop is absent." },
						{ name: "useDatesConfig", type: "() => DatesConfig", description: "Date and time presentation defaults, read by the date primitives and pickers." },
						{ name: "useOverlayConfig", type: "() => OverlayConfig & { darkMenus: boolean }", description: "Overlay policy: whether dropdown and context menus render dark (default true), and the modal scrim's blur." },
						{ name: "useTypographyConfig", type: "() => TypographyConfig", description: "Typographic defaults such as the base size components inherit when no size prop is given." },
						{ name: "useDensity", type: "() => Density", description: "The resolved density. The visual effect comes from the `data-density` attribute; this is for logic that must branch on it." },
						{ name: "useScale", type: "() => number", description: "The resolved `--scale` factor as a number, for a measurement JavaScript has to compute rather than let CSS derive." },
						{ name: "useDefaults", type: "(family, ownDefaults) => Defaults", description: "Per-component prop defaults. The component passes its OWN defaults and the scope merges over them, which keeps the values beside the component, makes the call order-independent, and lets an unused module tree-shake away." },
						{ name: "UIConfigContext", type: "Context<ResolvedUIConfig>", description: "The context itself. Exported for a consumer building a provider of their own; the hooks are the supported way in." },
						{ name: "UINestedContext", type: "Context<boolean>", description: "Whether a scope is already above this point. UIRoot uses it to decide it is not the top, which is how nested roots avoid fighting over the document." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
