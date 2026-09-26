import { Stack } from "@/components/base/structure"
import { Heading, Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ScalePage() {
	return (
		<ComponentPage>
			<Example
				example="scale/the-factor"
				title="The factor"
				description="Height, padding, gap, icon size, prose, and control text all follow `--scale`. Default 1."
			/>

			<Example
				id="why-not-size-props"
				title="Why not size props"
				description="A size prop lets one control drift out of step with the control beside it, and nothing catches it."
			>
				<Stack gap="md">
					<Text type="secondary">
						With per-component sizes, a <code>sm</code> button next to a <code>md</code>{" "}
						checkbox is expressible, looks like a bug, and no type or test rejects it. The
						combinations multiply with every component added, and the defaults quietly
						disagree — four button heights beside three control heights and three checkbox
						sizes, none of them lining up.
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
				example="scale/type-factor"
				title="Type can override the master factor"
				description="Reading size and control geometry are different decisions. An admin surface wants 14px body copy with full-size controls — coupling them means asking for smaller text shrinks every button to match."
			/>

			<Example
				example="scale/factor-chain"
				title="Two levels of control"
				description="A factor, then a single token. A consumer reaches in at whichever level matches the change they are making."
			/>

			<Example
				id="why-two-levels"
				title="Why two factors, and no third"
			>
				<Stack gap="md">
					<Text type="secondary">
						A third level — a factor per module, so buttons could run small without
						touching inputs — is deliberately absent. Carrying the multiplication means
						minting a name for every measurement in every module: about 215 tokens, close
						to half the theming layer, most of them a spacing token under another name —
						an <code>--accordion-media-gap</code> that is only <code>--space-lg</code>.
					</Text>
					<Callout label="Rule">
						Factors are never multiplied together. <code>--density-scale</code> and{" "}
						<code>--text-scale</code> each already resolve through <code>--scale</code>,
						so multiplying by both would square the effect — at 0.5 that is 0.25, which
						reads as a rendering bug rather than a maths one.{" "}
						<code>npm run verify factors</code> fails on that, and on any attempt to
						reintroduce a per-module factor.
					</Callout>
				</Stack>
			</Example>

			<Example
				example="scale/nesting"
				title="Nesting"
				description="Scopes compose. A compact toolbar inside a comfortable page is two providers, and each region is internally consistent."
			/>

			<Example
				example="scale/density"
				title="Density presets"
				description="Named spacing and control-geometry steps that preserve readable type. The CSS-only path works without a provider — any element can carry `data-density`."
			/>

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

			<Example id="scale-tokens" title="What --scale drives">
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
