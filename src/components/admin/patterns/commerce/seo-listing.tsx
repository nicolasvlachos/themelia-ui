/**
 * SeoListing: a search-result preview and its score breakdown. Render-only; scoring lives
 * in `seo-score.ts`. The preview uses the kit's type, not a pixel copy of a search engine.
 */
import { resolveStrings } from "@/lib/strings"
import {
	CircleAlertIcon, CircleCheckIcon, CircleXIcon, SearchIcon,
} from "lucide-react"
import type { ComponentProps } from "react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultSeoStrings, type SeoStrings } from "./commerce.strings"
import { calculateSeoScore, seoPermalinkPath, type SeoCheck, type SeoScore, type SeoScoreInput } from "./seo-score"
import styles from "./commerce.module.css"

export interface SeoListingProps extends Omit<ComponentProps<typeof ContentBlock>, "children" | "title"> {
	/** What the result will read as. */
	listing: SeoScoreInput
	/** A score computed elsewhere (e.g. per keystroke by an editor). Without it, the listing is scored here. */
	score?: SeoScore
	onEdit?: () => void
	strings?: Partial<SeoStrings>
}

/* A distinct glyph per verdict, so status does not rely on colour alone. */
const CHECK_ICON = {
	good: CircleCheckIcon,
	review: CircleAlertIcon,
	missing: CircleXIcon,
} as const

const TONE = {
	good: "success",
	review: "warning",
	missing: "destructive",
} as const

export function SeoListing({ listing, score, onEdit, strings, className, ...props }: SeoListingProps) {
	const copy = resolveStrings(defaultSeoStrings, strings)
	const result = score ?? calculateSeoScore(listing)

	const path = seoPermalinkPath(listing.permalink)
	const origin = listing.baseUrl?.trim().replace(/\/+$/, "") ?? ""
	const displayUrl = [origin, path].filter(Boolean).join("/")

	const label = (check: SeoCheck) => copy.checks[check.id]

	/** "62 / 60" for a bounded check, "62" for one that is only present or absent. */
	const measure = (check: SeoCheck) =>
		check.max != null ? copy.formatMeasure(check.actual, check.max) : String(check.actual)

	return (
		<ContentBlock
			icon={<SearchIcon aria-hidden="true" />}
			title={copy.title}
			/* The overall score is a status chip in the header; the breakdown is the body. */
			titleSuffix={<Badge tone={TONE[result.status]}>{copy.formatScore(result.score)}</Badge>}
			className={cx("seo-listing--component", styles.block, className)}
			{...props}
		>
			{/* The preview, in the kit's type. */}
			<ContentBlock surface="bordered" className={cx("seo-listing--preview", styles.seoPreview)}>
				<span className={styles.seoUrl}>
					<Text tag="span" size="xs" type="secondary">
						{displayUrl || copy.noPermalink}
					</Text>
				</span>
				<Text weight="semibold" className={styles.seoTitle}>
					{listing.title?.trim() || copy.noTitle}
				</Text>
				<Text type="secondary" className={styles.seoDescription}>
					{listing.description?.trim() || copy.noDescription}
				</Text>
			</ContentBlock>

			<ul className={cx("seo-listing--checks", styles.seoChecks)}>
				{result.checks.map(check => {
					const CheckIcon = CHECK_ICON[check.status]
					const ranged = check.max != null
					const percent = Math.round((check.ratio ?? check.score / (check.maxScore || 1)) * 100)
					return <li key={check.id} data-status={check.status} className={styles.seoCheck}>
						<CheckIcon className={styles.seoCheckIcon} aria-hidden="true" />
						<span className={styles.seoCheckBody}>
							<Text tag="span" weight="medium">{label(check)}</Text>
							<Text tag="span" size="xs" type="secondary">
								{ranged ? <>{measure(check)}{" · "}</> : null}{copy.status[check.status]}
							</Text>
						</span>
						<Text tag="span" size="xs" type="secondary" numeric>{copy.formatPercent(percent)}</Text>
					</li>
				})}
			</ul>

			{onEdit && (
				<div className={styles.blockActions}>
					<Button tone="secondary" buttonStyle="outline" onClick={onEdit}>
						{copy.edit}
					</Button>
				</div>
			)}
		</ContentBlock>
	)
}
