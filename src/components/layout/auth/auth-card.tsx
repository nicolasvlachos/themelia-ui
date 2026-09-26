/**
 * AuthCard: the surface a sign-in form sits on (media, header, banner, content, footer),
 * usable without the shell. `bare` keeps the rhythm and drops the frame and its padding.
 */
import type { ComponentProps, ReactNode } from "react"

import { Card } from "@/components/base/cards"
import { DisplayLabel } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "./auth.module.css"

export interface AuthCardProps extends Omit<ComponentProps<"div">, "title"> {
	surface?: "card" | "bare"
	eyebrow?: ReactNode
	title?: ReactNode
	description?: ReactNode
	/** A control at the end of the header row — a language switcher, a step count. */
	headerEnd?: ReactNode
	/** A notice above the content: an expired link, a required invitation. */
	banner?: ReactNode
	/** A strip above the header — an illustration, a product screenshot. */
	media?: ReactNode
	footer?: ReactNode
	/** Heading level for the title. A sign-in page's title is usually its h1. */
	level?: 1 | 2 | 3
}

/* A Card with a wider inset, a heavier shadow and a page-scale title (auth.module.css). */
export function AuthCard({
	surface = "card",
	eyebrow,
	title,
	description,
	headerEnd,
	banner,
	media,
	footer,
	level = 1,
	className,
	children,
	...props
}: AuthCardProps) {
	return (
		<Card
			{...props}
			data-slot="auth-card"
			data-surface={surface}
			surface={surface === "bare" ? "flat" : "framed"}
			media={media ? <div className={styles.cardMedia}>{media}</div> : undefined}
			headerStart={eyebrow ? <DisplayLabel>{eyebrow}</DisplayLabel> : undefined}
			title={title}
			titleLevel={level}
			description={description}
			headerEnd={headerEnd}
			alert={banner}
			footerSlot={footer}
			footerDivider={surface !== "bare"}
			className={cx("auth-card--component", styles.card, className)}
		>
			{children}
		</Card>
	)
}
