import { Avatar, AvatarFallback, AvatarGroup, StackedAvatars } from "themelia-ui/base/avatar"
import { Stack } from "themelia-ui/base/structure"

const MEMBERS = [
	{ id: "1", name: "Jane McDonald", initials: "JM" },
	{ id: "2", name: "Rin Fujita", initials: "RF" },
	{ id: "3", name: "Mei Chen", initials: "MC" },
	{ id: "4", name: "Raj Patel", initials: "RP" },
	{ id: "5", name: "Ana Silva", initials: "AS" },
	{ id: "6", name: "Tom Weber", initials: "TW" },
]

export default function Stacked() {
	return (
		<Stack gap="lg">
			<StackedAvatars users={MEMBERS} max={4} />
			<StackedAvatars users={MEMBERS} max={2} />
			<AvatarGroup>
				<Avatar><AvatarFallback>JM</AvatarFallback></Avatar>
				<Avatar><AvatarFallback>RF</AvatarFallback></Avatar>
				<Avatar><AvatarFallback>MC</AvatarFallback></Avatar>
			</AvatarGroup>
		</Stack>
	)
}
