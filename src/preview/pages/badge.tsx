import { Badge, type BadgeTone } from "@/components/base/badge"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const TONES: BadgeTone[] = ["neutral", "primary", "secondary", "success", "info", "warning", "destructive"]

export function BadgePage() {
	return (
		<ComponentPage
			title="Badge"
			summary="A short status mark. It takes a tone, like everything else that carries colour in the kit, and can draw its own status dot so meaning does not rest on hue alone."
			importPath="@/components/base/badge"
			exports={["Badge", "type BadgeTone"]}
		>
			<Example
				id="badge-tones"
				title="Tones"
				description="Seven tones across three variants. The tone supplies the hue; the variant decides how much of it is applied — soft for a label in a table, solid for a mark that must be found at a glance, outline for one that must not compete with the row it sits in."
				stacked
				code={`<Badge tone="success">Paid</Badge>
<Badge tone="warning" variant="solid">Due</Badge>
<Badge tone="destructive" variant="outline">Overdue</Badge>`}
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					{(["soft", "solid", "outline"] as const).map((variant) => (
						<Stack key={variant} gap="xs">
							<Text size="xs" type="secondary">{variant}</Text>
							<Stack direction="horizontal" gap="sm" wrap>
								{TONES.map((tone) => (
									<Badge key={tone} tone={tone} variant={variant}>{tone}</Badge>
								))}
							</Stack>
						</Stack>
					))}
				</Stack>
			</Example>

			<Example
				id="badge-dot"
				title="Status dot"
				description="A filled dot for a state that has happened, a hollow one for a state that has not, and a pulse for one that is changing. The shape carries the difference so it survives being printed, screenshotted, or read by someone who cannot separate the hues."
				stacked
				code={`<Badge tone="success" dot>Live</Badge>
<Badge tone="warning" dot pending>Queued</Badge>
<Badge tone="info" dot pulse>Syncing</Badge>`}
			>
				<Stack direction="horizontal" gap="sm" wrap>
					<Badge tone="success" dot>Live</Badge>
					<Badge tone="warning" dot pending>Queued</Badge>
					<Badge tone="info" dot pulse>Syncing</Badge>
					<Badge tone="destructive" dot>Failed</Badge>
				</Stack>
			</Example>

			<Example id="badge-rule" title="Tone, never variant, for colour" stacked>
				<Callout label="Rule">
					This component used to take <code>variant="secondary" | "destructive"</code> — a
					semantic colour wearing the name of a structural prop, with a{" "}
					<code>default</code> that said nothing. Colour is always <code>tone</code> here,
					and the names are the kit's: <code>neutral</code>, never <code>default</code>.
				</Callout>
			</Example>

			<Example id="badge-api" title="API">
				<PropTable owner="Badge"
					rows={[
						{ name: "tone", type: "BadgeTone", default: '"neutral"', description: "neutral | primary | secondary | success | info | warning | destructive." },
						{ name: "variant", type: '"soft" | "solid" | "outline"', default: '"soft"', description: "How much of the tone is applied. Structural, not semantic." },
						{ name: "dot", type: "boolean", default: "false", description: "A leading status dot in the badge's own tone." },
						{ name: "pending", type: "boolean", default: "false", description: "Draws the dot hollow, for a state that has not happened yet." },
						{ name: "pulse", type: "boolean", default: "false", description: "Animates the dot, for a state that is actively changing." },
						{ name: "render", type: "ReactElement", description: "The element the badge becomes — an anchor, for a badge that links. The dot and the label go inside it." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
