import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useDefaults } from "@/lib/ui-provider"

import styles from "./accordion.module.css"
import type { AccordionItemData, AccordionMedia, AccordionSurface } from "./accordion.types"

const SURFACE = {
	bordered: styles.surfaceBordered,
	card: styles.surfaceCard,
	flat: styles.surfaceFlat,
} satisfies Record<AccordionSurface, string>

export interface AccordionProps extends AccordionPrimitive.Root.Props<string> {
	/** Outer chrome. Resolves through the provider when omitted. */
	surface?: AccordionSurface
	/**
	 * Bounded sections, each rendered as the canonical icon/title/badge/description row.
	 * Ignored when `children` are supplied.
	 */
	items?: AccordionItemData[]
	/** How leading media is framed. Only meaningful alongside `items`. */
	media?: AccordionMedia
}

export type AccordionItemProps = AccordionPrimitive.Item.Props
export type AccordionTriggerProps = AccordionPrimitive.Trigger.Props
export type AccordionContentProps = AccordionPrimitive.Panel.Props

function isSimpleText(value: ReactNode): value is string | number | bigint {
	return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
}

export function Accordion({ className, surface, items, media, children, ...props }: AccordionProps) {
	const defaults = useDefaults("accordion", { surface: "bordered", media: "inline" })
	const resolvedSurface = surface ?? defaults.surface
	const resolvedMedia = media ?? defaults.media

	return (
		<AccordionPrimitive.Root
			className={cx("accordion--component", styles.root, SURFACE[resolvedSurface], className)}
			data-surface={resolvedSurface}
			{...props}
		>
			{children ?? items?.map((item) => (
				<BoundedItem key={item.value} item={item} media={resolvedMedia} items={items} />
			))}
		</AccordionPrimitive.Root>
	)
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
	return <AccordionPrimitive.Item className={cx("accordion-item--component", styles.item, className)} {...props} />
}

export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
	return (
		<AccordionPrimitive.Header className={styles.header}>
			<AccordionPrimitive.Trigger
				className={cx("accordion-trigger--component", styles.trigger, className)}
				{...props}
			>
				{isSimpleText(children) ? (
					<Text tag="span" size="inherit" weight="medium">
						{children}
					</Text>
				) : (
					children
				)}
				<ChevronDownIcon aria-hidden className={styles.icon} />
			</AccordionPrimitive.Trigger>
		</AccordionPrimitive.Header>
	)
}

export function AccordionContent({ className, children, ...props }: AccordionContentProps) {
	return (
		<AccordionPrimitive.Panel className={cx("accordion-content--component", styles.panel)} {...props}>
			<div className={cx(styles.content, className)}>
				{isSimpleText(children) ? (
					<Text tag="div" size="inherit" type="secondary" lineHeight="relaxed">
						{children}
					</Text>
				) : (
					children
				)}
			</div>
		</AccordionPrimitive.Panel>
	)
}

/** The bounded row. The media column is a group property: one row with an icon reserves it for all. */
function BoundedItem({
	item,
	media,
	items,
}: {
	item: AccordionItemData
	media: AccordionMedia
	items: AccordionItemData[]
}) {
	const hasMediaColumn = media !== "none" && items.some((entry) => entry.icon != null)
	const bodyIndent = !hasMediaColumn
		? undefined
		: media === "medallion"
			? styles.bodyWithMedallion
			: styles.bodyWithMedia

	return (
		<AccordionItem value={item.value} className="accordion--item">
			<AccordionTrigger disabled={item.disabled} className="accordion--trigger">
				<span className={cx(styles.row, hasMediaColumn && styles.rowWithMedia)}>
					{hasMediaColumn && (
						<span
							aria-hidden
							className={cx(
								"accordion--media",
								styles.media,
								media === "medallion" && item.icon != null && styles.mediaMedallion,
							)}
						>
							{item.icon}
						</span>
					)}
					<span className={cx("accordion--heading", styles.heading)}>
						<span className={styles.titleLine}>
							{isSimpleText(item.title) ? (
								<Text tag="span" size="inherit" weight="medium" className="accordion--title">
									{item.title}
								</Text>
							) : (
								item.title
							)}
							{item.badge != null && <span className={styles.badge}>{item.badge}</span>}
						</span>
						{item.description != null &&
							(isSimpleText(item.description) ? (
								<Text tag="span" size="sm" type="secondary" className="accordion--description">
									{item.description}
								</Text>
							) : (
								item.description
							))}
					</span>
				</span>
			</AccordionTrigger>
			<AccordionContent className={cx("accordion--content", bodyIndent)}>{item.content}</AccordionContent>
		</AccordionItem>
	)
}
