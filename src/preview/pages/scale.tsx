import { Button } from "@/components/base/buttons"
import { Checkbox, Switch } from "@/components/base/choice-inputs"
import { Input } from "@/components/base/text-inputs"
import { Stack } from "@/components/base/structure"
import { Heading, Text } from "@/components/base/typography"
import { Scope, UIProvider } from "@/lib/ui-provider"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const FACTORS = [0.75, 0.875, 1, 1.125, 1.25] as const

function ControlRow() {
	return (
		<Stack direction="horizontal" gap="md" align="center" wrap>
			<Text size="sm">Label</Text>
			<Button>Save</Button>
			<Button tone="neutral" buttonStyle="outline">
				Cancel
			</Button>
			<Button iconOnly aria-label="Add">
				＋
			</Button>
			<Input aria-label="Field" placeholder="Field" style={{ width: "9rem" }} />
			<Checkbox label="Check" defaultChecked />
			<Switch label="Switch" defaultChecked />
		</Stack>
	)
}

export function ScalePage() {
	return (
		<ComponentPage
			title="Scale & density"
			summary="One master factor keeps geometry and typography in proportion. Scoped spacing, density, and type overrides handle the few cases that need to disagree without adding per-component sizes."
		>
			<Example
				id="the-factor"
				title="The factor"
				description="Height, padding, gap, icon size, prose, and control text all follow `--scale`. Default 1."
				stacked
				code={`<UIProvider config={{ scale: 0.875 }}>
  <Toolbar />
</UIProvider>`}
			>
				{FACTORS.map((scale) => (
					<UIProvider key={scale} config={{ scale }}>
						<Stack direction="horizontal" gap="lg" align="center">
							<code style={{ width: "4rem", fontSize: "var(--text-xs)" }}>{scale}</code>
							<ControlRow />
						</Stack>
					</UIProvider>
				))}
			</Example>

			<Example
				id="why-not-size-props"
				title="Why not size props"
				description="A size prop lets one control drift out of step with the control beside it, and nothing catches it."
				stacked
			>
				<Stack gap="md">
					<Text type="secondary">
						With per-component sizes, a <code>sm</code> button next to a <code>md</code>{" "}
						checkbox is expressible, looks like a bug, and no type or test rejects it. The
						combinations multiply with every component added, and the defaults quietly
						disagree — the kit this is modelled on had four button heights, three control
						heights, and three checkbox sizes that did not line up.
					</Text>
					<Text type="secondary">
						A scale factor removes that freedom deliberately. A denser region is a{" "}
						<strong>scope</strong>, so everything inside it moves together and stays in
						proportion.
					</Text>
					<Callout>
						Typography works the same way, and keeps its size names for a different
						reason. <code>Text</code> still takes a <code>size</code>, because{" "}
						<code>xs</code> versus <code>base</code> is a semantic role — metadata versus
						body copy — not a measurement. Every step on the ramp then resolves through
						the same factor, so the role stays constant while what it measures follows
						the scope.
					</Callout>
				</Stack>
			</Example>

			<Example
				id="type-factor"
				title="Type can override the master factor"
				description="Reading size and control geometry are different decisions. An admin surface wants 14px body copy with full-size controls — coupling them means asking for smaller text shrinks every button to match."
				stacked
				code={`{/* smaller type, control geometry untouched */}
<UIProvider config={{ typography: { scale: 0.875 } }}>…</UIProvider>

{/* denser geometry, type held at its default */}
<UIProvider config={{ scale: 0.875, typography: { scale: 1 } }}>…</UIProvider>`}
			>
				<Stack gap="lg">
					<Stack gap="sm">
						<Text type="secondary" size="xs">typography.scale 0.875 — type shrinks, control geometry holds</Text>
						<UIProvider config={{ typography: { scale: 0.875 } }}>
							<Stack direction="horizontal" gap="md" align="center" wrap>
								<Text>Body copy at this factor.</Text>
								<Button>Save</Button>
								<Checkbox label="Check" defaultChecked />
							</Stack>
						</UIProvider>
					</Stack>
					<Stack gap="sm">
						<Text type="secondary" size="xs">scale 0.875 + typography.scale 1 — geometry shrinks, type holds</Text>
						<UIProvider config={{ scale: 0.875, typography: { scale: 1 } }}>
							<Stack direction="horizontal" gap="md" align="center" wrap>
								<Text>Body copy at this factor.</Text>
								<Button>Save</Button>
								<Checkbox label="Check" defaultChecked />
							</Stack>
						</UIProvider>
					</Stack>
				</Stack>
			</Example>

			<Example
				id="factor-chain"
				title="Two levels of control"
				description="A factor, then a single token. A consumer reaches in at whichever level matches the change they are making."
				stacked
				code={`/* everything denser */
<UIProvider config={{ scale: 0.875 }}>

/* heights and rows only — gaps untouched */
<Scope vars={{ "--density-scale": 0.875 }}>

/* gaps and padding only — control heights untouched */
<Scope vars={{ "--density-scale": 0.875 }}>

/* one measurement, leaving everything else alone */
<Scope vars={{ "--button-h": "2.75rem" }}>

/* a plain div does NOT work: overriding a factor needs a scope
   boundary, or the measurements above it have already resolved. */`}
			>
				<Stack gap="lg">
					<Stack gap="sm">
						<Text type="secondary" size="xs">default</Text>
						<ControlRow />
					</Stack>
					<Stack gap="sm">
						<Text type="secondary" size="xs">--density-scale: 0.8 — heights and rows tighten, gaps hold</Text>
						<Scope vars={{ "--density-scale": 0.8 }}>
							<ControlRow />
						</Scope>
					</Stack>
					<Stack gap="sm">
						<Text type="secondary" size="xs">--density-scale: 1.4 — gaps open, control heights hold</Text>
						<Scope vars={{ "--density-scale": 1.4 }}>
							<ControlRow />
						</Scope>
					</Stack>
					<Stack gap="sm">
						<Text type="secondary" size="xs">--button-h: 2.75rem — one measurement</Text>
						<Scope vars={{ "--button-h": "2.75rem" }}>
							<ControlRow />
						</Scope>
					</Stack>
				</Stack>
			</Example>

			<Example
				id="why-two-levels"
				title="Why two factors, and no third"
				stacked
			>
				<Stack gap="md">
					<Text type="secondary">
						There used to be a third level — a factor per family, so buttons could run
						small without touching inputs. It cost 215 tokens, close to half the theming
						layer, because carrying the multiplication meant minting a name for every
						measurement in every family. <code>--accordion-media-gap</code> was{" "}
						<code>--space-lg</code> wearing a different hat. The level was removed and the
						names went with it.
					</Text>
					<Callout label="Rule">
						Factors are never multiplied together. <code>--density-scale</code> and{" "}
						<code>--density-scale</code> each already resolve through <code>--scale</code>,
						so multiplying by both would square the effect — at 0.5 that is 0.25, which
						reads as a rendering bug rather than a maths one.{" "}
						<code>npm run verify factors</code> fails on that, and on any attempt to
						reintroduce a per-family factor.
					</Callout>
				</Stack>
			</Example>

			<Example
				id="nesting"
				title="Nesting"
				description="Scopes compose. A compact toolbar inside a comfortable page is two providers, and each region is internally consistent."
				stacked
				code={`<UIProvider config={{ scale: 1.125 }}>
  <Page>
    <UIProvider config={{ scale: 0.875 }}>
      <Toolbar />
    </UIProvider>
  </Page>
</UIProvider>`}
			>
				<UIProvider config={{ scale: 1.125 }}>
					<Stack gap="lg">
						<Text type="secondary" size="sm">
							Outer scope — 1.125
						</Text>
						<ControlRow />
						<UIProvider config={{ scale: 0.8 }}>
							<Stack gap="md">
								<Text type="secondary" size="sm">
									Nested scope — 0.8
								</Text>
								<ControlRow />
							</Stack>
						</UIProvider>
					</Stack>
				</UIProvider>
			</Example>

			<Example
				id="density"
				title="Density presets"
				description="Named spacing and control-geometry steps that preserve readable type. The CSS-only path works without a provider — any element can carry `data-density`."
				stacked
				code={`<UIProvider config={{ density: "compact" }}>…</UIProvider>

{/* or, with no provider at all */}
<div data-density="compact">…</div>`}
			>
				{(["compact", "default", "comfortable"] as const).map((density) => (
					<UIProvider key={density} config={{ density }}>
						<Stack direction="horizontal" gap="lg" align="center">
							<code style={{ width: "7rem", fontSize: "var(--text-xs)" }}>{density}</code>
							<ControlRow />
						</Stack>
					</UIProvider>
				))}
			</Example>

			<Example id="scale-api" title="API">
				<Heading level={3} size="sm">
					UIProvider config
				</Heading>
				<PropTable
					rows={[
						{ name: "scale", api: "@/lib/ui-provider#UIConfig.scale", type: "number", default: "1", description: "Master factor. Geometry, spacing, icons, and the type ramp follow it by default." },
						{ name: "typography.scale", api: "@/lib/ui-provider#UIConfig.typography.scale", type: "number", default: "1", description: "Type-only override. Every `--text-*` role, including control labels, without changing geometry." },
						{ name: "typography.defaultTextSize", api: "@/lib/ui-provider#UIConfig.typography.defaultTextSize", type: "TextSize", default: '"sm"', description: "Size components fall back to. 14px, not 16px: base is a deliberate step up for a dense surface." },
							{ name: "density", api: "@/lib/ui-provider#UIConfig.density", type: '"compact" | "default" | "comfortable"', default: '"default"', description: "Named spacing/control presets: 0.941176 (32px actions), 1, and 1.075. Readable type stays unchanged." },
					]}
				/>
			</Example>

			<Example id="scale-tokens" title="What --scale drives" stacked>
				<PropTable
					rows={[
						{ name: "--control-h / -sm / -2xs", api: ["css:--control-h", "css:--control-h-sm", "css:--control-h-2xs"], type: "height", description: "One height for every control — buttons, inputs, selects, triggers — and two smaller steps." },
						{ name: "--control-px-sm", api: ["css:--control-px-sm"], type: "length", description: "Inline padding for controls." },
						{ name: "--space-*", api: ["css:--space-*"], type: "length", description: "The gap and padding scale, 2xs through 2xl." },
						{ name: "--size-icon", api: ["css:--size-icon"], type: "length", description: "Interface icon sizes." },
						{ name: "--choice-size", api: ["css:--choice-size"], type: "length", description: "Checkbox and radio box; switch track height." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
