/**
 * The cards a product page is assembled from: each a `ContentBlock` holding a list with the
 * same row verbs. Separate components because their content differs in shape.
 */
import {
	ClipboardCheckIcon, FileTextIcon, LayersIcon, PencilIcon, PlusIcon, ReceiptIcon,
	RotateCcwIcon, SettingsIcon, ShieldCheckIcon, Trash2Icon,
} from "lucide-react"
import type { ReactNode } from "react"

import { ActionMenu } from "@/components/base/action-menu"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { ItemGroup } from "@/components/base/item"
import { MetadataList, Separator, type MetadataListItem } from "@/components/base/display"
import { Progress } from "@/components/base/feedback"
import { DisplayLabel, Text } from "@/components/base/typography"
import { Percent, Value } from "@/components/primitives"
import type { TableAction } from "@/components/features/table"
import { cx } from "@/lib/cx"

import {
	ProductEmptyState, ProductOperationRow, ProductReadinessRow,
	ProductRowActions, ProductStructureMetricRow, ProductSummaryRow, } from "./product-parts"
import * as S from "./products.strings"
import type {
	ProductContractOverviewProps, ProductDetailsCardProps, ProductOperationsCardProps,
	ProductOptionsSummaryProps, ProductOverviewProps, ProductPoliciesCardProps,
	ProductQuotePreviewCardProps, ProductReadinessCardProps, ProductRowActionContext,
	ProductMetricSummary, ProductStructureCardProps, ProductStructureMetric,
} from "./products.types"
import styles from "./products.module.css"
import { clampProductPercent } from "./product-percent"

/** Edit and Delete from whichever handlers exist; an absent verb draws nothing. */
function rowActions<TItem extends object>(
	editLabel: string,
	deleteLabel: string,
	onEdit?: () => void,
	onDelete?: () => void,
): TableAction<TItem>[] {
	return [
		...(onEdit ? [{ id: "edit", label: editLabel, icon: <PencilIcon />, onClick: onEdit }] : []),
		...(onDelete
			? [{ id: "delete", label: deleteLabel, icon: <Trash2Icon />, tone: "destructive" as const, onClick: onDelete }]
			: []),
	]
}

/**
 * The row's menu, or `undefined`. A `<ProductRowActions>` element is truthy even when it
 * renders null, and the row uses "has a menu" to decide whether it can be a button.
 */
function rowActionsNode<TItem extends object>(
	custom: ReactNode | undefined,
	item: TItem,
	actions: TableAction<TItem>[],
	menuLabel: string,
): ReactNode | undefined {
	if (custom) return custom
	if (actions.length === 0) return undefined
	return <ProductRowActions item={item} actions={actions} menuLabel={menuLabel} />
}

/** Metrics as `MetadataList` facts, with the tone on the value. */
function metricFacts(
	metrics: readonly (ProductMetricSummary | ProductStructureMetric)[],
): MetadataListItem[] {
	return metrics.map((metric) => ({
		id: metric.id,
		label: metric.label,
		description: metric.description,
		render: () => (
			<Value
				weight="semibold"
				data-tone={metric.tone ?? "neutral"}
				className={styles.metricValue}
			>
				{metric.value}
			</Value>
		),
	}))
}

/** The header's create button plus the surface's own overflow menu. */
function headerEnd(
	createLabel: string,
	onCreate?: () => void,
	actions?: ProductReadinessCardProps["actions"],
	extra?: ReactNode,
) {
	if (!onCreate && !actions?.length && !extra) return undefined
	return (
		<>
			{extra}
			{!!onCreate && (
				<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onCreate}>
					<PlusIcon />
					{createLabel}
				</Button>
			)}
			{!!actions?.length && <ActionMenu actions={actions} />}
		</>
	)
}

export function ProductReadinessCard({
	items = [], score, scoreLabel, summary,
	onCreateReadinessItem, onSelectReadinessItem, onEditReadinessItem, onDeleteReadinessItem,
	renderReadinessItemActions, actions, footerSlot, renderItem, empty, className, strings,
}: ProductReadinessCardProps) {
	const copy = { ...S.defaultProductReadinessCardStrings, ...strings }
	const completion = score === undefined ? undefined : clampProductPercent(score)

	return (
		<ContentBlock
			surface="bordered"
			icon={<ClipboardCheckIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={headerEnd(copy.createLabel, onCreateReadinessItem, actions)}
			className={cx("product-readiness-card--component", styles.card, className)}
		>
			{completion !== undefined && (
				<div className={styles.score}>
					<div className={styles.scoreHead}>
						<Text size="xs" type="secondary">{scoreLabel ?? copy.scoreLabel}</Text>
						<Percent value={completion} scaled size="xs" weight="semibold" />
					</div>
					<Progress
						value={completion}
						aria-label={typeof scoreLabel === "string" ? scoreLabel : copy.progressLabel}
					/>
				</div>
			)}

			{!!summary && <Text type="secondary">{summary}</Text>}

			{items.length === 0 ? (
				(empty ?? (
					<ProductEmptyState
						title={copy.emptyTitle}
						description={copy.emptyDescription}
						action={
							onCreateReadinessItem ? (
								<Button type="button" onClick={onCreateReadinessItem}>
									<PlusIcon />
									{copy.createLabel}
								</Button>
							) : undefined
						}
					/>
				))
			) : (
				<ItemGroup>
					{items.map((item, index) => {
						if (renderItem) return <div key={item.id}>{renderItem(item, index)}</div>

						const onSelect = onSelectReadinessItem ? () => onSelectReadinessItem(item) : undefined
						const onEdit = onEditReadinessItem ? () => onEditReadinessItem(item) : undefined
						const onDelete = onDeleteReadinessItem ? () => onDeleteReadinessItem(item) : undefined
						const context: ProductRowActionContext = { index, onSelect, onEdit, onDelete }

						return (
							<ProductReadinessRow
								key={item.id}
								item={item}
								actionFallback={copy.actionLabel}
								onSelect={onSelect}
								actions={rowActionsNode(
									renderReadinessItemActions?.(item, context),
									item,
									rowActions(copy.editLabel, copy.deleteLabel, onEdit, onDelete),
									copy.actionsLabel,
								)}
							/>
						)
					})}
				</ItemGroup>
			)}

			{footerSlot}
		</ContentBlock>
	)
}

export function ProductStructureCard({
	metrics = [], onCreateMetric, onSelectMetric, onEditMetric, onDeleteMetric,
	renderMetricActions, actions, footerSlot, empty, className, strings,
}: ProductStructureCardProps) {
	const copy = { ...S.defaultProductStructureCardStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<LayersIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={headerEnd(copy.createLabel, onCreateMetric, actions)}
			className={cx("product-structure-card--component", styles.card, className)}
		>
			{metrics.length === 0 ? (
				(empty ?? (
					<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
				))
			) : (
				<ItemGroup>
					{metrics.map((metric, index) => {
						const onSelect = onSelectMetric ? () => onSelectMetric(metric) : undefined
						const onEdit = onEditMetric ? () => onEditMetric(metric) : undefined
						const onDelete = onDeleteMetric ? () => onDeleteMetric(metric) : undefined

						return (
							<ProductStructureMetricRow
								key={metric.id}
								metric={metric}
								actions={rowActionsNode(
									renderMetricActions?.(metric, { index, onSelect, onEdit, onDelete }),
									metric,
									rowActions(copy.editLabel, copy.deleteLabel, onEdit, onDelete),
									copy.actionsLabel,
								)}
							/>
						)
					})}
				</ItemGroup>
			)}
			{footerSlot}
		</ContentBlock>
	)
}

export function ProductOperationsCard({
	items = [], onCreateOperation, onSelectOperation, onEditOperation, onDeleteOperation,
	renderOperationActions, actions, footerSlot, renderItem, empty, className, strings,
}: ProductOperationsCardProps) {
	const copy = { ...S.defaultProductOperationsCardStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<SettingsIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={headerEnd(copy.createLabel, onCreateOperation, actions)}
			className={cx("product-operations-card--component", styles.card, className)}
		>
			{items.length === 0 ? (
				(empty ?? (
					<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
				))
			) : (
				<ItemGroup>
					{items.map((item, index) => {
						if (renderItem) return <div key={item.id}>{renderItem(item, index)}</div>

						const onSelect = onSelectOperation ? () => onSelectOperation(item) : undefined
						const onEdit = onEditOperation ? () => onEditOperation(item) : undefined
						const onDelete = onDeleteOperation ? () => onDeleteOperation(item) : undefined

						return (
							<ProductOperationRow
								key={item.id}
								item={item}
								actionFallback={copy.actionLabel}
								onSelect={onSelect}
								actions={rowActionsNode(
									renderOperationActions?.(item, { index, onSelect, onEdit, onDelete }),
									item,
									rowActions(copy.editLabel, copy.deleteLabel, onEdit, onDelete),
									copy.actionsLabel,
								)}
							/>
						)
					})}
				</ItemGroup>
			)}
			{footerSlot}
		</ContentBlock>
	)
}

export function ProductDetailsCard({
	title, description, metadata = [], media, onEditDetails, actions, headerEnd: end,
	footerSlot, empty, className, strings,
}: ProductDetailsCardProps) {
	const copy = { ...S.defaultProductDetailsCardStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<FileTextIcon />}
			title={title ?? copy.title}
			// `false` suppresses it rather than rendering an empty line.
			description={description === false ? undefined : (description ?? copy.description)}
			headerEnd={
				<>
					{end}
					{!!onEditDetails && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onEditDetails}>
							<PencilIcon />
							{copy.editLabel}
						</Button>
					)}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-details-card--component", styles.card, className)}
		>
			{!!media && <div className={styles.media}>{media}</div>}
			{metadata.length === 0
				? (empty ?? (
						<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
					))
				: <MetadataList items={metadata} columns={2} />}
			{footerSlot}
		</ContentBlock>
	)
}

export function ProductContractOverview({
	metricColumns = 3,
	metrics = [], terms = [], rules = [], onOpenContract, onEditContract, onCreateRule,
	onSelectRule, onEditRule, onDeleteRule, renderRuleActions, actions, footerSlot, empty,
	className, strings,
}: ProductContractOverviewProps) {
	const copy = { ...S.defaultProductContractOverviewStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<ShieldCheckIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={
				<>
					{!!onOpenContract && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onOpenContract}>
							{copy.openLabel}
						</Button>
					)}
					{!!onEditContract && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onEditContract}>
							<PencilIcon />
							{copy.editLabel}
						</Button>
					)}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-contract-overview--component", styles.card, className)}
		>
			{metrics.length > 0 && <MetadataList columns={metricColumns} items={metricFacts(metrics)} />}

			{terms.length > 0 && (
				<section className={styles.section}>
					<DisplayLabel>{copy.termsTitle}</DisplayLabel>
					<MetadataList items={terms} columns={2} />
				</section>
			)}

			<section className={styles.section}>
				<div className={styles.sectionHead}>
					<DisplayLabel>{copy.rulesTitle}</DisplayLabel>
					{!!onCreateRule && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onCreateRule}>
							<PlusIcon />
							{copy.createRuleLabel}
						</Button>
					)}
				</div>

				{rules.length === 0 ? (
					(empty ?? (
						<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
					))
				) : (
					<ItemGroup>
						{rules.map((rule, index) => {
							const onSelect = onSelectRule ? () => onSelectRule(rule) : undefined
							const onEdit = onEditRule ? () => onEditRule(rule) : undefined
							const onDelete = onDeleteRule ? () => onDeleteRule(rule) : undefined

							return (
								<ProductSummaryRow
									key={rule.id}
									item={rule}
									onSelect={onSelect}
									actions={rowActionsNode(
									renderRuleActions?.(rule, { index, onSelect, onEdit, onDelete }),
									rule,
									rowActions(copy.editRuleLabel, copy.deleteRuleLabel, onEdit, onDelete),
									copy.ruleActionsLabel,
								)}
								/>
							)
						})}
					</ItemGroup>
				)}
			</section>

			{footerSlot}
		</ContentBlock>
	)
}

export function ProductPoliciesCard({
	policies = [], onCreatePolicy, onSelectPolicy, onEditPolicy, onDeletePolicy,
	renderPolicyActions, actions, footerSlot, empty, className, strings,
}: ProductPoliciesCardProps) {
	const copy = { ...S.defaultProductPoliciesCardStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<ShieldCheckIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={headerEnd(copy.createLabel, onCreatePolicy, actions)}
			className={cx("product-policies-card--component", styles.card, className)}
		>
			{policies.length === 0 ? (
				(empty ?? (
					<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
				))
			) : (
				<ItemGroup>
					{policies.map((policy, index) => {
						const onSelect = onSelectPolicy ? () => onSelectPolicy(policy) : undefined
						const onEdit = onEditPolicy ? () => onEditPolicy(policy) : undefined
						const onDelete = onDeletePolicy ? () => onDeletePolicy(policy) : undefined

						return (
							<ProductSummaryRow
								key={policy.id}
								item={policy}
								onSelect={onSelect}
								actions={rowActionsNode(
									renderPolicyActions?.(policy, { index, onSelect, onEdit, onDelete }),
									policy,
									rowActions(copy.editLabel, copy.deleteLabel, onEdit, onDelete),
									copy.actionsLabel,
								)}
							/>
						)
					})}
				</ItemGroup>
			)}
			{footerSlot}
		</ContentBlock>
	)
}

export function ProductOptionsSummary({
	options = [], onManageOptions, onCreateOption, onSelectOption, onEditOption,
	onDeleteOption, renderOptionActions, actions, footerSlot, empty, className, strings,
}: ProductOptionsSummaryProps) {
	const copy = { ...S.defaultProductOptionsSummaryStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<LayersIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={headerEnd(
				copy.createLabel,
				onCreateOption,
				actions,
				onManageOptions ? (
					<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onManageOptions}>
						{copy.manageLabel}
					</Button>
				) : undefined,
			)}
			className={cx("product-options-summary--component", styles.card, className)}
		>
			{options.length === 0 ? (
				(empty ?? (
					<ProductEmptyState
						title={copy.emptyTitle}
						description={copy.emptyDescription}
						action={
							onCreateOption ? (
								<Button type="button" onClick={onCreateOption}>
									<PlusIcon />
									{copy.createLabel}
								</Button>
							) : undefined
						}
					/>
				))
			) : (
				<ItemGroup>
					{options.map((option, index) => {
						const onSelect = onSelectOption ? () => onSelectOption(option) : undefined
						const onEdit = onEditOption ? () => onEditOption(option) : undefined
						const onDelete = onDeleteOption ? () => onDeleteOption(option) : undefined

						return (
							<ProductSummaryRow
								key={option.id}
								item={option}
								actionLabel={copy.actionLabel}
								onSelect={onSelect}
								actions={rowActionsNode(
									renderOptionActions?.(option, { index, onSelect, onEdit, onDelete }),
									option,
									rowActions(copy.editLabel, copy.deleteLabel, onEdit, onDelete),
									copy.actionsLabel,
								)}
							/>
						)
					})}
				</ItemGroup>
			)}
			{footerSlot}
		</ContentBlock>
	)
}

export function ProductOverview({
	metricColumns = 3,
	title, description, metrics = [], media, status, statusTone = "neutral", actions,
	headerEnd: end, footerSlot, className, strings,
}: ProductOverviewProps) {
	const copy = { ...S.defaultProductOverviewStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			title={title ?? copy.title}
			description={description ?? copy.description}
			titleSuffix={status ? <Badge tone={statusTone}>{status}</Badge> : undefined}
			headerEnd={
				<>
					{end}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-overview--component", styles.card, className)}
		>
			{!!media && <div className={styles.media}>{media}</div>}
			{metrics.length > 0 && <MetadataList columns={metricColumns} items={metricFacts(metrics)} />}
			{footerSlot}
		</ContentBlock>
	)
}

export function ProductQuotePreviewCard({
	lines = [], summary, note, onRecalculate, actions, footerSlot, empty, className, strings,
}: ProductQuotePreviewCardProps) {
	const copy = { ...S.defaultProductQuotePreviewCardStrings, ...strings }

	const ordinary = lines.filter((line) => !line.emphasis)
	const totals = lines.filter((line) => line.emphasis)

	return (
		<ContentBlock
			surface="bordered"
			icon={<ReceiptIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={
				<>
					{!!onRecalculate && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onRecalculate}>
							<RotateCcwIcon />
							{copy.recalculateLabel}
						</Button>
					)}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-quote-card--component", styles.card, className)}
		>
			{lines.length === 0 ? (
				(empty ?? (
					<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
				))
			) : (
				<>
					{/* `MetadataList` rows layout: a real <dl>, label left, value right, sub-line under the label. */}
					<MetadataList
						layout="rows"
						columns={1}
						items={ordinary.map((line) => ({
							id: line.id,
							label: line.label,
							description: line.description,
							/* Through `render`: MetadataList has no tone, and the tone belongs on the value (contrast). */
							render: () => (
								<Value data-tone={line.tone ?? "neutral"} className={styles.quoteValue}>
									{line.value}
								</Value>
							),
						}))}
					/>

					{/* The total is ruled off, not tinted: a filled band reads as an alert. */}
					{totals.map((line) => (
						<div key={line.id} className={styles.quoteTotal}>
							<Separator />
							<div className={styles.quoteTotalRow}>
								<Text tag="span" weight="semibold">{line.label}</Text>
								<Value weight="semibold" className={styles.numeric}>{line.value}</Value>
							</div>
							{!!line.description && (
								<Text size="xs" type="secondary">{line.description}</Text>
							)}
						</div>
					))}
				</>
			)}

			{!!summary && <Text type="secondary">{summary}</Text>}
			{!!note && <Text size="xs" type="secondary">{note}</Text>}
			{footerSlot}
		</ContentBlock>
	)
}
