/**
 * Link primitives: a value that is also an action. The `href` is derived from the value,
 * so the link always matches what it shows.
 */
import type { AnchorHTMLAttributes, ReactNode, Ref } from "react"

import { TextLink } from "@/components/base/typography"
import { EMPTY } from "@/lib/format"
import { defaultUrlStrings, type UrlStrings } from "./primitives.strings"
import { cx } from "@/lib/cx"

import styles from "./link.module.css"

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	children?: ReactNode
	emptyLabel?: ReactNode
	ref?: Ref<HTMLAnchorElement>
}

export function Link({ children, emptyLabel = EMPTY, className, ref, ...props }: LinkProps) {
	if (children === null || children === undefined || children === "") {
		return <span className={cx("link--component", styles.empty, className)}>{emptyLabel}</span>
	}
	/* The kit's TextLink, so value links follow its styling. */
	return (
		<TextLink ref={ref} className={cx("link--component", className)} {...props}>
			{children}
		</TextLink>
	)
}

export interface EmailProps extends Omit<LinkProps, "href" | "children" | "ref"> {
	value?: string | null
	/** Shown instead of the address — a person's name, for instance. */
	display?: ReactNode
	subject?: string
	body?: string
	ref?: Ref<HTMLAnchorElement>
}

export function Email({ value, display, subject, body, ...props }: EmailProps) {
	const query = new URLSearchParams()
	if (subject) query.set("subject", subject)
	if (body) query.set("body", body)
	const suffix = query.toString() ? `?${query}` : ""
	return (
		<Link href={value ? `mailto:${value}${suffix}` : undefined} {...props}>
			{display ?? value}
		</Link>
	)
}

export interface PhoneProps extends Omit<LinkProps, "href" | "children" | "ref"> {
	value?: string | null
	display?: ReactNode
	ref?: Ref<HTMLAnchorElement>
}

export function Phone({ value, display, ...props }: PhoneProps) {
	// `tel:` cannot contain spaces or punctuation, but the displayed value should keep them.
	const dialable = value?.replace(/[^\d+]/g, "")
	return (
		<Link href={dialable ? `tel:${dialable}` : undefined} {...props}>
			{display ?? value}
		</Link>
	)
}

export interface UrlProps extends Omit<LinkProps, "href" | "children" | "ref"> {
	value?: string | null
	display?: ReactNode
	/**
	 * Opens in a new tab, with the rel hardening that requires — and with the announcement
	 * it requires too. See `strings.opensInNewTab`.
	 */
	external?: boolean
	/** Overrides the new-tab announcement. */
	strings?: Partial<UrlStrings>
	ref?: Ref<HTMLAnchorElement>
}

export function Url({ value, display, external = false, strings, ...props }: UrlProps) {
	const copy = { ...defaultUrlStrings, ...strings }
	if (!value && (display === null || display === undefined || display === "")) return <Link {...props} />
	// The host, not the full URL: a column of full URLs is unreadable and truncates badly.
	let label = display
	if (label === undefined && value) {
		try {
			label = new URL(value).host
		} catch {
			label = value
		}
	}
	return (
		<Link
			href={value ?? undefined}
			target={external ? "_blank" : undefined}
			rel={external ? "noreferrer noopener" : undefined}
			{...props}
		>
			{label}
			{/*
			 * The new tab, said rather than drawn.
			 *
			 * `target="_blank"` and the rel hardening were both here and correct, and the two
			 * links on the URL example rendered as the same word: nothing told a reader —
			 * sighted or not — that one of them leaves the page. A glyph would answer half of
			 * that and cannot be translated, so this is copy, visually hidden, and part of the
			 * link's own accessible name.
			 */}
			{!!external && <span className={styles.newTab}>{copy.opensInNewTab}</span>}
		</Link>
	)
}
