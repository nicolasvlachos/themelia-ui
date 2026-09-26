import { Separator } from "@/components/base/display"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SeparatorPage() {
	return (
		<ComponentPage
			title="Separator"
			summary="A rule between regions. Decorative by default, so assistive technology does not announce a line that carries no meaning."
			importPath="@/components/base/display"
			exports={["Separator"]}
		>
			<Example
				id="separator"
				title="Separator"
				description="A labelled separator is a rule with a gap punched through it, not two rules — so the line meets the label exactly at both sides regardless of text length."
				stacked
				code={`<Separator />
<Separator label="OR" />
<Separator orientation="vertical" />`}
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					<Separator />
					<Separator label="OR" />
					<Stack direction="horizontal" gap="md" align="center" style={{ height: "1.5rem" }}>
						<Text size="sm">Left</Text>
						<Separator orientation="vertical" />
						<Text size="sm">Right</Text>
					</Stack>
				</Stack>
			</Example>

			<Example
				id="separator-variants"
				title="Variants and thickness"
				description="A dashed or dotted rule reads as provisional — a fold, a drop target, a boundary the reader can cross — where a solid one reads as structure. Thickness is a per-rule override of `--separator-thickness`, for a seam between panels rather than between rows."
				stacked
				code={`<Separator variant="dashed" />
<Separator variant="dotted" />
<Separator thickness={2} />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<Stack gap="xs">
						<Text size="xs" type="secondary">solid</Text>
						<Separator />
					</Stack>
					<Stack gap="xs">
						<Text size="xs" type="secondary">dashed</Text>
						<Separator variant="dashed" />
					</Stack>
					<Stack gap="xs">
						<Text size="xs" type="secondary">dotted</Text>
						<Separator variant="dotted" />
					</Stack>
					<Stack gap="xs">
						<Text size="xs" type="secondary">thickness=&#123;2&#125;</Text>
						<Separator thickness={2} />
					</Stack>
					<Stack direction="horizontal" gap="lg" style={{ height: "3rem" }}>
						<Text size="sm">Vertical</Text>
						<Separator orientation="vertical" variant="dashed" />
						<Text size="sm">rules</Text>
						<Separator orientation="vertical" thickness={2} />
						<Text size="sm">too</Text>
					</Stack>
				</Stack>
			</Example>

			<Example id="separator-api" title="API">
				<PropTable owner="Separator"
					rows={[
						{ name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which way the rule runs. A vertical separator needs a height from its container." },
						{ name: "variant", type: '"solid" | "dashed" | "dotted"', default: '"solid"', description: "How the rule is drawn. Structural, not semantic — a dashed rule is the same divider, drawn as provisional." },
						{ name: "thickness", type: "string | number", description: "Per-rule override of `--separator-thickness`. A number is read as pixels." },
						{ name: "label", type: "ReactNode", description: "Text set into a gap in the rule. Drops the separator role, because the rule is then decoration around real text." },
						{ name: "aria-hidden", type: "boolean", description: "Set true to hide a decorative rule from assistive technology. Unlabelled separators otherwise expose separator semantics." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
