import { Avatar, AvatarFallback } from "themelia-ui/base/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "themelia-ui/base/hover-card"
import { Stack } from "themelia-ui/base/structure"
import { Text, TextLink } from "themelia-ui/base/typography"

export default function HoverCardExample() {
	return (
		<Text>
			Assigned to{" "}
			<HoverCard>
				{/* A real link, as the rule below asks: the card previews where it goes. */}
				<HoverCardTrigger render={<TextLink href="/people/jane" onClick={(event) => event.preventDefault()} />}>
					@jane
				</HoverCardTrigger>
				<HoverCardContent>
					<Stack direction="horizontal" gap="md" align="start">
						<Avatar>
							<AvatarFallback>JM</AvatarFallback>
						</Avatar>
						<Stack gap="2xs">
							<Text weight="medium">Jane McDonald</Text>
							<Text size="xs" type="secondary">Billing · joined March 2024</Text>
						</Stack>
					</Stack>
				</HoverCardContent>
			</HoverCard>{" "}
			on 1 September.
		</Text>
	)
}
