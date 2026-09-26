import { Card, CardActionStrip, CardFooter, CardPrimaryAction } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"
import { TextLink } from "themelia-ui/base/typography"

export default function CardActions() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="start">
			<Card style={{ width: "18rem" }} title="Northwind Traders" description="Invoice #4417">
				<CardFooter>
					<CardActionStrip
						actions={[
							{ id: "open", label: "Open" },
							{ id: "archive", label: "Archive" },
						]}
					/>
				</CardFooter>
			</Card>
			<Card style={{ width: "18rem" }} title="A card that is one link" description="The whole surface is the target.">
				<CardPrimaryAction href="#card-actions" label="Open Northwind Traders" />
				{/* An unpositioned TextLink, not a Button (already `position: relative`), so it exercises the lifting rule. */}
				<CardFooter>
					<TextLink href="#card-skeleton">View the invoice instead</TextLink>
				</CardFooter>
			</Card>
		</Stack>
	)
}
