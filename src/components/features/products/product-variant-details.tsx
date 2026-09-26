/**
 * One variant, read-only. `variant` is optional because the panel is usually bound to a
 * selection and should say "nothing chosen" rather than disappear. Facts derive from the
 * variant's own fields; `metadata` replaces them, and absent fields are omitted.
 */
import { resolveStrings } from "@/lib/strings"
import { ArrowLeftIcon, ListChecksIcon } from "lucide-react"
import type { ReactNode } from "react"

import { ActionMenu } from "@/components/base/action-menu"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock, MetadataList, type MetadataListItem } from "@/components/base/display"
import { ItemGroup } from "@/components/base/item"
import { DisplayLabel } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { ProductEmptyState, ProductSummaryRow } from "./product-parts"
import { ProductVariantActionMenu } from "./product-variants"
import {
	defaultProductVariantDetailsStrings, type ProductVariantDetailsStrings,
} from "./products.strings"
import type { ProductVariantDetailsProps, ProductVariantSummary } from "./products.types"
import styles from "./products.module.css"

/** A fact with no value is left out rather than rendered as an em dash. */
function isPresent(value: ReactNode): boolean {
	return value !== undefined && value !== null && value !== false && value !== ""
}

function derivedFacts(
	variant: ProductVariantSummary,
	labels: ProductVariantDetailsStrings["metadata"],
): MetadataListItem[] {
	return [
		{ id: "price", label: labels.price, value: variant.price },
		{ id: "inventory", label: labels.inventory, value: variant.inventory },
		{ id: "sku", label: labels.sku, value: variant.sku },
		{ id: "channels", label: labels.channels, value: variant.channels },
		{ id: "updated", label: labels.updated, value: variant.updatedAt },
	].filter((fact) => isPresent(fact.value))
}

export function ProductVariantDetails({
	variant,
	metadata,
	optionItems = [],
	media,
	onBack,
	onSelectVariant,
	onEditVariant,
	onDuplicateVariant,
	onDeleteVariant,
	onSelectOption,
	actions,
	headerEnd,
	footerSlot,
	empty,
	renderActions,
	renderMetadata,
	renderOption,
	className,
	strings,
}: ProductVariantDetailsProps) {
	const copy = resolveStrings(defaultProductVariantDetailsStrings, strings)

	const facts = variant ? (metadata ?? derivedFacts(variant, copy.metadata)) : []
	const hasVariantMenu = !!(
		variant &&
		(onSelectVariant || onEditVariant || onDuplicateVariant || onDeleteVariant || renderActions)
	)
	const selectedOptions = variant?.options ?? []

	return (
		<ContentBlock
			surface="bordered"
			icon={<ListChecksIcon />}
			title={variant?.name ?? copy.title}
			titleSuffix={
				variant?.status ? (
					<Badge tone={variant.statusTone ?? "neutral"}>{variant.status}</Badge>
				) : undefined
			}
			description={variant?.description ?? copy.description}
			headerEnd={
				<>
					{!!onBack && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onBack}>
							<ArrowLeftIcon />
							{copy.backLabel}
						</Button>
					)}
					{!!hasVariantMenu && !!variant && (
						<ProductVariantActionMenu
							variant={variant}
							onSelectVariant={onSelectVariant}
							onEditVariant={onEditVariant}
							onDuplicateVariant={onDuplicateVariant}
							onDeleteVariant={onDeleteVariant}
							renderVariantActions={renderActions}
						/>
					)}
					{headerEnd}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-variant-details--component", styles.card, className)}
		>
			{!variant ? (
				(empty ?? (
					<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
				))
			) : (
				<>
					{!!media && <div className={styles.media}>{media}</div>}

					{renderMetadata ? (
						renderMetadata(variant)
					) : (
						<MetadataList title={copy.factsTitle} items={facts} columns={3} density="compact" />
					)}

					{selectedOptions.length > 0 && (
						<section className={styles.section}>
							<DisplayLabel>{copy.selectedOptionsTitle}</DisplayLabel>
							<div className={styles.rowValues}>
								{selectedOptions.map((option, index) => (
									<Badge key={index} tone="neutral">{option}</Badge>
								))}
							</div>
						</section>
					)}

					{optionItems.length > 0 && (
						<section className={styles.section}>
							<DisplayLabel>{copy.relatedOptionsTitle}</DisplayLabel>
							<ItemGroup>
								{optionItems.map((option, index) =>
									renderOption ? (
										<div key={option.id}>{renderOption(option, index)}</div>
									) : (
										<ProductSummaryRow
											key={option.id}
											item={option}
											actionLabel={copy.viewOptionLabel}
											onSelect={onSelectOption ? () => onSelectOption(option) : undefined}
										/>
									),
								)}
							</ItemGroup>
						</section>
					)}
				</>
			)}

			{footerSlot}
		</ContentBlock>
	)
}
