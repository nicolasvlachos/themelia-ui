/**
 * CardActionStrip and CardPrimaryAction — a card's commands. The strip takes the same
 * `ActionDefinition` array as the overflow menu; the primary action makes the card one target.
 */
import { isValidElement, type ComponentProps, type ComponentType, type ReactElement, type ReactNode } from "react"

import type { ActionDefinition, ActionLinkRenderer } from "@/components/base/action-menu"
import { Button, type ButtonStyle } from "@/components/base/buttons"
import { cx } from "@/lib/cx"

import styles from "./cards.module.css"

export interface CardActionStripProps extends Omit<ComponentProps<"div">, "children"> {
	actions: ActionDefinition[]
	/** A rule above the strip, for a card whose content runs right into it. */
	separator?: boolean
	align?: "start" | "end" | "between"
	/** Stretches the first action, for a narrow card where two buttons will not fit. */
	fullWidthPrimary?: boolean
	/** Routes `href` actions through the app's router. */
	renderLink?: ActionLinkRenderer
}

function renderIcon(icon: ActionDefinition["icon"]): ReactNode {
	if (!icon) return null
	if (isValidElement(icon)) return icon
	if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
		const Icon = icon as ComponentType<{ "aria-hidden"?: boolean }>
		return <Icon aria-hidden />
	}
	return icon as ReactNode
}

export function CardActionStrip({
	actions,
	separator = false,
	align = "start",
	fullWidthPrimary = false,
	renderLink,
	className,
	...props
}: CardActionStripProps) {
	const visible = actions.filter((action) => action.visible !== false)
	if (visible.length === 0) return null

	return (
		<div
			className={cx(
				"card-action-strip--component",
				styles.actionStrip,
				separator && styles.actionStripSeparated,
				align === "end" && styles.actionStripEnd,
				align === "between" && styles.actionStripBetween,
				fullWidthPrimary && styles.actionStripFullPrimary,
				className,
			)}
			{...props}
		>
			{visible.map((action, index) => {
				const content = (
					<>
						{renderIcon(action.icon)}
						{action.label}
					</>
				)
				const buttonStyle: ButtonStyle =
					action.buttonStyle === "link" ? "ghost" : ((action.buttonStyle as ButtonStyle) ?? (index === 0 ? "solid" : "outline"))

				if (action.href && !action.disabled) {
					const href = action.href
					return (
						<Button
							key={action.id ?? index}
							/* The anchor arrives complete; `render` keeps its children since the button passes none. */
							render={
								(renderLink ? (
									renderLink({ href, children: content, external: action.external })
								) : (
									<a href={href} target={action.target} rel={action.rel}>
										{content}
									</a>
								)) as ReactElement
							}
							tone={action.tone ?? "primary"}
							buttonStyle={buttonStyle}
						/>
					)
				}

				return (
					<Button
						key={action.id ?? index}
						tone={action.tone ?? "primary"}
						buttonStyle={buttonStyle}
						disabled={action.disabled}
						onClick={action.onClick}
					>
						{content}
					</Button>
				)
			})}
		</div>
	)
}

export interface CardPrimaryActionProps extends ComponentProps<"a"> {
	/** Names the target. The card's own title is not enough — many cards share one. */
	label: string
}

/**
 * Makes a whole card one target with a covering link (wrapping the card would nest its
 * controls inside an anchor). Interactive children are lifted above it in CSS.
 */
export function CardPrimaryAction({ label, className, ...props }: CardPrimaryActionProps) {
	return (
		<a
			aria-label={label}
			className={cx("card-primary-action--component", styles.primaryAction, className)}
			{...props}
		/>
	)
}
