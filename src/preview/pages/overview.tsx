import { Link } from "react-router-dom"
import { BoxIcon, LayersIcon, PaletteIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Heading, Text } from "@/components/base/typography"

import { CodeBlock } from "../partials/code-block"
import { Callout } from "../partials/callout"
import { MODULE_COUNT, TIERS } from "../partials/tier-summary"
import { Pager } from "../partials/pager"
import styles from "../preview.module.css"

const FEATURES = [
	{
		icon: <LayersIcon />,
		title: "Cascade layers, not class merging",
		body: "Component rules compile into @layer components, so a consumer's unlayered CSS always wins. That is the job tailwind-merge does at runtime, done by the cascade at no cost.",
	},
	{
		icon: <PaletteIcon />,
		title: "The provider is the token system",
		body: "UIProvider renders an element, writes tokens onto it, and supplies config through context. Being a DOM boundary is what makes nesting and runtime changes work at all.",
	},
	{
		icon: <BoxIcon />,
		title: "Native top layer for modals",
		body: "Dialog, alert dialog, and sheet are one primitive on the native <dialog> element. No z-index to manage, and nothing can clip an overlay.",
	},
	{
		icon: <ZapIcon />,
		title: "Three levels of tokens",
		body: "The palette carries no meaning, semantic tokens carry no value, and the theming layer computes everything else. Swapping semantic tokens rethemes components; swapping the palette rethemes modes.",
	},
]

export function OverviewPage() {
	return (
		<>
			<section className={styles.hero}>
				<Heading level={1} size="2xl">
					A React component library on CSS Modules
				</Heading>
				<div style={{ marginTop: "var(--space-lg)" }}>
					<Text type="secondary" size="lg">
						Built on Base UI and native elements. No Tailwind, no shadcn, no utility classes —
						every component is authored, tokenized, and yours to edit.
					</Text>
				</div>
				<div className={styles.heroActions}>
					<Button render={<Link to="/tokens" />}>
						Get started
					</Button>
					<Button tone="neutral" buttonStyle="outline" render={<Link to="/components" />}>
						Browse components
					</Button>
				</div>
			</section>

			<section id="tiers" className={styles.section}>
				<div className={styles.sectionHeader}>
					<Heading level={2} size="base">
						Tiers
					</Heading>
					<Text type="secondary">
						{TIERS.length} tiers across {MODULE_COUNT} modules, and the dependency direction only
						ever points down.
					</Text>
				</div>
				<Stack gap="md">
					{/* Read from the generated index, so it cannot go stale. */}
					{TIERS.map((tier) => (
						<Text key={tier.id}>
							<strong>{tier.id}</strong> — {tier.holds}{" "}
							<Text tag="span" type="secondary" size="xs">
								({tier.modules})
							</Text>
						</Text>
					))}
					<Callout>
						There is no vendored layer: no directory of copied-in files that are off-limits
						to edit. Every component is the kit's own, so nothing needs a wrapper to become
						usable.
					</Callout>
				</Stack>
			</section>

			<section id="installation" className={styles.section}>
				<div className={styles.sectionHeader}>
					<Heading level={2} size="base">
						Installation
					</Heading>
					<Text type="secondary">
						One stylesheet import at the application root. Everything after that is plain CSS —
						no build step, no PostCSS plugin required to read it.
					</Text>
				</div>
				<CodeBlock
					code={`import "themelia-ui/styles"
import { UIProvider } from "themelia-ui"

export function App({ children }) {
  return (
    <UIProvider config={{ density: "default" }}>
      {children}
    </UIProvider>
  )
}`}
				/>
			</section>

			<section id="what-it-buys" className={styles.section}>
				<div className={styles.sectionHeader}>
					<Heading level={2} size="base">
						What the model buys
					</Heading>
				</div>
				<div className={styles.featureGrid}>
					{FEATURES.map((feature) => (
						<div key={feature.title} className={styles.feature}>
							<div className={styles.featureIcon} aria-hidden>
								{feature.icon}
							</div>
							<Heading level={3} size="sm">
								{feature.title}
							</Heading>
							<div style={{ marginTop: "var(--space-xs)" }}>
								<Text type="secondary" size="sm">
									{feature.body}
								</Text>
							</div>
						</div>
					))}
				</div>
			</section>

			<Pager />
		</>
	)
}
