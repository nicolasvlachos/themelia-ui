import { KeyRoundIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { ContentBlock, IconBadge } from "themelia-ui/base/display"
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "themelia-ui/base/item"
import { Grid, GridCell } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function ContentBlockFlush() {
	return (
		<Grid columns={2} gap="lg">
			<GridCell>
				<ContentBlock surface="card" flush>
					<ItemGroup ruled>
						{[
							{ name: "Production", value: "sk_live_••••0b3d" },
							{ name: "Staging", value: "sk_test_••••a771" },
						].map((row) => (
							<Item key={row.name} style={{ paddingInline: "var(--space-xl)" }}>
								<ItemMedia>
									<IconBadge icon={KeyRoundIcon} />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{row.name}</ItemTitle>
									<Text size="xs" type="secondary">
										{row.value}
									</Text>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</ContentBlock>
			</GridCell>
			<GridCell>
				<ContentBlock
					surface="card"
					title="Not flush"
					titleSuffix={<Badge tone="neutral">for contrast</Badge>}
				>
					<Text size="xs" type="secondary">
						The block pays the inset here, so nothing inside it can touch the border. Right
						for prose and for a stack of controls; wrong for a run of ruled rows.
					</Text>
				</ContentBlock>
			</GridCell>
		</Grid>
	)
}
