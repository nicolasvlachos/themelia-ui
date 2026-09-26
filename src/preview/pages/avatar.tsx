import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, StackedAvatars } from "@/components/base/avatar"
import { Stack } from "@/components/base/structure"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const MEMBERS = [
	{ id: "1", name: "Jane McDonald", initials: "JM" },
	{ id: "2", name: "Rin Fujita", initials: "RF" },
	{ id: "3", name: "Mei Chen", initials: "MC" },
	{ id: "4", name: "Raj Patel", initials: "RP" },
	{ id: "5", name: "Ana Silva", initials: "AS" },
	{ id: "6", name: "Tom Weber", initials: "TW" },
]

export function AvatarPage() {
	return (
		<ComponentPage
			title="Avatar"
			summary="A person or an entity, as an image with an initials fallback. StackedAvatars is the overlapping row with an overflow count."
			importPath="@/components/base/avatar"
			exports={["Avatar", "AvatarImage", "AvatarFallback", "AvatarGroup", "AvatarBadge", "StackedAvatars", "AvatarGroupCount"
			]}
		>
			<Example
				id="avatar"
				title="Avatar"
				description="The fallback is not a spinner or a blank disc — a missing photograph is the normal case, not a loading state, and initials identify the person while the image is absent."
				stacked
				code={`<Avatar>
  <AvatarImage src={user.photo} alt="" />
  <AvatarFallback>JM</AvatarFallback>
</Avatar>`}
			>
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
			</Example>

			<Example
				id="stacked"
				title="StackedAvatars"
				description="An overlapping row capped at max, with the remainder as a count. The cap is a prop rather than a CSS truncation because the overflow number has to be correct, not merely hidden."
				stacked
				code={`<StackedAvatars users={members} max={4} />`}
			>
				<Stack gap="lg">
					<StackedAvatars users={MEMBERS} max={4} />
					<StackedAvatars users={MEMBERS} max={2} />
					<AvatarGroup>
						<Avatar><AvatarFallback>JM</AvatarFallback></Avatar>
						<Avatar><AvatarFallback>RF</AvatarFallback></Avatar>
						<Avatar><AvatarFallback>MC</AvatarFallback></Avatar>
					</AvatarGroup>
				</Stack>
			</Example>

			<Example id="avatar-api" title="API">
				<PropTable
					rows={[
						{ name: "size", api: "Avatar.size", type: '"sm" | "default" | "lg"', default: '"default"', description: "One of the few surviving size props — an avatar has no content to scale with." },
						{ name: "AvatarImage src / alt", type: "string", description: "An empty alt is correct beside a visible name; the name already announces the person." },
						{ name: "AvatarFallback", type: "component", description: "Shown when there is no image. Initials, not a placeholder glyph." },
						{ name: "AvatarBadge", type: "component", description: "A small status mark on the disc's corner." },
						{ name: "StackedAvatars users / max", type: "StackedAvatarUser[] / number", description: "The row and its cap. Beyond max, the remainder becomes a count." },
						{ name: "StackedAvatars overflowFormatter", type: "(overflow: number) => ReactNode", description: "How the remainder reads. Defaults to +N." },
						{ name: "AvatarGroupCount", type: "component", description: "The \u201c+3\u201d at the end of an AvatarGroup. A count rather than another avatar, so a group of twelve does not need twelve images to say so." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
