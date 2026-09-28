import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

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
				description="`scale` moves padding, gaps, control heights, icons and type together. Default 1. Lengths round to whole pixels, so edges stay crisp at any factor."
			/>

			<Example
				id="why-not-size-props"
				title="Why two sizes and a scope"
				description="A size ladder lets one control drift out of step with the control beside it, and nothing catches it."
			>
				<Stack gap="sm">
					<Text type="secondary">
						Controls take two sizes: <code>default</code>, and <code>sm</code> for a dense
						row. A third step would make a <code>lg</code> button beside a <code>sm</code>{" "}
						checkbox expressible; it looks like a bug, and no type or test rejects it.
					</Text>
					<Text type="secondary">
						A denser or roomier region is a <strong>scope</strong> instead, so everything
						inside it moves together and stays in proportion.
					</Text>
					<Callout>
						Typography keeps its size names for a different reason. <code>Text</code> takes
						a <code>size</code> because <code>xs</code> versus <code>base</code> is a role,
						metadata versus body copy, not a measurement. Every step then follows the
						scope's type factor, so the role holds while what it measures moves.
					</Callout>
				</Stack>
			</Example>

			<Example
				example="scale/type-factor"
				title="Type has its own factor"
				description="Reading size and control geometry are different decisions. An admin surface may want 14px body copy with full-size controls; `typography.scale` moves type alone."
			/>

			<Example
				example="scale/factor-chain"
				title="A factor, or one variable"
				description="Reach in at the level of the change: a factor moves everything, a variable moves one measurement everywhere it is read."
			/>

			<Example id="why-two-factors" title="Why two factors, and no third">
				<Stack gap="sm">
					<Text type="secondary">
						A factor per component, so buttons could run small without touching fields,
						would need a variable for every measurement in every component, most of them a
						spacing variable under another name. A variable override does that job without
						the names: <code>--control-height</code> on a region resizes every control in it.
					</Text>
					<Callout label="Rule">
						CSS multiplies one factor: Text's <code>--text-scale</code>. The provider
						computes the lengths for <code>scale</code> and writes them, so no length is
						ever multiplied twice.
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
				description="Named spacing and control-height steps that keep type readable. The CSS-only path works without a provider: any element can carry `data-density`."
			/>

			<Example id="scale-api" title="API">
				<PropTable owners={["UIConfig", "TypographyConfig"]} />
			</Example>

			<Example id="scale-variables" title="What scale and density set">
				<PropTable
					rows={[
						{ name: "--padding · --padding-sm", api: ["css:--padding", "css:--padding-sm"], type: "length", description: "Container and item insets. Density and scale." },
						{ name: "--gap · --gap-sm", api: ["css:--gap", "css:--gap-sm"], type: "length", description: "Between groups and inside one. Density and scale." },
						{ name: "--control-height · --control-height-sm", api: ["css:--control-height", "css:--control-height-sm"], type: "length", description: "Every button, field, select and trigger. Density and scale." },
						{ name: "--icon-size · --icon-size-sm", api: ["css:--icon-size", "css:--icon-size-sm"], type: "length", description: "Interface icons. Scale only: density keeps icons put." },
						{ name: "--text-scale", api: ["css:--text-scale"], type: "number", description: "Multiplies every type step. `typography.scale`, or `scale` when that is unset." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
