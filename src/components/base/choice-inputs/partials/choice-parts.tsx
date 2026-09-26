import { InfoIcon } from "lucide-react"
import type { ReactNode } from "react"

import { VisuallyHidden } from "@/components/base/display"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "../choice.module.css"
import type { ChoiceOption } from "../choice.types"
import { isSimpleText } from "./choice-icon"

/**
 * The label, plus an info glyph when the option carries a tooltip. The glyph is not a
 * button: the option is a `radio`, and a control inside it is `nested-interactive`. The
 * note becomes the option's description instead (via `descriptionId`, which the caller
 * wires to `aria-describedby`). Trade-off: keyboard-only sighted users can't open the tooltip.
 */
export function ChoiceLabel({
	option,
	weight = "medium",
	className,
	descriptionId,
}: {
	option: ChoiceOption
	weight?: "regular" | "medium" | "semibold"
	className?: string
	/** Id for the hidden copy of the tooltip, which the option points `aria-describedby` at. */
	descriptionId?: string
}) {
	const label = isSimpleText(option.label) ? (
		<Text tag="span" size="inherit" weight={weight} lineHeight="tight">
			{option.label}
		</Text>
	) : (
		option.label
	)

	if (option.tooltip == null) return <span className={cx("choice-label--component", className)}>{label}</span>

	return (
		<span className={cx(styles.labelLine, className)}>
			{label}
			<Tooltip>
				<TooltipTrigger
					render={
						<span data-hit-area aria-hidden className={styles.info}>
							<InfoIcon />
						</span>
					}
				/>
				<TooltipContent>{option.tooltip}</TooltipContent>
			</Tooltip>
			{/* The hidden copy the option's `aria-describedby` points at, so it can't drift from the tooltip. */}
			{!!descriptionId && <VisuallyHidden id={descriptionId}>{option.tooltip}</VisuallyHidden>}
		</span>
	)
}

/**
 * A card's title and description as one block, so they sit at `--space-xs` instead of the
 * card's icon-to-text gap.
 */
export function ChoiceCardText({ children }: { children: ReactNode }) {
	return <span className={cx("choice-card-text--component", styles.cardText)}>{children}</span>
}

export function ChoiceDescription({ children }: { children: ReactNode }) {
	if (children == null || children === false) return null
	return isSimpleText(children) ? (
		<Text tag="span" size="inherit" type="secondary" className={cx("choice-description--component", styles.description)}>
			{children}
		</Text>
	) : (
		<>{children}</>
	)
}
