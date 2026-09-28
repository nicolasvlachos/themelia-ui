import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { THEME_DEFAULTS, type ThemeVariable } from "@/lib/ui-provider/tokens.generated"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import styles from "../preview.module.css"

const COLOURS = [
	"background", "foreground", "card", "popover", "muted", "muted-foreground", "accent",
	"border", "input", "ring", "primary", "secondary", "destructive", "success", "warning",
	"info", "link", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "sidebar",
]

/* Each pair: the default, then the smaller or lighter step. */
const PAIRS: { names: [ThemeVariable, ThemeVariable]; type: string; description: string }[] = [
	{ names: ["--radius", "--radius-sm"], type: "length", description: "Containers take the first, anything inside one the second. A nested corner is the parent's radius minus its inset." },
	{ names: ["--padding", "--padding-sm"], type: "length", description: "Container insets; item insets: rows, cells, chips, fields." },
	{ names: ["--gap", "--gap-sm"], type: "length", description: "Between groups; inside a group." },
	{ names: ["--control-height", "--control-height-sm"], type: "length", description: "Every button, field, select and trigger; the dense step." },
	{ names: ["--icon-size", "--icon-size-sm"], type: "length", description: "Icons beside text; icons in dense rows and chips." },
	{ names: ["--shadow", "--shadow-lg"], type: "shadow", description: "Raised: a framed card, a thumb. Floating: popovers, menus, dialogs." },
	{ names: ["--tint", "--tint-strong"], type: "percentage", description: "How much of a colour a soft fill mixes in; how much a tinted line does." },
	{ names: ["--duration-fast", "--duration"], type: "time", description: "State changes; entrances. Both share `--ease`." },
]

function Swatch({ name }: { name: string }) {
	return (
		<div className={styles.swatch}>
			<div className={styles.swatchChip} style={{ backgroundColor: `var(--${name})` }} />
			<div className={styles.swatchMeta}>
				<MonoValue size="xs">--{name}</MonoValue>
			</div>
		</div>
	)
}

export function TokensPage() {
	return (
		<ComponentPage>
			<Example
				id="colours"
				title="Colours"
				description="Each colour is one variable holding both modes, `light-dark(light, dark)`. The element's `color-scheme`, set by `.light`, `.dark` or `data-theme`, picks the half."
			>
				<div className={styles.swatchGrid}>
					{COLOURS.map((name) => (
						<Swatch key={name} name={name} />
					))}
				</div>
			</Example>

			<Example
				example="tokens/colour-island"
				title="Colour islands"
				description="A region can switch mode on its own. Nothing is restated: the variables inherit unresolved, and each element resolves the half its own scheme picks."
			/>

			<Example
				id="two-of-each"
				title="Two of each"
				description="Every length, shadow, tint and duration comes as a pair. Components compute the rest where they use it: arithmetic on these, never a third step."
			>
				<PropTable
					rows={PAIRS.map(({ names, type, description }) => ({
						name: names.join(" · "),
						api: names.map((name) => `css:${name}`),
						type,
						default: names.map((name) => THEME_DEFAULTS[name]).join(" · "),
						description,
					}))}
				/>
			</Example>

			<Example
				example="tokens/scoped-theming"
				title="Scoped theming"
				description="A nested provider writes the variables it overrides onto its own element. Everything inside inherits them."
			/>

			<Example id="one-level" title="One level">
				<Stack gap="sm">
					<Text type="secondary">
						The theme is about eighty variables, declared once at <code>:root</code>. A
						component reads them and derives what it needs in place: a soft fill is{" "}
						<code>color-mix(in oklab, var(--primary) var(--tint), transparent)</code>, a
						nested corner is <code>calc(var(--radius) - var(--padding-sm))</code>.
					</Text>
					<Callout>
						Because nothing is derived ahead of time, an override anywhere reaches every
						reader below it. Set <code>--primary</code> on a region and every hover, tint and
						ring inside follows.
					</Callout>
				</Stack>
			</Example>
		</ComponentPage>
	)
}
