import { Fragment } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { MentionChip, type MentionResource } from "themelia-ui/features/mentions"

import { RESOURCES, STORED_MENTIONS } from "./data"

/* One chip per tone, so the contrast suite measures every tone the stylesheet paints. */
const TONES: NonNullable<MentionResource["tone"]>[] = ["primary", "secondary", "info", "success", "warning", "destructive"]

export default function MentionTones() {
	return (
		<Stack>
			<Text>
				The same chip in body copy:{" "}
				<MentionChip mention={STORED_MENTIONS[0]!} resource={RESOURCES.user} />{" "}
				and{" "}
				<MentionChip mention={STORED_MENTIONS[1]!} resource={RESOURCES.booking} />.
			</Text>
			<Text size="xs">
				And in small print:{" "}
				<MentionChip mention={STORED_MENTIONS[0]!} resource={RESOURCES.user} />{" "}
				<MentionChip mention={STORED_MENTIONS[2]!} resource={RESOURCES.incident} />
			</Text>
			<Text>
				Every tone:{" "}
				{TONES.map((tone) => (
					<Fragment key={tone}>
						<MentionChip mention={{ id: `tone:${tone}`, kind: "tone", label: tone }} resource={{ tone }} />{" "}
					</Fragment>
				))}
			</Text>
		</Stack>
	)
}
