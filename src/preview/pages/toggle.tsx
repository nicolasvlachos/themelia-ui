import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { useState } from "react"

import { Toggle, ToggleGroup } from "@/components/base/toggle"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TogglePage() {
	const [bold, setBold] = useState(false)
	const [marks, setMarks] = useState<string[]>(["bold"])
	const [align, setAlign] = useState("left")

	return (
		<ComponentPage
			title="Toggle"
			summary="A button that stays pressed. Not a switch and not a checkbox — it reports aria-pressed, which is the distinction spelled out in the accessibility tree."
			importPath="@/components/base/toggle"
			exports={["Toggle", "ToggleGroup"]}
		>
			<Example
				id="toggle"
				title="Toggle"
				description="One control that stays engaged. The pressed state is a filled surface rather than a tint, because a toggle sits in a row of its siblings and a 10% wash is not enough to pick the engaged one out of five."
				stacked
				code={`<Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold">
  <BoldIcon />
</Toggle>`}
			>
				<Stack direction="horizontal" gap="lg" align="center">
					<Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold">
						<BoldIcon />
					</Toggle>
					<Toggle variant="outline" aria-label="Italic">
						<ItalicIcon />
					</Toggle>
					<Toggle disabled aria-label="Underline">
						<UnderlineIcon />
					</Toggle>
					<Text size="sm" type="secondary">
						{bold ? "pressed" : "not pressed"}
					</Text>
				</Stack>
			</Example>

			<Example
				id="toggle-group"
				title="ToggleGroup"
				description="A set sharing one value. Its items are the same Toggle, each given a value the group reads — there is no second item component. multiple decides whether it behaves as a radio group — one at a time, a view mode — or a checkbox set, several at once, like text styles. Both are common enough that neither is a sensible default to hide."
				stacked
				code={`{/* several at once */}
<ToggleGroup multiple value={marks} onValueChange={setMarks}>
  <Toggle value="bold"><BoldIcon /></Toggle>
</ToggleGroup>

{/* one at a time */}
<ToggleGroup value={[align]} onValueChange={([next]) => setAlign(next)}>`}
			>
				<Stack gap="xl">
					<Stack gap="xs" align="start">
						<Text size="xs" type="secondary">multiple — several at once</Text>
						<ToggleGroup multiple value={marks} onValueChange={setMarks}>
							<Toggle value="bold" aria-label="Bold"><BoldIcon /></Toggle>
							<Toggle value="italic" aria-label="Italic"><ItalicIcon /></Toggle>
							<Toggle value="underline" aria-label="Underline"><UnderlineIcon /></Toggle>
						</ToggleGroup>
					</Stack>

					<Stack gap="xs" align="start">
						<Text size="xs" type="secondary">one at a time</Text>
						<ToggleGroup
							value={[align]}
							onValueChange={(next) => setAlign(next[0] ?? align)}
						>
							<Toggle value="left" aria-label="Align left"><AlignLeftIcon /></Toggle>
							<Toggle value="center" aria-label="Align centre"><AlignCenterIcon /></Toggle>
							<Toggle value="right" aria-label="Align right"><AlignRightIcon /></Toggle>
						</ToggleGroup>
					</Stack>

					<Stack gap="xs" align="start">
						<Text size="xs" type="secondary">attached={"{false}"} — separate buttons</Text>
						<ToggleGroup attached={false} multiple>
							<Toggle value="a" variant="outline">Day</Toggle>
							<Toggle value="b" variant="outline">Week</Toggle>
						</ToggleGroup>
					</Stack>
				</Stack>
			</Example>

			<Example id="toggle-rule" title="Toggle, Switch, or Checkbox" stacked>
				<Callout label="Rule">
					A <code>Switch</code> applies a setting the moment it moves. A{" "}
					<code>Checkbox</code> is a value in a form, submitted with the rest. A{" "}
					<code>Toggle</code> is a CONTROL that stays engaged — bold in an editor, a view
					mode, a filter currently on. Picking by which one is announced correctly is
					easier than picking by which one looks right: they report{" "}
					<code>aria-checked</code>, <code>aria-checked</code>, and{" "}
					<code>aria-pressed</code> respectively.
				</Callout>
			</Example>

			<Example id="toggle-api" title="API">
				<PropTable owner="Toggle"
					rows={[
						{ name: "pressed / defaultPressed", type: "boolean", description: "Controlled and uncontrolled state." },
						{ name: "onPressedChange", type: "(pressed: boolean) => void", description: "Fires with the next state." },
						{ name: "variant", type: '"ghost" | "outline"', default: '"ghost"', description: "Match whatever sits beside it in the row — outline for a lone control, ghost inside a group." },
						{ name: "ToggleGroup multiple", type: "boolean", default: "false", description: "Several at once, or one. A view switch is one; text styles are several." },
						{ name: "ToggleGroup value / onValueChange", type: "string[]", description: "Always an array, even when only one may be pressed — so switching multiple does not change the value's shape." },
						{ name: "Toggle value", type: "string", description: "Names the toggle inside a ToggleGroup, which reads it into the group's value. Outside a group it is unused." },
						{ name: "ToggleGroup attached", type: "boolean", default: "true", description: "Joins the buttons into one control with internal rules. Off leaves them as separate buttons in a row." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
