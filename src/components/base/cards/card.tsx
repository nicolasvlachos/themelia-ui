/**
 * Card — the single surface primitive. Slot props (`title`, `description`, `actions`,
 * `footerText`, …) cover the common shape; the regions are exported for composing.
 */
import * as React from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Alert, AlertDescription } from "@/components/base/feedback"
import { cvm } from "@/lib/cvm"
import { ActionMenu } from "@/components/base/action-menu"
import { cx } from "@/lib/cx"
import { useDefaults } from "@/lib/ui-provider"

import styles from "./cards.module.css"
import { defaultCardStrings, type CardStrings } from "./card.strings"
import type { CardAction, CardAlertTone, CardSurface } from "./card.types"
import { CardContent, CardFooter, CardHeader } from "./partials"

/*
 * Framed by default; a product opts out once via
 * `UIProvider config={{ defaults: { card: { surface: "card" } } }}`.
 */
const CARD_DEFAULTS = {
	surface: "framed" as CardSurface,
	headerDivider: false,
}

const cardVariants = cvm(styles.root, {
	variants: {
		surface: {
			card: styles.surfaceCard,
			framed: styles.surfaceFramed,
			flat: styles.surfaceFlat,
			bordered: styles.surfaceBordered,
		},
	},
})

export interface CardProps extends Omit<React.ComponentProps<"div">, "title"> {
	/** Leading glyph on the title line. */
	icon?: React.ReactNode
	title?: React.ReactNode
	/** Badges, status, or counts immediately after the title. */
	titleSuffix?: React.ReactNode
	/**
	 * Explanatory copy behind a focusable info button on the title line — for a definition or
	 * caveat too long for the description.
	 */
	tooltip?: React.ReactNode
	description?: React.ReactNode
	/** Outer chrome. */
	surface?: CardSurface
	/** Full-width row above the title — an eyebrow or breadcrumb. Rare. */
	headerStart?: React.ReactNode
	/** Metadata or a secondary control before the action and overflow menu. */
	headerEnd?: React.ReactNode
	/** A single control at the end of the header. Use `actions` for a list of commands. */
	headerAction?: React.ReactNode
	/** Overflow commands, collapsed into one menu trigger. */
	actions?: CardAction[]
	/**
	 * Renders the title as a heading of this level. Unset, the title is a span that heading
	 * navigation can't find; set it when the card titles a page section.
	 */
	titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
	/** A full-bleed strip above the header — a cover image, an illustration, a preview. */
	media?: React.ReactNode
	/** Banner between header and content. A plain string is wrapped for you. */
	alert?: React.ReactNode
	alertTone?: CardAlertTone
	contentTop?: React.ReactNode
	contentBottom?: React.ReactNode
	/** Muted text in the footer band. */
	footerText?: React.ReactNode
	/** Footer band under the content — a single primary action fits well here. */
	footerSlot?: React.ReactNode
	headerDivider?: boolean
	footerDivider?: boolean
	/**
	 * Clips content to a collapsed height with a fade, and adds a toggle. `true` uses
	 * `--card-collapsed-height`; the object form sets the height for this card only.
	 */
	expandable?: boolean | { collapsedMaxHeight?: number | string }
	expanded?: boolean
	defaultExpanded?: boolean
	onExpandedChange?: (expanded: boolean) => void
	/** Overrides this card's own copy — the info glyph, the overflow trigger, the disclosure. */
	strings?: Partial<CardStrings>
}

export function Card({
	icon,
	title,
	titleSuffix,
	tooltip,
	description,
	surface,
	titleLevel,
	media,
	headerStart,
	headerEnd,
	headerAction,
	actions,
	alert,
	alertTone = "neutral",
	contentTop,
	contentBottom,
	footerText,
	footerSlot,
	headerDivider,
	footerDivider,
	expandable = false,
	expanded,
	defaultExpanded = false,
	onExpandedChange,
	strings,
	className,
	children,
	...props
}: CardProps) {
	const copy = { ...defaultCardStrings, ...strings }
	const defaults = useDefaults("card", CARD_DEFAULTS)
	const resolvedSurface = surface ?? defaults.surface
	const resolvedHeaderDivider = headerDivider ?? defaults.headerDivider

	const [uncontrolled, setUncontrolled] = React.useState(defaultExpanded)
	const isControlled = expanded !== undefined
	const isExpanded = isControlled ? expanded : uncontrolled

	const toggle = () => {
		const next = !isExpanded
		if (!isControlled) setUncontrolled(next)
		onExpandedChange?.(next)
	}

	/* `expandable` is a union: read it through these, never as a boolean or `=== true`. */
	const isExpandable = expandable !== false && expandable !== undefined
	const collapsedMaxHeight =
		typeof expandable === "object" ? expandable.collapsedMaxHeight : undefined

	/* A `CardFooter` child is lifted out of the content and rendered as the footer. */
	const childList = React.Children.toArray(children)
	const liftedFooters = childList.filter((child) => React.isValidElement(child) && child.type === CardFooter)
	const body = liftedFooters.length > 0 ? childList.filter((child) => !liftedFooters.includes(child)) : children
	const hasBody = liftedFooters.length > 0 ? (body as React.ReactNode[]).length > 0 : !!children

	const hasHeader = !!(icon || title || titleSuffix || tooltip || description || headerStart || headerEnd || headerAction || actions?.length)
	const hasContent = !!(hasBody || contentTop || contentBottom)
	const hasFooter = !!(footerText || footerSlot)

	const content = hasContent && (
		<CardContent
			className={cx(isExpandable && styles.collapsible, isExpandable && isExpanded && styles.expanded)}
			style={
				collapsedMaxHeight === undefined
					? undefined
					: ({
							"--card-collapsed-height":
								typeof collapsedMaxHeight === "number" ? `${collapsedMaxHeight}px` : collapsedMaxHeight,
						} as React.CSSProperties)
			}
		>
			{contentTop}
			{body}
			{contentBottom}
		</CardContent>
	)

	return (
		<div
			data-slot="card"
			data-surface={resolvedSurface}
			className={cx("card--component", cardVariants({ surface: resolvedSurface }), className)}
			{...props}
		>
			{!!media && <div className={cx("card--media", styles.media)}>{media}</div>}

			{hasHeader && (
				<CardHeader
					titleLevel={titleLevel}
					icon={icon}
					title={title}
					titleSuffix={titleSuffix}
					tooltip={tooltip}
					tooltipLabel={copy.tooltip}
					description={description}
					headerStart={headerStart}
					headerEnd={headerEnd}
					headerAction={
						<>
							{headerAction}
							{!!actions?.length && <ActionMenu actions={actions} strings={{ trigger: copy.actions }} />}
						</>
					}
					divider={resolvedHeaderDivider}
				/>
			)}

			{!!alert && (
				<div className={cx("card--alert", styles.alert)}>
					{typeof alert === "string" ? (
						<Alert tone={alertTone}>
							<AlertDescription>{alert}</AlertDescription>
						</Alert>
					) : (
						alert
					)}
				</div>
			)}

			{content}

			{isExpandable && hasContent && (
				<div className={styles.expandToggle}>
					<Button tone="neutral" buttonStyle="ghost" onClick={toggle} aria-expanded={isExpanded}>
						{isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
						{isExpanded ? copy.collapse : copy.expand}
					</Button>
				</div>
			)}

			{hasFooter && (
				<CardFooter divider={footerDivider} text={footerText}>
					{footerSlot}
				</CardFooter>
			)}
			{liftedFooters}
		</div>
	)
}
