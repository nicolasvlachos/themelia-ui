import { Progress, ProgressCircle } from "@/components/base/feedback"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ProgressPage() {
	return (
		<ComponentPage
			title="Progress"
			summary="A determinate bar when the total is known, and a travelling band when it is not. The indeterminate form drops its ARIA value attributes rather than reporting a number it does not have. ProgressCircle is the same measurement drawn as a ring, for the places where the reading has to sit inside the mark."
			importPath="@/components/base/feedback"
			exports={["Progress", "ProgressCircle"]}
		>
			<Example
				id="progress"
				title="Progress"
				description="Determinate by default. Without a value it becomes a travelling band, because a bar frozen at some width reads as stalled progress rather than unknown progress."
				stacked
				code={`<Progress value={64} label="Upload" />
<Progress label="Working" />           {/* indeterminate */}`}
			>
				{/* Captioned: `label` is the accessible name and renders nothing. */}
				<Stack gap="lg" style={{ width: "100%" }}>
					{[
						{ value: 24, tone: undefined, caption: "value={24}" },
						{ value: 64, tone: "info" as const, caption: 'value={64} tone="info"' },
						{ value: 100, tone: "success" as const, caption: 'value={100} tone="success"' },
						{ value: 92, tone: "warning" as const, caption: 'value={92} tone="warning"' },
						{ value: undefined, tone: undefined, caption: "no value — indeterminate" },
					].map((row) => (
						<Stack key={row.caption} gap="2xs">
							<Text size="xs" type="secondary">{row.caption}</Text>
							<Progress value={row.value} tone={row.tone} label={row.caption} />
						</Stack>
					))}
				</Stack>
			</Example>

			<Example
				id="progress-circle"
				title="ProgressCircle"
				description="The same measurement as a ring, with the figure inside it. A bar is right when it has a row to itself and a label beside it; a ring is right in a tile or a grid of small measures, where a bar would need a caption to say what it was measuring and the caption is the only thing there is room for. The hole is masked rather than covered by a smaller disc, because a base component cannot know what surface it was dropped onto. Size comes from `--progress-circle`, not a prop."
				stacked
				code={`<ProgressCircle value={72} tone="warning" label="Title length">
  <Text tag="span" size="xs" weight="semibold" numeric>72%</Text>
</ProgressCircle>`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					{[
						{ value: 24, tone: undefined },
						{ value: 60, tone: "info" as const },
						{ value: 72, tone: "warning" as const },
						{ value: 100, tone: "success" as const },
						{ value: 12, tone: "destructive" as const },
					].map((row) => (
						<ProgressCircle
							key={row.value}
							value={row.value}
							tone={row.tone}
							label={`${row.value} percent`}
						>
							<Text tag="span" size="xs" weight="semibold" numeric lineHeight="none">
								{row.value}%
							</Text>
						</ProgressCircle>
					))}
				</Stack>
			</Example>

			<Example id="progress-accessibility" title="Accessibility" stacked>
				<Callout>
					Progress reports its real bounds, and drops the ARIA value attributes entirely
					when indeterminate: announcing 0% when the number is unknown is worse than
					announcing nothing. Both presentations clamp finite values to the range,
					resolve non-finite values to 0, and fall back to a maximum of 100 when max is
					not finite and positive, so ARIA and the visual fill always agree.
				</Callout>
			</Example>

			<Example id="progress-api" title="API">
				<PropTable owner="Progress"
					rows={[
						{ name: "value", type: "number", description: "0–max. Omit for indeterminate." },
						{ name: "max", type: "number", default: "100", description: "Finite positive upper bound. Invalid values resolve to 100." },
						{ name: "tone", type: "ProgressTone", description: "Semantic colour intent. Left unset the bar takes the primary tone — a progress bar that changes colour at a threshold is the caller's decision, not the component's." },
						{ name: "label", type: "string", description: "Accessible name. Required when no visible label describes the bar." },
						{ name: "ProgressCircle value", type: "number", required: true, description: "0–max. There is no indeterminate ring: a travelling band reads as unknown, a spinning circle reads as a spinner." },
						{ name: "ProgressCircle children", type: "ReactNode", description: "What sits in the hole — a percentage, a count, a verdict glyph. The reason to draw a ring at all." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
