import {
	CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon,
} from "lucide-react"
import * as React from "react"

import { cvm, type VariantProps } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import { Text } from "@/components/base/typography"

import styles from "./alert.module.css"

/*
 * `tone` is semantic colour intent, `variant` structural presentation (the kit's
 * vocabulary); `neutral`, never `default`.
 */
const alertVariants = cvm(styles.root, {
	variants: {
		tone: {
			neutral: styles.toneNeutral,
			primary: styles.tonePrimary,
			secondary: styles.toneSecondary,
			destructive: styles.toneDestructive,
			warning: styles.toneWarning,
			success: styles.toneSuccess,
			info: styles.toneInfo,
		},
		/* Structural: an inverse alert keeps its tone, presented as a solid slab. */
		variant: {
			default: undefined,
			inverse: styles.variantInverse,
		},
	},
	defaultVariants: {
		tone: "neutral",
		variant: "default",
	},
})

export type AlertTone =
	| "neutral"
	| "primary"
	| "secondary"
	| "destructive"
	| "warning"
	| "success"
	| "info"

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
	/**
	 * Leading glyph. Defaults to the tone's own; pass a node to replace it, or `false`
	 * for an alert that must have none.
	 */
	icon?: React.ReactNode | false
}

function Alert({ className, tone, variant, icon, children, ...props }: AlertProps) {
	const resolvedIcon = icon === undefined ? TONE_ICON[tone ?? "neutral"] : icon

	return (
		<div
			data-slot="alert"
			data-tone={tone ?? "neutral"}
			data-variant={variant ?? "default"}
			/* `alert` interrupts the screen reader: right for errors only; everything else is `status`. */
			role={tone === "destructive" ? "alert" : "status"}
			className={cx("alert--component", alertVariants({ tone, variant, className }))}
			{...props}
		>
			{resolvedIcon || null}
			{children}
		</div>
	)
}

/*
 * The title inherits the alert's ink, and the description is the secondary role. The inverse
 * slab re-points both, so they follow it.
 */
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

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<Text
			tag="div"
			size="inherit"
			type="secondary"
			data-slot="alert-description"
			className={cx("alert-description--component", styles.description, className)}
			{...props}
		/>
	)
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="alert-action" className={cx("alert-action--component", styles.action, className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
