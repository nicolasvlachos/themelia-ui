import { InfoIcon } from "lucide-react"
import * as React from "react"

import { Stack } from "@/components/base/structure"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "../cards.module.css"

/**
 * The header region: a title row with trailing controls, plus an optional full-width row
 * above. The title truncates rather than pushing the controls off the row.
 */
export function CardHeader({
	icon,
	title,
	titleSuffix,
	tooltip,
	tooltipLabel = "More information",
	description,
	headerStart,
	headerEnd,
	headerAction,
	divider,
	titleLevel,
	className,
	...props
	// `title` is omitted from the div props: the HTML attribute is a string, which would intersect with the ReactNode prop.
}: Omit<React.ComponentProps<"div">, "title"> & {
	icon?: React.ReactNode
	title?: React.ReactNode
	titleSuffix?: React.ReactNode
	tooltip?: React.ReactNode
	tooltipLabel?: string
	description?: React.ReactNode
	headerStart?: React.ReactNode
	headerEnd?: React.ReactNode
	headerAction?: React.ReactNode
	divider?: boolean
	/** Renders the title as a heading of this level. See `CardProps.titleLevel`. */
	titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
}) {
	const TitleHeading = titleLevel ? (`h${titleLevel}` as const) : null
	return (
		<Stack gap="xs"
			data-slot="card-header"
			className={cx("card--header", styles.header, divider && styles.headerDivider, className)}
			{...props}
		>
			{headerStart}
			<div className={styles.titleRow}>
				{!!icon && <span className={styles.icon}>{icon}</span>}
				{!!title &&
					(TitleHeading ? (
						<TitleHeading className={cx("card--title", styles.title)}>{title}</TitleHeading>
					) : (
						<Text tag="span" size="inherit" weight="semibold" className={cx("card--title", styles.title)}>
							{title}
						</Text>
					))}
				{!!titleSuffix && <span className={styles.titleSuffix}>{titleSuffix}</span>}
				{!!tooltip && (
					<Tooltip>
						<TooltipTrigger
							render={
								<button type="button" data-hit-area className={styles.titleInfo} aria-label={tooltipLabel} />
							}
						>
							<InfoIcon aria-hidden />
						</TooltipTrigger>
						<TooltipContent>{tooltip}</TooltipContent>
					</Tooltip>
				)}
				{!!(headerEnd || headerAction) && (
					<span className={styles.headerControls}>
						{headerEnd}
						{headerAction}
					</span>
				)}
			</div>
			{!!description && (
				<Text type="secondary" className={cx("card--description", styles.description)}>
					{description}
				</Text>
			)}
		</Stack>
	)
}
