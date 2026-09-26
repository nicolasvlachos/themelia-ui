import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./avatar.module.css"

/** An avatar keeps a size prop: it has no content to scale with. */
export type AvatarSize = "default" | "sm" | "lg"
export type AvatarProps = AvatarPrimitive.Root.Props & { size?: AvatarSize }

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

function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cx("avatar-image--component", styles.image, className)}
			{...props}
		/>
	)
}

function AvatarFallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cx("avatar-fallback--component", styles.fallback, className)}
			{...props}
		/>
	)
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
	return <span data-slot="avatar-badge" className={cx("avatar-badge--component", styles.badge, className)} {...props} />
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="avatar-group" className={cx("avatar-group--component", styles.group, className)} {...props} />
}

function AvatarGroupCount({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div data-slot="avatar-group-count" className={cx("avatar-group-count--component", styles.count, className)} {...props} />
	)
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarBadge }
