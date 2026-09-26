/**
 * The variant tables, and the manager that pairs them with the options matrix.
 *
 * `ProductVariantsTable` is a read-only summary; `ProductVariantsBulkTable` selects, groups
 * and edits SKU, price and stock in place. Each surface owns its copy, so
 * `ProductVariantActionMenu` is used directly. An editable cell holds its own text and
 * reports on change and on blur; the consumer picks which to act on.
 */
import {
	BoxesIcon, ChevronDownIcon, CopyIcon, PencilIcon, PlusIcon, SparklesIcon, Trash2Icon,
} from "lucide-react"
import { Fragment, useMemo, useState, type ReactNode } from "react"

import { ActionMenu } from "@/components/base/action-menu"
import { Badge } from "@/components/base/badge"
import { BatchActionBar } from "@/components/base/batch-action-bar"
import { Button } from "@/components/base/buttons"
import { Checkbox } from "@/components/base/choice-inputs"
import { ContentBlock } from "@/components/base/display"
import { Input } from "@/components/base/text-inputs"
import { Select } from "@/components/base/choice-inputs"
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/base/table"
import { Text } from "@/components/base/typography"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { ProductEmptyState, ProductRowActions, ProductThumbnail } from "./product-parts"
import * as S from "./products.strings"
import { PRODUCT_EMPTY_VALUE } from "./products.strings"
import type {
	ProductVariantActionMenuProps, ProductVariantCellDisplay, ProductVariantEditableField,
	ProductVariantRow, ProductVariantsBulkTableColumn,
	ProductVariantsBulkTableProps, ProductVariantsManagerProps, ProductVariantsTableProps,
} from "./products.types"
import { ProductOptionsMatrix } from "./product-options-matrix"
import styles from "./products.module.css"
import { useSyncedState } from "@/hooks/use-synced-state"

const DEFAULT_COLUMNS: readonly ProductVariantsBulkTableColumn[] = [
	"variant", "sku", "price", "inventory", "status",
]

const EDITABLE: Record<ProductVariantsBulkTableColumn, ProductVariantEditableField | null> = {
	variant: null,
	sku: "sku",
	price: "price",
	inventory: "inventory",
	status: null,
	updated: null,
}

function text(value: ReactNode): string {
	return typeof value === "string" || typeof value === "number" ? String(value) : ""
}

/**
 * The group's price as one line: the shared value, or the two ends of the spread, ordered
 * numerically by the digits in the formatted text (not alphabetically).
 */
function summariseRange(values: readonly ReactNode[]): ReactNode {
	const shown = values.map(text).filter(Boolean)
	if (shown.length === 0) return PRODUCT_EMPTY_VALUE

	const unique = [...new Set(shown)]
	if (unique.length === 1) return unique[0]

	const numeric = (value: string) => Number(value.replace(/[^0-9.-]/g, ""))
	if (unique.every((value) => Number.isFinite(numeric(value)))) {
		const sorted = [...unique].sort((left, right) => numeric(left) - numeric(right))
		return `${sorted[0]} – ${sorted[sorted.length - 1]}`
	}
	return `${unique[0]} – ${unique[unique.length - 1]}`
}

/** Stock totals when every row is a number, and says nothing when one is not. */
function summariseTotal(values: readonly ReactNode[]): ReactNode {
	const shown = values.map(text).filter(Boolean)
	if (shown.length === 0) return PRODUCT_EMPTY_VALUE

	const numbers = shown.map((value) => Number(value.replace(/[^0-9.-]/g, "")))
	if (!numbers.every(Number.isFinite)) return PRODUCT_EMPTY_VALUE
	return String(numbers.reduce((sum, value) => sum + value, 0))
}

export function ProductVariantActionMenu({
	variant,
	index = 0,
	onSelectVariant,
	onEditVariant,
	onDuplicateVariant,
	onDeleteVariant,
	renderVariantActions,
	menuLabel,
	className,
	strings,
}: ProductVariantActionMenuProps) {
	const copy = { ...S.defaultProductVariantActionMenuStrings, ...strings }

	const onSelect = onSelectVariant ? () => onSelectVariant(variant) : undefined
	const onEdit = onEditVariant ? () => onEditVariant(variant) : undefined
	const onDuplicate = onDuplicateVariant ? () => onDuplicateVariant(variant) : undefined
	const onDelete = onDeleteVariant ? () => onDeleteVariant(variant) : undefined

	const custom = renderVariantActions?.(variant, { index, onSelect, onEdit, onDuplicate, onDelete })
	if (custom) return <>{custom}</>

	const actions = [
		...(onSelect ? [{ id: "open", label: copy.openLabel, onClick: onSelect }] : []),
		...(onEdit ? [{ id: "edit", label: copy.editLabel, icon: <PencilIcon />, onClick: onEdit }] : []),
		...(onDuplicate
			? [{ id: "duplicate", label: copy.duplicateLabel, icon: <CopyIcon />, onClick: onDuplicate }]
			: []),
		...(onDelete
			? [{ id: "delete", label: copy.deleteLabel, icon: <Trash2Icon />, tone: "destructive" as const, onClick: onDelete }]
			: []),
	]

	if (actions.length === 0) return null

	return (
		<ProductRowActions
			item={variant}
			actions={actions}
			menuLabel={menuLabel ?? copy.menuLabel}
			className={className}
		/>
	)
}

export function ProductVariantsTable({
	variants = [], onCreateVariant, onSelectVariant, onEditVariant, onDuplicateVariant,
	onDeleteVariant, renderVariantActions, actions, footerSlot, empty, className, strings,
}: ProductVariantsTableProps) {
	const copy = { ...S.defaultProductVariantsTableStrings, ...strings }

	return (
		<ContentBlock
			surface="bordered"
			icon={<BoxesIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={
				<>
					{!!onCreateVariant && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onCreateVariant}>
							<PlusIcon />
							{copy.createLabel}
						</Button>
					)}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-variants-table--component", styles.card, className)}
		>
			{variants.length === 0 ? (
				(empty ?? (
					<ProductEmptyState title={copy.emptyTitle} description={copy.emptyDescription} />
				))
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{copy.columns.variant}</TableHead>
							<TableHead>{copy.columns.sku}</TableHead>
							<TableHead align="end">{copy.columns.price}</TableHead>
							<TableHead align="end">{copy.columns.inventory}</TableHead>
							<TableHead>{copy.columns.status}</TableHead>
							<TableHead align="end">
								{/* Hidden text, not an `aria-label`: a header with no content is announced as empty. */}
								<VisuallyHidden>{copy.columns.actions}</VisuallyHidden>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{variants.map((variant, index) => (
							<TableRow key={variant.id}>
								<TableCell>
									<span className={styles.variantCell}>
										<Text tag="span" weight="medium">{variant.name}</Text>
										{!!variant.options?.length && (
											<span className={styles.variantOptions}>
												{variant.options.map((option, optionIndex) => (
													<Badge key={optionIndex} tone="neutral">{option}</Badge>
												))}
											</span>
										)}
									</span>
								</TableCell>
								<TableCell>{variant.sku ?? S.PRODUCT_EMPTY_VALUE}</TableCell>
								<TableCell align="end">{variant.price ?? S.PRODUCT_EMPTY_VALUE}</TableCell>
								<TableCell align="end">{variant.inventory ?? S.PRODUCT_EMPTY_VALUE}</TableCell>
								<TableCell>
									{variant.status ? (
										<Badge tone={variant.statusTone ?? "neutral"}>{variant.status}</Badge>
									) : (
										S.PRODUCT_EMPTY_VALUE
									)}
								</TableCell>
								<TableCell align="end">
									<ProductVariantActionMenu
										variant={variant}
										index={index}
										onSelectVariant={onSelectVariant}
										onEditVariant={onEditVariant}
										onDuplicateVariant={onDuplicateVariant}
										onDeleteVariant={onDeleteVariant}
										renderVariantActions={renderVariantActions}
									/>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
			{footerSlot}
		</ContentBlock>
	)
}

/** One editable cell. Holds its own text; reports on change and on blur. */
function VariantFieldCell({
	value,
	field,
	align,
	label,
	onValueChange,
	onBlur,
}: {
	value: ReactNode
	field: ProductVariantEditableField
	align: "start" | "end"
	label: string
	onValueChange?: (value: string) => void
	onBlur?: (value: string) => void
}) {
	/* Re-seeded when the value changes from outside, compared on the formatted string so typing never echoes. */
	const [draft, setDraft] = useSyncedState(text(value))

	return (
		<span data-field={field} data-align={align} className={styles.variantFieldCell}>
			<Input
				value={draft}
				aria-label={label}
				onChange={(event) => {
					setDraft(event.target.value)
					onValueChange?.(event.target.value)
				}}
				onBlur={() => onBlur?.(draft)}
				className={styles.variantField}
			/>
		</span>
	)
}

export function ProductVariantsBulkTable({
	variants = [],
	optionGroups = [],
	groupByOptionId = null,
	visibleColumns = DEFAULT_COLUMNS,
	optionCombinationDisplay = "tags",
	cellDisplay = "text",
	selectionMode = "multiple",
	renderOptionCombination,
	selectedVariantIds,
	defaultSelectedVariantIds,
	onSelectedVariantIdsChange,
	onVariantFieldChange,
	onVariantFieldBlur,
	onCreateVariant,
	onGenerateVariants,
	onSelectVariant,
	onEditVariant,
	onDuplicateVariant,
	onDeleteVariant,
	onSetVariantImage,
	onBulkEdit,
	onBulkDelete,
	renderVariantActions,
	renderBulkActions,
	actions,
	headerEnd,
	footerSlot,
	empty,
	surface = "card",
	className,
	strings,
}: ProductVariantsBulkTableProps) {
	const copy = { ...S.defaultProductVariantBulkTableStrings, ...strings }

	const [internalSelected, setInternalSelected] = useState<string[]>(
		() => defaultSelectedVariantIds ?? [],
	)
	/* Stores the expanded groups, so the initial state opens on summary rows only. */
	const [expandedGroups, setExpandedGroups] = useState<string[]>([])
	const selected = selectedVariantIds ?? internalSelected
	const selectedSet = useMemo(() => new Set(selected), [selected])

	const applySelection = (next: string[]) => {
		if (selectedVariantIds === undefined) setInternalSelected(next)
		const nextSet = new Set(next)
		onSelectedVariantIdsChange?.(next, variants.filter((variant) => nextSet.has(variant.id)))
	}

	const displayFor = (field: ProductVariantEditableField): ProductVariantCellDisplay =>
		typeof cellDisplay === "string" ? cellDisplay : (cellDisplay[field] ?? "text")

	/* Grouped by an option's value, in the order that option declares its values. */
	const groups = useMemo(() => {
		if (!groupByOptionId) return [{ key: "", option: "", value: "", rows: variants }]

		const option = optionGroups.find((entry) => entry.id === groupByOptionId)
		const byValue = new Map<string, ProductVariantRow[]>()
		const ungrouped: ProductVariantRow[] = []

		for (const variant of variants) {
			const valueId = variant.optionValueIds?.[groupByOptionId]
			if (!valueId) {
				ungrouped.push(variant)
				continue
			}
			const bucket = byValue.get(valueId)
			if (bucket) bucket.push(variant)
			else byValue.set(valueId, [variant])
		}

		const ordered = (option?.values ?? [])
			.filter((value) => byValue.has(value.id))
			.map((value) => ({
				key: value.id,
				option: text(option?.name),
				value: text(value.label),
				rows: byValue.get(value.id) ?? [],
			}))

		return ungrouped.length > 0
			? [...ordered, { key: "__ungrouped", option: "", value: "", rows: ungrouped }]
			: ordered
	}, [groupByOptionId, optionGroups, variants])

	/*
	 * The default empty state already renders "Generate variants", so the header button
	 * steps aside; a custom empty body keeps it, as it may carry no trigger.
	 */
	const emptyStateOwnsGenerate = variants.length === 0 && !empty

	const allSelected = variants.length > 0 && selected.length === variants.length

	/* The shared base/ BatchActionBar, so selection bars match across features. */
	const bulkBar = selectionMode === "multiple" && selected.length > 0 && (
		<BatchActionBar
			placement="inline"
			className={styles.bulkBar}
			selectedCount={selected.length}
			totalCount={variants.length}
			onClear={() => applySelection([])}
			strings={{
				summary: (count, total) => copy.selectedCount(count, total ?? variants.length),
				clear: copy.clearSelection,
			}}
		>
			{renderBulkActions?.({
				selectedRows: variants.filter((variant) => selectedSet.has(variant.id)),
				selectedIds: selected,
				allRows: variants,
				selectedCount: selected.length,
				totalCount: variants.length,
				allRowsSelected: allSelected,
				clearSelection: () => applySelection([]),
				setSelectedIds: applySelection,
			}) ?? (
				<>
					{!!onBulkEdit && (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="outline"
							onClick={() => onBulkEdit(variants.filter((variant) => selectedSet.has(variant.id)))}
						>
							{copy.bulkEditLabel}
						</Button>
					)}
					{!!onBulkDelete && (
						<Button
							type="button"
							tone="destructive"
							buttonStyle="outline"
							onClick={() => onBulkDelete(variants.filter((variant) => selectedSet.has(variant.id)))}
						>
							{copy.bulkDeleteLabel}
						</Button>
					)}
				</>
			)}
		</BatchActionBar>
	)

	const body =
		variants.length === 0 ? (
			(empty ?? (
				<ProductEmptyState
					title={copy.emptyTitle}
					description={copy.emptyDescription}
					action={
						onGenerateVariants ? (
							<Button type="button" onClick={onGenerateVariants}>
								<SparklesIcon />
								{copy.generateLabel}
							</Button>
						) : undefined
					}
				/>
			))
		) : (
			<>
				{bulkBar}
				<Table>
					<TableHeader>
						<TableRow>
							{selectionMode === "multiple" && (
								<TableHead className={styles.selectCell}>
									<Checkbox
										checked={allSelected}
										indeterminate={selected.length > 0 && !allSelected}
										onChange={(event) =>
											applySelection(
												event.target.checked ? variants.map((variant) => variant.id) : [],
											)
										}
										aria-label={copy.selectAllLabel}
									/>
								</TableHead>
							)}
							{visibleColumns.map((column) => (
								<TableHead
									key={column}
									align={column === "price" || column === "inventory" ? "end" : "start"}
								>
									{copy.columns[column === "updated" ? "updated" : column]}
								</TableHead>
							))}
							<TableHead align="end">
								{/* Hidden text, not an `aria-label`: a header with no content is announced as empty. */}
								<VisuallyHidden>{copy.columns.actions}</VisuallyHidden>
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{groups.map((group) => {
							const groupIds = group.rows.map((variant) => variant.id)
							const groupSelected = groupIds.every((id) => selectedSet.has(id))
							/* Ungrouped rows sit in one synthetic group, which is always open. */
							const open = !groupByOptionId || expandedGroups.includes(group.key)

							return (
							<Fragment key={group.key}>
								{/* A summary row (count, price range, stock), readable while the group is shut. */}
								{!!groupByOptionId && (
									<TableRow className={styles.groupRow}>
										{selectionMode === "multiple" && (
											<TableCell className={styles.selectCell}>
												<Checkbox
													checked={groupSelected}
													indeterminate={!groupSelected && groupIds.some((id) => selectedSet.has(id))}
													aria-label={copy.selectGroupLabel(
														group.key === "__ungrouped"
															? String(copy.ungrouped)
															: copy.groupLabel(group.option, group.value),
													)}
													onChange={(event) =>
														applySelection(
															event.target.checked
																? [...new Set([...selected, ...groupIds])]
																: selected.filter((id) => !groupIds.includes(id)),
														)
													}
												/>
											</TableCell>
										)}
										{visibleColumns.map((column) => {
											if (column === "variant") {
												/* The group borrows its first variant's picture. */
												const cover = group.rows.find((row) => row.image || row.media)

												return (
													<TableCell key={column}>
														<span className={styles.variantHead}>
															<ProductThumbnail
																src={cover?.image}
																alt={cover?.imageAlt}
																media={cover?.media}
															/>
															<span className={styles.variantCell}>
																<Text tag="span" weight="semibold">
																	{group.key === "__ungrouped"
																		? copy.ungrouped
																		: copy.groupLabel(group.option, group.value)}
																</Text>
																<Text tag="span" size="xs" type="secondary">
																	{copy.groupCount(group.rows.length)}
																</Text>
															</span>
														</span>
													</TableCell>
												)
											}
											if (column === "price" || column === "inventory") {
												return (
													<TableCell key={column} align="end">
														<Text tag="span" weight="medium" className={styles.numeric}>
															{column === "price"
																? summariseRange(group.rows.map((row) => row.price))
																: summariseTotal(group.rows.map((row) => row.inventory))}
														</Text>
													</TableCell>
												)
											}
											return <TableCell key={column} />
										})}
										<TableCell align="end">
											<Button
												type="button"
												tone="neutral"
												buttonStyle="ghost"
												iconOnly
												aria-expanded={open}
												aria-label={open ? copy.collapseGroup : copy.expandGroup}
												onClick={() =>
													setExpandedGroups((current) =>
														open
															? current.filter((key) => key !== group.key)
															: [...current, group.key],
													)
												}
											>
												<ChevronDownIcon data-expanded={open || undefined} className={styles.groupChevron} />
											</Button>
										</TableCell>
									</TableRow>
								)}

								{open && group.rows.map((variant, index) => {
									const isSelected = selectedSet.has(variant.id)

									return (
										<TableRow
											key={variant.id}
											data-state={isSelected ? "selected" : undefined}
											data-nested={groupByOptionId ? true : undefined}
											className={styles.variantRow}
										>
											{selectionMode === "multiple" && (
												<TableCell className={styles.selectCell}>
													<Checkbox
														checked={isSelected}
														onChange={(event) =>
															applySelection(
																event.target.checked
																	? [...selected, variant.id]
																	: selected.filter((id) => id !== variant.id),
															)
														}
														aria-label={copy.selectRowLabel(text(variant.name))}
													/>
												</TableCell>
											)}

											{visibleColumns.map((column) => {
												if (column === "variant") {
													/* Grouped, a row shows only the other options' values; the group heading says the rest. */
													const rest = optionGroups.filter((option) => option.id !== groupByOptionId)
													const values = rest
														.map((option) => variant.optionValues?.[option.id])
														.filter(Boolean) as ReactNode[]
													const label =
														groupByOptionId && values.length > 0
															? values.map(text).join(" · ")
															: variant.name

													return (
														<TableCell key={column}>
															<span className={styles.variantHead}>
																<ProductThumbnail
																	src={variant.image}
																	alt={variant.imageAlt}
																	media={variant.media}
																	label={
																		onSetVariantImage
																			? copy.setImageLabel(text(variant.name))
																			: undefined
																	}
																	onSelect={
																		onSetVariantImage ? () => onSetVariantImage(variant) : undefined
																	}
																/>
																<span className={styles.variantCell}>
																<Text tag="span" weight="medium">{label}</Text>
																{renderOptionCombination?.(variant, values) ??
																	(optionCombinationDisplay === "tags" && !groupByOptionId && values.length > 0 ? (
																		<span className={styles.variantOptions}>
																			{values.map((value, valueIndex) => (
																				<Badge key={valueIndex} tone="neutral">{value}</Badge>
																			))}
																		</span>
																	) : optionCombinationDisplay === "text" && !groupByOptionId && values.length > 0 ? (
																		<Text tag="span" size="xs" type="secondary">
																			{values.map(text).join(" · ")}
																		</Text>
																	) : null)}
																</span>
															</span>
														</TableCell>
													)
												}

												if (column === "status") {
													return (
														<TableCell key={column}>
															{variant.status ? (
																<Badge tone={variant.statusTone ?? "neutral"}>{variant.status}</Badge>
															) : (
																S.PRODUCT_EMPTY_VALUE
															)}
														</TableCell>
													)
												}

												if (column === "updated") {
													return (
														<TableCell key={column}>
															{variant.updatedAt ?? S.PRODUCT_EMPTY_VALUE}
														</TableCell>
													)
												}

												const field = EDITABLE[column]
												const value = field ? variant[field] : undefined
												const align = column === "price" || column === "inventory" ? "end" : "start"

												if (field && displayFor(field) === "field") {
													return (
														<TableCell key={column} align={align}>
															<VariantFieldCell
																value={value}
																field={field}
																align={align}
																label={`${copy.columns[column]}: ${text(variant.name)}`}
																onValueChange={(next) =>
																	onVariantFieldChange?.(variant, field, next, {
																		index, field, previousValue: value, value: next,
																	})
																}
																onBlur={(next) =>
																	onVariantFieldBlur?.(variant, field, next, {
																		index, field, previousValue: value, value: next,
																	})
																}
															/>
														</TableCell>
													)
												}

												return (
													<TableCell key={column} align={align}>
														{value ?? S.PRODUCT_EMPTY_VALUE}
													</TableCell>
												)
											})}

											<TableCell align="end">
												<ProductVariantActionMenu
													variant={variant}
													index={index}
													onSelectVariant={onSelectVariant}
													onEditVariant={onEditVariant}
													onDuplicateVariant={onDuplicateVariant}
													onDeleteVariant={onDeleteVariant}
													renderVariantActions={renderVariantActions}
												/>
											</TableCell>
										</TableRow>
									)
								})}
							</Fragment>
							)
						})}
					</TableBody>
				</Table>
			</>
		)

	if (surface === "embedded") {
		return (
			<div className={cx("product-variants-bulk-table--component", styles.variants, className)}>
				{body}
				{footerSlot}
			</div>
		)
	}

	return (
		<ContentBlock
			surface="bordered"
			icon={<BoxesIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={
				<>
					{headerEnd}
					{!!onGenerateVariants && !emptyStateOwnsGenerate && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onGenerateVariants}>
							<SparklesIcon />
							{copy.generateLabel}
						</Button>
					)}
					{!!onCreateVariant && (
						<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onCreateVariant}>
							<PlusIcon />
							{copy.createLabel}
						</Button>
					)}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-variants-bulk-table--component", styles.card, className)}
		>
			{body}
			{footerSlot}
		</ContentBlock>
	)
}

/**
 * The options and the variants they generate, in one card: the variant grid is a
 * consequence of the options above it. The grouping control sits between the two halves
 * because it is a question about the options that changes the grid.
 */
export function ProductVariantsManager({
	className,
	strings,
	optionsStrings,
	variantsStrings,
	optionGroups = [],
	editingOptionId,
	defaultEditingOptionId,
	onEditingOptionIdChange,
	onCreateOption,
	onEditOption,
	onDeleteOption,
	onAddValue,
	onDeleteValue,
	onOptionNameChange,
	onValueLabelChange,
	onSaveEditingOption,
	onCancelEditingOption,
	onToggleUsedForVariants,
	onReorderOptions,
	confirmDelete,
	groupByOptionId: groupByProp,
	defaultGroupByOptionId = null,
	onGroupByOptionIdChange,
	showGroupBy = true,
	...variantProps
}: ProductVariantsManagerProps) {
	const copy = { ...S.defaultProductVariantsManagerStrings, ...strings }
	const variantsCopy = { ...S.defaultProductVariantBulkTableStrings, ...variantsStrings }

	const [internalGroupBy, setInternalGroupBy] = useState<string | null>(defaultGroupByOptionId)
	const groupByOptionId = groupByProp !== undefined ? groupByProp : internalGroupBy

	const setGroupBy = (next: string | null) => {
		if (groupByProp === undefined) setInternalGroupBy(next)
		onGroupByOptionIdChange?.(next)
	}

	/* Only an option that actually generates variants can group them. */
	const groupable = optionGroups.filter((option) => option.usedForVariants ?? true)

	return (
		<section className={cx("product-variants-manager--component", styles.manager, className)}>
			<header className={styles.managerHead}>
				<span className={styles.managerTitle}>
					<BoxesIcon aria-hidden />
					<Text tag="span" weight="semibold">{copy.title}</Text>
				</span>
				<div className={styles.managerActions}>
					{!!variantProps.onGenerateVariants && (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							onClick={variantProps.onGenerateVariants}
						>
							<SparklesIcon />
							{variantsCopy.generateLabel}
						</Button>
					)}
					{!!variantProps.onCreateVariant && (
						<Button
							type="button"
							tone="neutral"
							buttonStyle="ghost"
							onClick={variantProps.onCreateVariant}
						>
							<PlusIcon />
							{variantsCopy.createLabel}
						</Button>
					)}
				</div>
			</header>

			<div className={styles.managerOptions}>
				<ProductOptionsMatrix
					surface="embedded"
					optionGroups={optionGroups}
					editingOptionId={editingOptionId}
					defaultEditingOptionId={defaultEditingOptionId}
					onEditingOptionIdChange={onEditingOptionIdChange}
					onCreateOption={onCreateOption}
					onEditOption={onEditOption}
					onDeleteOption={onDeleteOption}
					onAddValue={onAddValue}
					onDeleteValue={onDeleteValue}
					onOptionNameChange={onOptionNameChange}
					onValueLabelChange={onValueLabelChange}
					onSaveEditingOption={onSaveEditingOption}
					onCancelEditingOption={onCancelEditingOption}
					onToggleUsedForVariants={onToggleUsedForVariants}
					onReorderOptions={onReorderOptions}
					confirmDelete={confirmDelete}
					strings={optionsStrings}
				/>
			</div>

			{showGroupBy && groupable.length > 1 && (
				<div className={styles.managerToolbar}>
					<Text tag="span" type="secondary">{copy.groupByLabel}</Text>
					<Select
						aria-label={copy.groupByLabel}
						value={groupByOptionId}
						allowClear
						strings={{ clear: copy.groupByNone }}
						options={groupable.map((option) => ({
							value: option.id,
							label: typeof option.name === "string" ? option.name : option.id,
						}))}
						onValueChange={(next) => setGroupBy(next ?? null)}
						className={styles.managerGroupBy}
					/>
				</div>
			)}

			<ProductVariantsBulkTable
				{...variantProps}
				surface="embedded"
				optionGroups={optionGroups}
				groupByOptionId={groupByOptionId}
				strings={variantsStrings}
			/>
		</section>
	)
}
