/**
 * StackedAvatars — people as overlapping avatars, capped with a count. Data-driven so the
 * slicing and remainder are computed once.
 */
import type { ComponentProps, ReactNode } from "react"
import { resolveStrings } from "@/lib/strings"

import { defaultStackedAvatarsStrings, type StackedAvatarsStrings } from "./avatar.strings"

import { formatInitials } from "@/components/primitives"
import { cx } from "@/lib/cx"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "./avatar"

export interface StackedAvatarUser {
	/** Stable identity. Falls back to the name when absent. */
	id?: string
	name: string
	src?: string
	/** Overrides the derived initials. */
	initials?: string
}

export interface StackedAvatarsProps extends Omit<ComponentProps<"div">, "children"> {
	users: StackedAvatarUser[]
	/** Overrides this group's own copy — its accessible name, and the overflow chip. */
	strings?: Partial<StackedAvatarsStrings>
	/** How many faces to show before collapsing the rest into a count. */
	max?: number
	/** Hides the "+N" tile, for a group where the total does not matter. */
	showOverflow?: boolean
	/** Formats the overflow tile — "+12", "+12 more". Defaults to `strings.overflow`. */
	overflowFormatter?: (overflow: number) => ReactNode
}

export function StackedAvatars({
	users,
	strings,
	max = 4,
	showOverflow = true,
	overflowFormatter,
	className,
	...props
}: StackedAvatarsProps) {
	const copy = resolveStrings(defaultStackedAvatarsStrings, strings)
	const shown = users.slice(0, max)
	const overflow = users.length - shown.length

	return (
		<AvatarGroup
			/* One accessible name for the whole group of people. */
			role="group"
			aria-label={copy.people(users.length)}
			className={cx("stacked-avatars--component", className)}
			{...props}
		>
			{shown.map((user) => (
				<Avatar key={user.id ?? user.name} title={user.name}>
					{!!user.src && <AvatarImage src={user.src} alt={user.name} />}
					<AvatarFallback>{user.initials ?? formatInitials(user.name)}</AvatarFallback>
				</Avatar>
			))}
			{showOverflow && overflow > 0 && (
				// A tile, not an avatar: it stands for people.
				<AvatarGroupCount>{(overflowFormatter ?? copy.overflow)(overflow)}</AvatarGroupCount>
			)}
		</AvatarGroup>
	)
}
