import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Toggle, ToggleGroup } from "themelia-ui/base/toggle"
import { Text } from "themelia-ui/base/typography"

export default function ToggleGroupExample() {
	const [marks, setMarks] = useState<string[]>(["bold"])
	const [align, setAlign] = useState("left")

	return (
		<Stack>
			<Stack gap="sm" align="start">
				<Text size="xs" type="secondary">multiple — several at once</Text>
				<ToggleGroup multiple value={marks} onValueChange={setMarks}>
					<Toggle value="bold" aria-label="Bold"><BoldIcon /></Toggle>
					<Toggle value="italic" aria-label="Italic"><ItalicIcon /></Toggle>
					<Toggle value="underline" aria-label="Underline"><UnderlineIcon /></Toggle>
				</ToggleGroup>
			</Stack>

			<Stack gap="sm" align="start">
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

			<Stack gap="sm" align="start">
				<Text size="xs" type="secondary">attached={"{false}"} — separate buttons</Text>
				<ToggleGroup attached={false} multiple>
					<Toggle value="a" appearance="outline">Day</Toggle>
					<Toggle value="b" appearance="outline">Week</Toggle>
				</ToggleGroup>
			</Stack>
		</Stack>
	)
}
