import { Avatar, AvatarBadge, AvatarFallback } from "themelia-ui/base/avatar"
import { Stack } from "themelia-ui/base/structure"

export default function AvatarExample() {
	return (
		<Stack direction="horizontal" gap="lg" align="center">
			{(["sm", "default", "lg"] as const).map((size) => (
				<Avatar key={size} size={size}>
					<AvatarFallback>JM</AvatarFallback>
				</Avatar>
			))}
			<Avatar>
				<AvatarFallback>RF</AvatarFallback>
				<AvatarBadge />
			</Avatar>
		</Stack>
	)
}
