import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Toggle } from "themelia-ui/base/toggle"
import { Text } from "themelia-ui/base/typography"

export default function ToggleExample() {
	const [bold, setBold] = useState(false)

	return (
		<Stack direction="horizontal" align="center">
			<Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold">
				<BoldIcon />
			</Toggle>
			<Toggle appearance="outline" aria-label="Italic">
				<ItalicIcon />
			</Toggle>
			<Toggle disabled aria-label="Underline">
				<UnderlineIcon />
			</Toggle>
			<Text size="sm" type="secondary">
				{bold ? "pressed" : "not pressed"}
			</Text>
		</Stack>
	)
}
