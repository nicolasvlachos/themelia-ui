import { ShieldCheckIcon } from "lucide-react"

import { ContentBlock } from "themelia-ui/base/display"
import { Grid, GridCell } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ContentBlockSurfaces() {
	return (
		<Grid columns={{ base: 1, sm: 2 }} gap="lg">
			{(["plain", "bordered", "muted", "card"] as const).map((surface) => (
				<GridCell key={surface}>
					<ContentBlock
						surface={surface}
						icon={<ShieldCheckIcon aria-hidden="true" />}
						title={`surface="${surface}"`}
						description="The header renders only when there is something to put in it."
					>
						<Text size="xs" type="secondary">
							A block with no title, description, icon or headerEnd draws no header at all —
							which is what makes it usable as a bare surface.
						</Text>
					</ContentBlock>
				</GridCell>
			))}
		</Grid>
	)
}
