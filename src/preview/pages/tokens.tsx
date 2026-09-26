import { Heading, Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"

import { Example } from "../partials/example"
import { ComponentPage } from "../partials/component-page"
import styles from "../preview.module.css"

const SEMANTIC = [
	"background", "foreground", "card", "popover", "primary", "secondary",
	"muted", "accent", "destructive", "success", "warning", "info", "border", "ring",
]

const PALETTE = [
	"neutral-0", "neutral-100", "neutral-200", "neutral-400", "neutral-550",
	"neutral-800", "neutral-900", "brand-300", "brand-600", "danger-600",
	"success-600", "info-600", "warning-500",
]

function Swatch({ token }: { token: string }) {
	return (
		<div className={styles.swatch}>
			<div className={styles.swatchChip} style={{ backgroundColor: `var(--${token})` }} />
			<div className={styles.swatchMeta}>
				<MonoValue size="xs">--{token}</MonoValue>
			</div>
		</div>
	)
}

export function TokensPage() {
	return (
		<ComponentPage>
			<Example
				id="semantic-tokens"
				title="Semantic tokens"
				description="What components reference. A semantic token carries meaning and resolves through a palette step — never a literal."
			>
				<div className={styles.swatchGrid}>
					{SEMANTIC.map((token) => (
						<Swatch key={token} token={token} />
					))}
				</div>
			</Example>

			<Example
				id="palette"
				title="Palette"
				description="Raw ramps with no meaning attached. Nothing outside the theme references these directly — a component that reaches for `--neutral-200` has skipped the semantic tokens and will not follow a retheme."
			>
				<div className={styles.swatchGrid}>
					{PALETTE.map((token) => (
						<Swatch key={token} token={token} />
					))}
				</div>
			</Example>

			<Example
				example="tokens/scoped-theming"
				title="Scoped theming"
				description="A nested provider re-derives the whole system from whatever it overrides. This works because derived tokens are declared at every scope boundary rather than at :root — see styles/SCOPES.md."
			/>

			<Example
				id="the-levels"
				title="The levels">
				<Heading level={3} size="base">Why three</Heading>
				<Text type="secondary">
					A semantic layer decouples what a value <em>means</em> from what colour it{" "}
					<em>is</em>. Swapping semantic tokens rethemes every component; swapping the palette
					rethemes every mode. Without the palette, dark mode has to restate every
					value by hand and two tokens that should track each other can silently drift.
				</Text>
			</Example>
		</ComponentPage>
	)
}
