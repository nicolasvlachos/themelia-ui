import {
	CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon,
} from "lucide-react"
import * as React from "react"

import { Text, textClassName } from "@/components/base/typography"
import type { SemanticTone } from "@/lib/component-vocabulary"
import { cvm, type VariantProps } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import styles from "./alert.module.css"

/*
 * `tone` is semantic colour intent, rendered as `data-tone` for the shared tone rule;
 * `variant` is structural presentation (the kit's vocabulary); `neutral`, never `default`.
 */
const alertVariants = cvm(styles.root, {
	variants: {
		/* Structural: an inverse alert keeps its tone, presented as a solid slab. */
		variant: {
			default: undefined,
			inverse: styles.variantInverse,
		},
	},
	defaultVariants: {
		variant: "default",
	},
})

/** Semantic colour: the kit's one tone union. */
export type AlertTone = SemanticTone

export type AlertVariant = "default" | "inverse"

/*
 * Each status tone's glyph, supplied by default so colour isn't the only signal. Neutral,
 * primary and secondary are emphasis, not status, and get none.
 */
const TONE_ICON: Record<AlertTone, React.ReactNode> = {
	neutral: null,
	primary: null,
	secondary: null,
	destructive: <CircleAlertIcon aria-hidden />,
	warning: <TriangleAlertIcon aria-hidden />,
	success: <CircleCheckIcon aria-hidden />,
	info: <InfoIcon aria-hidden />,
}

export interface AlertProps
	extends React.ComponentProps<"div">,
		VariantProps<typeof alertVariants> {
	/** Semantic colour intent. Never `default` — the vocabulary is fixed across the kit. */
	tone?: AlertTone
	/**
	 * Structural presentation. `inverse` is a solid slab for a single emphatic notice; the
	 * tone still describes the intent.
	 */
	variant?: AlertVariant
	/**
	 * Leading glyph. Defaults to the tone's own conventional glyph; pass a node to replace
	 * it, or `false` for an alert that must have none.
	 */
	icon?: React.ReactNode | false
}

/**
 * A notice in a tone. Status tones bring their own glyph, so colour is not the only signal.
 * A destructive alert interrupts the screen reader; every other tone is a polite status.
 */
function Alert({ className, tone = "neutral", variant = "default", icon, children, ...props }: AlertProps) {
	const resolvedIcon = icon === undefined ? TONE_ICON[tone] : icon

	return (
		<div
			data-slot="alert"
			data-tone={tone}
			data-variant={variant}
			/* `alert` interrupts the screen reader: right for errors only; everything else is `status`. */
			role={tone === "destructive" ? "alert" : "status"}
			className={cx("alert--component", alertVariants({ variant }), textClassName({ size: "sm" }), className)}
			{...props}
		>
			{resolvedIcon || null}
			{children}
		</div>
	)
}

/*
 * The title inherits the alert's ink, and the description is the secondary role. The inverse
 * slab is a dark colour island, so both resolve in its colours.
 */
/** The alert's heading. It inherits the alert's ink. */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<Text
			tag="div"
			size="inherit"
			type="inherit"
			weight="medium"
			data-slot="alert-title"
			className={cx("alert-title--component", styles.title, className)}
			{...props}
		/>
	)
}

/** The message, in the secondary text role. */
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<Text
			tag="div"
			size="sm"
			type="secondary"
			data-slot="alert-description"
			className={cx("alert-description--component", styles.description, className)}
			{...props}
		/>
	)
}

/** A single control, positioned in reserved inline space so it never overlaps the text. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="alert-action" className={cx("alert-action--component", styles.action, className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
