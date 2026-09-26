import { Heading, Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { UIProvider } from "@/lib/ui-provider"
import { Button } from "@/components/base/buttons"

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
		<ComponentPage
			title="Tokens & theming"
			summary="Three tiers: primitives carry no meaning, semantics carry no value, and the theming layer computes everything else from them."
		>
			<Example
				id="semantic-tier"
				title="Semantic tier"
				description="What components reference. A semantic carries meaning and resolves through a primitive — never a literal."
				stacked
			>
				<div className={styles.swatchGrid}>
					{SEMANTIC.map((token) => (
						<Swatch key={token} token={token} />
					))}
				</div>
			</Example>

			<Example
				id="primitive-tier"
				title="Primitive tier"
				description="Raw ramps with no meaning attached. Nothing outside the theme references these directly — a component that reaches for `--neutral-200` has skipped the semantic tier and will not follow a retheme."
				stacked
			>
				<div className={styles.swatchGrid}>
					{PALETTE.map((token) => (
						<Swatch key={token} token={token} />
					))}
				</div>
			</Example>

			<Example
				id="scoped-theming"
				title="Scoped theming"
				description="A nested provider re-derives the whole system from whatever it overrides. This works because derived tokens are declared at every scope boundary rather than at :root — see styles/SCOPES.md."
				stacked
				code={`<UIProvider config={{ theme: { colors: { primary: "oklch(0.55 0.2 25)" } } }}>`}
			>
				<div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
					<Button>root</Button>
					<UIProvider config={{ theme: { colors: { primary: "oklch(0.55 0.2 25)" } } }}>
						<Button>scoped red</Button>
					</UIProvider>
					<UIProvider config={{ theme: { colors: { primary: "oklch(0.5 0.2 265)" } } }}>
						<Button>scoped blue</Button>
					</UIProvider>
					<UIProvider config={{ density: "compact" }}>
						<Button>compact</Button>
					</UIProvider>
					<UIProvider config={{ density: "comfortable" }}>
						<Button>comfortable</Button>
					</UIProvider>
				</div>
			</Example>

			<Example
				id="the-tiers"
				title="The tiers" stacked>
				<Heading level={3} size="base">Why three</Heading>
				<Text type="secondary">
					A semantic layer decouples what a value <em>means</em> from what colour it{" "}
					<em>is</em>. Swapping semantics rethemes every component; swapping primitives
					rethemes every mode. Without the primitive tier, dark mode has to restate every
					value by hand and two tokens that should track each other can silently drift.
				</Text>
			</Example>
		</ComponentPage>
	)
}
