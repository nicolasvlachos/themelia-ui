import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./avatar.module.css"

/** An avatar keeps a size prop: it has no content to scale with. */
export type AvatarSize = "default" | "sm" | "lg"
export type AvatarProps = AvatarPrimitive.Root.Props & {
	/** Disc size. One of the kit's few size props: an avatar has no content to scale with. */
	size?: AvatarSize
}

/** A person or an entity as a disc: an image, with initials behind it for when there is none. */
function Avatar({
	className,
	size = "default",
	...props
}: AvatarProps) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			className={cx("avatar--component", styles.root, className)}
			{...props}
		/>
	)
}

/**
 * The picture. An empty `alt` is correct beside a visible name; the name already announces
 * the person.
 */
function AvatarImage({
	className,
	...props
}: AvatarPrimitive.Image.Props & Pick<AvatarPrimitive.Image.Props, "src" | "alt">) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cx("avatar-image--component", styles.image, className)}
			{...props}
		/>
	)
}

/** Shown when there is no image. Initials, not a placeholder glyph. */
function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cx("avatar-fallback--component", styles.fallback, className)}
			{...props}
		/>
	)
}

/** A small status mark on the disc's corner. */
function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
	return <span data-slot="avatar-badge" className={cx("avatar-badge--component", styles.badge, className)} {...props} />
}

/** A row of overlapping avatars. */
function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="avatar-group" className={cx("avatar-group--component", styles.group, className)} {...props} />
}

/**
 * The "+3" at the end of an `AvatarGroup`. A count rather than another avatar, so a group of
 * twelve does not need twelve images to say so.
 */
function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="avatar-group-count" className={cx("avatar-group-count--component", styles.count, className)} {...props} />
	)
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge }
