import type { ReactNode } from "react"

import type { LayoutNavigationAdapter } from "../layout.types"

/** A mark, a wordmark, and optionally a line under it. */
export interface AuthBrandConfig {
	logo?: ReactNode
	label?: ReactNode
	description?: ReactNode
	href?: string
	/** Accessible name when the mark is a link and the label is a graphic. */
	ariaLabel?: string
}

/** Either a fully-rendered mark, or the parts for the shell to arrange. */
export type AuthBrand = ReactNode | AuthBrandConfig

/** One entry in a footer, policy, or language row. */
export interface AuthLink {
	label: ReactNode
	href?: string
	onClick?: () => void
	external?: boolean
	/** Hides the entry without the caller filtering the array. */
	visible?: boolean
	key?: string
}

export interface AuthFooterLinksProps extends LayoutNavigationAdapter {
	links: AuthLink[]
	/** Names the row for assistive technology — "Legal", "Language". */
	label?: string
	/** A glyph before the row, for a language selector. */
	leadingIcon?: ReactNode
	className?: string
}

export type AuthShellVariant = "card" | "bare" | "split"
export type AuthShellSize = "sm" | "md" | "lg"
export type AuthSplitSide = "start" | "end"
/** What the panel does below 56rem of available width: disappear, or fall under the form. */
export type AuthSplitMobile = "hidden" | "stacked"
