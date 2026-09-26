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

/**
 * The plain anchor the three contact primitives are built on: the kit's `TextLink`, or the
 * empty mark when there is nothing to link.
 */
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
	/** The address. Becomes both the text and the `mailto:` href. */
	value?: string | null
	/**
	 * Shown instead of the address — a person's name, for instance. The href is still the
	 * address.
	 */
	display?: ReactNode
	/** Prefills the message's subject. Encoded into the `mailto:`, not concatenated into it. */
	subject?: string
	/** Prefills the message's body. Encoded into the `mailto:`, not concatenated into it. */
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
	/** The number as stored. Displayed with its grouping; dialled without it. */
	value?: string | null
	/** Shown instead of the number. */
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
	/** The address. The host is shown; the whole thing stays in the href. */
	value?: string | null
	/** Shown instead of the host. */
	display?: ReactNode
	/**
	 * Opens in a new tab WITH `rel="noopener noreferrer"` — the two are not separable — and
	 * with the announcement a new tab requires too. See `strings.opensInNewTab`.
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
			 * `target="_blank"` and the rel hardening alone leave a new-tab link reading like
			 * any other: nothing tells a reader — sighted or not — that it leaves the page. A
			 * glyph would answer half of that and cannot be translated, so this is copy,
			 * visually hidden, and part of the link's own accessible name.
			 */}
			{!!external && <span className={styles.newTab}>{copy.opensInNewTab}</span>}
		</Link>
	)
}
