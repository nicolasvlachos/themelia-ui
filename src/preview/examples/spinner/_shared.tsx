import type { ReactNode } from "react"

import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

/** A captioned demo: a spinner has no content to tell the variants apart. */
export function Demo({ caption, children }: { caption: string; children: ReactNode }) {
	return (
		<Stack gap="2xs" align="start">
			{children}
			<Text size="xs" type="secondary">{caption}</Text>
		</Stack>
	)
}
