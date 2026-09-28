/*
 * Text's class map, in its own file so text.tsx exports only a component (fast refresh), and
 * so `textClassName` can lend the same classes to an element Text cannot wrap.
 */
import type { TextSize } from "@/lib/ui-provider"
import { cvm } from "@/lib/cvm"

import styles from "./text.module.css"

export type TextType =
	| "inherit" | "main" | "inverse" | "secondary" | "error" | "success" | "primary"
export type TextAlign = "left" | "center" | "right"
export type TextLineHeight = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose"
export type TextWeight = "normal" | "medium" | "semibold" | "bold"

export const textVariants = cvm(styles.root, {
	variants: {
		type: {
			// No class, so the surrounding colour flows through (a tooltip, a coloured chip).
			inherit: undefined,
			main: styles.typeMain,
			inverse: styles.typeInverse,
			secondary: styles.typeSecondary,
			error: styles.typeError,
			success: styles.typeSuccess,
			primary: styles.typePrimary,
		},
		size: {
			// `inherit` maps to no class so the surrounding size flows through.
			inherit: undefined,
			/*
			 * Resolved in CSS from the provider's `--text-default`, not in JS, so Text stays
			 * usable in React Server Components and nested scopes cascade.
			 */
			default: styles.sizeDefault,
			xs: styles.sizeXs,
			pxs: styles.sizePxs,
			sm: styles.sizeSm,
			base: styles.sizeBase,
			lg: styles.sizeLg,
			xl: styles.sizeXl,
		},
		align: {
			left: styles.alignLeft,
			center: styles.alignCenter,
			right: styles.alignRight,
		},
		lineHeight: {
			none: styles.leadingNone,
			tight: styles.leadingTight,
			snug: styles.leadingSnug,
			normal: styles.leadingNormal,
			relaxed: styles.leadingRelaxed,
			loose: styles.leadingLoose,
		},
		weight: {
			normal: styles.weightNormal,
			medium: styles.weightMedium,
			semibold: styles.weightSemibold,
			bold: styles.weightBold,
		},
		numeric: { true: styles.numeric, false: undefined },
		truncate: { true: styles.truncate, false: undefined },
		mono: { true: styles.mono, false: undefined },
		heading: { true: styles.heading, false: undefined },
		caps: { true: styles.caps, false: undefined },
	},
})

/** What `textClassName` takes: Text's props, without the element and the content. */
export interface TextClassNameOptions {
	/** Step on the type scale; unset, the provider's default size. */
	size?: TextSize | "default"
	weight?: TextWeight
	lineHeight?: TextLineHeight
	/** Unset, no colour: the element keeps whatever colour its own rules give it. */
	type?: TextType
	numeric?: boolean
	truncate?: boolean
	mono?: boolean
	heading?: boolean
	caps?: boolean
}

/**
 * Text's classes for an element Text cannot wrap: a native control's value, a button's label,
 * a table cell. One implementation of type, so a size or weight here is the same one Text
 * renders.
 *
 *   <button className={cx(styles.trigger, textClassName({ size: "sm", weight: "medium" }))}>
 */
export function textClassName({ size = "default", ...options }: TextClassNameOptions = {}): string {
	return textVariants({ size, ...options })
}
