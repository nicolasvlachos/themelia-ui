/**
 * Products: the surfaces a catalogue editor is built from.
 *
 * Values (price, stock, SKU) are ReactNodes: the app formats them in its own currency and
 * locale; these surfaces only arrange them. Each verb has its own `onXxx` handler, and
 * omitting one hides its control.
 */
import type { ReactNode } from "react"

import type { ActionDefinition } from "@/components/base/action-menu"
import type { BadgeTone } from "@/components/base/badge"
import type { MetadataColumns, MetadataListItem } from "@/components/base/display"
import type { SemanticTone } from "@/lib/component-vocabulary"

import type * as Strings from "./products.strings"

/** No `secondary`: it means "not this one" rather than a state a product can be in. */
export type ProductTone = Exclude<SemanticTone, "secondary">

/** `card` frames the surface; `embedded` renders it bare inside one that already exists. */
export type ProductSurface = "card" | "embedded"

/* ── Readiness ────────────────────────────────────────────────────────────────────── */

export interface ProductReadinessItem {
	id: string
	label: ReactNode
	description?: ReactNode
	value?: ReactNode
	tone?: ProductTone
	completed?: boolean
	actionLabel?: ReactNode
	onSelect?: () => void
}

export interface ProductRowActionContext {
	index: number
	onSelect?: () => void
	onEdit?: () => void
	onDelete?: () => void
}

export interface ProductReadinessCardProps {
	items?: ProductReadinessItem[]
	/** 0–100, clamped. */
	score?: number
	scoreLabel?: ReactNode
	summary?: ReactNode
	onCreateReadinessItem?: () => void
	onSelectReadinessItem?: (item: ProductReadinessItem) => void
	onEditReadinessItem?: (item: ProductReadinessItem) => void
	onDeleteReadinessItem?: (item: ProductReadinessItem) => void
	renderReadinessItemActions?: (
		item: ProductReadinessItem,
		context: ProductRowActionContext,
	) => ReactNode
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	renderItem?: (item: ProductReadinessItem, index: number) => ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductReadinessCardStrings>
}

/* ── Structure ────────────────────────────────────────────────────────────────────── */

export interface ProductStructureMetric {
	id: string
	label: ReactNode
	value: ReactNode
	description?: ReactNode
	tone?: ProductTone
	icon?: ReactNode
}

export interface ProductStructureCardProps {
	metrics?: ProductStructureMetric[]
	onCreateMetric?: () => void
	onSelectMetric?: (metric: ProductStructureMetric) => void
	onEditMetric?: (metric: ProductStructureMetric) => void
	onDeleteMetric?: (metric: ProductStructureMetric) => void
	renderMetricActions?: (
		metric: ProductStructureMetric,
		context: ProductRowActionContext,
	) => ReactNode
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductStructureCardStrings>
}

/* ── Operations ───────────────────────────────────────────────────────────────────── */

export interface ProductOperationsItem {
	id: string
	label: ReactNode
	description?: ReactNode
	value?: ReactNode
	tone?: ProductTone
	actionLabel?: ReactNode
	onSelect?: () => void
}

export interface ProductOperationsCardProps {
	items?: ProductOperationsItem[]
	onCreateOperation?: () => void
	onSelectOperation?: (item: ProductOperationsItem) => void
	onEditOperation?: (item: ProductOperationsItem) => void
	onDeleteOperation?: (item: ProductOperationsItem) => void
	renderOperationActions?: (
		item: ProductOperationsItem,
		context: ProductRowActionContext,
	) => ReactNode
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	renderItem?: (item: ProductOperationsItem, index: number) => ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductOperationsCardStrings>
}

/* ── Details ──────────────────────────────────────────────────────────────────────── */

export interface ProductDetailsCardProps {
	title?: ReactNode
	/** `false` suppresses the default description rather than showing it empty. */
	description?: ReactNode | false
	metadata?: MetadataListItem[]
	media?: ReactNode
	onEditDetails?: () => void
	actions?: ActionDefinition[]
	headerEnd?: ReactNode
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductDetailsCardStrings>
}

/* ── Contract & policies ──────────────────────────────────────────────────────────── */

export interface ProductMetricSummary {
	id: string
	label: ReactNode
	value: ReactNode
	description?: ReactNode
	tone?: ProductTone
}

export interface ProductPolicySummary {
	id: string
	label: ReactNode
	description?: ReactNode
	value?: ReactNode
	tone?: ProductTone
	badge?: ReactNode
}

export interface ProductContractOverviewProps {
	metrics?: ProductMetricSummary[]
	terms?: MetadataListItem[]
	rules?: ProductPolicySummary[]
	onOpenContract?: () => void
	onEditContract?: () => void
	onCreateRule?: () => void
	onSelectRule?: (rule: ProductPolicySummary) => void
	onEditRule?: (rule: ProductPolicySummary) => void
	onDeleteRule?: (rule: ProductPolicySummary) => void
	renderRuleActions?: (rule: ProductPolicySummary, context: ProductRowActionContext) => ReactNode
	/** How wide the metric row is allowed to get. Drop it for a card in a rail. */
	metricColumns?: MetadataColumns
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductContractOverviewStrings>
}

export interface ProductPoliciesCardProps {
	policies?: ProductPolicySummary[]
	onCreatePolicy?: () => void
	onSelectPolicy?: (policy: ProductPolicySummary) => void
	onEditPolicy?: (policy: ProductPolicySummary) => void
	onDeletePolicy?: (policy: ProductPolicySummary) => void
	renderPolicyActions?: (
		policy: ProductPolicySummary,
		context: ProductRowActionContext,
	) => ReactNode
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductPoliciesCardStrings>
}

/* ── Options ──────────────────────────────────────────────────────────────────────── */

export interface ProductOptionSummary {
	id: string
	label: ReactNode
	description?: ReactNode
	values?: readonly ReactNode[]
	value?: ReactNode
	tone?: ProductTone
	badge?: ReactNode
}

export interface ProductOptionsSummaryProps {
	options?: ProductOptionSummary[]
	onManageOptions?: () => void
	onCreateOption?: () => void
	onSelectOption?: (option: ProductOptionSummary) => void
	onEditOption?: (option: ProductOptionSummary) => void
	onDeleteOption?: (option: ProductOptionSummary) => void
	renderOptionActions?: (
		option: ProductOptionSummary,
		context: ProductRowActionContext,
	) => ReactNode
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductOptionsSummaryStrings>
}

export interface ProductOptionValue {
	id: string
	label: ReactNode
	description?: ReactNode
	disabled?: boolean
	badge?: ReactNode
}

export interface ProductOptionGroup {
	id: string
	name: ReactNode
	description?: ReactNode
	values?: readonly ProductOptionValue[]
	/** Whether this option takes part in generating variants. */
	usedForVariants?: boolean
	position?: number
	badge?: ReactNode
}

export interface ProductOptionEditDraft {
	name: string
	values: ProductOptionValue[]
}

export interface ProductOptionsMatrixProps {
	optionGroups?: ProductOptionGroup[]
	surface?: ProductSurface
	editingOptionId?: string | null
	defaultEditingOptionId?: string | null
	onEditingOptionIdChange?: (optionId: string | null, option?: ProductOptionGroup) => void
	onCreateOption?: () => void
	onEditOption?: (option: ProductOptionGroup) => void
	onDeleteOption?: (option: ProductOptionGroup) => void
	/** Off when the app already confirms, so nobody is asked twice. */
	confirmDelete?: boolean
	onAddValue?: (option: ProductOptionGroup) => void
	onDeleteValue?: (option: ProductOptionGroup, value: ProductOptionValue) => void
	onOptionNameChange?: (option: ProductOptionGroup, value: string) => void
	onValueLabelChange?: (
		option: ProductOptionGroup,
		value: ProductOptionValue,
		label: string,
	) => void
	onSaveEditingOption?: (option: ProductOptionGroup, draft: ProductOptionEditDraft) => void
	onCancelEditingOption?: (option: ProductOptionGroup, draft: ProductOptionEditDraft) => void
	onToggleUsedForVariants?: (option: ProductOptionGroup, used: boolean) => void
	/** Enables the grip. Without it the list keeps its order and shows no handle. */
	onReorderOptions?: (options: ProductOptionGroup[]) => void
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductOptionsMatrixStrings>
}

/* ── Variants ─────────────────────────────────────────────────────────────────────── */

export interface ProductVariantSummary {
	id: string
	name: ReactNode
	/** The variant's picture. Absent draws the empty slot. */
	image?: string
	imageAlt?: string
	/** Replaces the image entirely: a swatch, a video still, a monogram. */
	media?: ReactNode
	description?: ReactNode
	options?: readonly ReactNode[]
	sku?: ReactNode
	price?: ReactNode
	inventory?: ReactNode
	channels?: ReactNode
	updatedAt?: ReactNode
	status?: ReactNode
	statusTone?: BadgeTone
}

export interface ProductVariantRow extends ProductVariantSummary {
	/** Rendered value per option group id, shown in the combination column. */
	optionValues?: Record<string, ReactNode>
	/** The chosen value's id per option group, for grouping rows by an option. */
	optionValueIds?: Record<string, string | undefined>
}

export interface ProductVariantActionContext extends ProductRowActionContext {
	onDuplicate?: () => void
	isSelected?: boolean
	onToggleSelected?: (checked: boolean) => void
}

export interface ProductVariantActionMenuProps {
	variant: ProductVariantSummary
	index?: number
	onSelectVariant?: (variant: ProductVariantSummary) => void
	onEditVariant?: (variant: ProductVariantSummary) => void
	onDuplicateVariant?: (variant: ProductVariantSummary) => void
	onDeleteVariant?: (variant: ProductVariantSummary) => void
	renderVariantActions?: (
		variant: ProductVariantSummary,
		context: ProductVariantActionContext,
	) => ReactNode
	menuLabel?: string
	className?: string
	strings?: Partial<Strings.ProductVariantActionMenuStrings>
}

export interface ProductVariantsTableProps {
	variants?: ProductVariantSummary[]
	onCreateVariant?: () => void
	onSelectVariant?: (variant: ProductVariantSummary) => void
	onEditVariant?: (variant: ProductVariantSummary) => void
	onDuplicateVariant?: (variant: ProductVariantSummary) => void
	onDeleteVariant?: (variant: ProductVariantSummary) => void
	renderVariantActions?: (
		variant: ProductVariantSummary,
		context: ProductVariantActionContext,
	) => ReactNode
	/** Makes the picture slot pressable. Without it the slot is inert. */
	onSetVariantImage?: (variant: ProductVariantSummary) => void
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductVariantsTableStrings>
}

export type ProductVariantsBulkTableColumn =
	| "variant" | "sku" | "price" | "inventory" | "status" | "updated"

export type ProductVariantOptionCombinationDisplay = "text" | "tags" | "none"
export type ProductVariantEditableField = "sku" | "price" | "inventory"
/** `text` shows the value; `field` makes it editable in place. */
export type ProductVariantCellDisplay = "text" | "field"
export type ProductVariantCellDisplayConfig =
	| ProductVariantCellDisplay
	| Partial<Record<ProductVariantEditableField, ProductVariantCellDisplay>>
export type ProductVariantSelectionMode = "multiple" | "none"

export interface ProductVariantBulkActionContext {
	selectedRows: ProductVariantRow[]
	selectedIds: string[]
	allRows: ProductVariantRow[]
	selectedCount: number
	totalCount: number
	allRowsSelected: boolean
	clearSelection: () => void
	setSelectedIds: (variantIds: string[]) => void
}

export interface ProductVariantFieldChangeContext {
	index: number
	field: ProductVariantEditableField
	previousValue?: ReactNode
	value: string
}

export interface ProductVariantsBulkTableProps {
	variants?: ProductVariantRow[]
	optionGroups?: ProductOptionGroup[]
	/** Groups rows under the values of this option. `null` leaves the list flat. */
	groupByOptionId?: string | null
	visibleColumns?: readonly ProductVariantsBulkTableColumn[]
	optionCombinationDisplay?: ProductVariantOptionCombinationDisplay
	cellDisplay?: ProductVariantCellDisplayConfig
	selectionMode?: ProductVariantSelectionMode
	renderOptionCombination?: (variant: ProductVariantRow, values: ReactNode[]) => ReactNode
	selectedVariantIds?: string[]
	defaultSelectedVariantIds?: string[]
	onSelectedVariantIdsChange?: (variantIds: string[], variants: ProductVariantRow[]) => void
	onVariantFieldChange?: (
		variant: ProductVariantRow,
		field: ProductVariantEditableField,
		value: string,
		context: ProductVariantFieldChangeContext,
	) => void
	onVariantFieldBlur?: (
		variant: ProductVariantRow,
		field: ProductVariantEditableField,
		value: string,
		context: ProductVariantFieldChangeContext,
	) => void
	onCreateVariant?: () => void
	onGenerateVariants?: () => void
	onSelectVariant?: (variant: ProductVariantRow) => void
	onEditVariant?: (variant: ProductVariantRow) => void
	onDuplicateVariant?: (variant: ProductVariantRow) => void
	onDeleteVariant?: (variant: ProductVariantRow) => void
	onBulkEdit?: (variants: ProductVariantRow[]) => void
	onBulkDelete?: (variants: ProductVariantRow[]) => void
	renderVariantActions?: (
		variant: ProductVariantRow,
		context: ProductVariantActionContext,
	) => ReactNode
	renderBulkActions?: (context: ProductVariantBulkActionContext) => ReactNode
	/** Makes the picture slot pressable. Without it the slot is inert. */
	onSetVariantImage?: (variant: ProductVariantRow) => void
	actions?: ActionDefinition[]
	headerEnd?: ReactNode
	footerSlot?: ReactNode
	empty?: ReactNode
	surface?: ProductSurface
	className?: string
	strings?: Partial<Strings.ProductVariantBulkTableStrings>
}

export interface ProductVariantsManagerProps
	extends Pick<
			ProductOptionsMatrixProps,
			| "optionGroups" | "editingOptionId" | "defaultEditingOptionId"
			| "onEditingOptionIdChange" | "onCreateOption" | "onEditOption" | "onDeleteOption"
			| "onAddValue" | "onDeleteValue" | "onOptionNameChange" | "onValueLabelChange"
			| "onSaveEditingOption" | "onCancelEditingOption" | "onToggleUsedForVariants"
			| "onReorderOptions" | "confirmDelete"
		>,
		Pick<
			ProductVariantsBulkTableProps,
			| "variants" | "visibleColumns" | "optionCombinationDisplay"
			| "cellDisplay" | "selectionMode" | "selectedVariantIds" | "defaultSelectedVariantIds"
			| "onSelectedVariantIdsChange" | "onVariantFieldChange" | "onVariantFieldBlur"
			| "onCreateVariant" | "onGenerateVariants" | "onSelectVariant" | "onEditVariant"
			| "onDuplicateVariant" | "onDeleteVariant" | "onBulkEdit" | "onBulkDelete"
			| "renderVariantActions" | "renderBulkActions"
		> {
	/** Controlled grouping. Uncontrolled, the manager's own Select drives it. */
	groupByOptionId?: string | null
	defaultGroupByOptionId?: string | null
	onGroupByOptionIdChange?: (optionId: string | null) => void
	/** Hides the grouping control, for a surface that drives it from elsewhere. */
	showGroupBy?: boolean
	className?: string
	strings?: Partial<Strings.ProductVariantsManagerStrings>
	optionsStrings?: Partial<Strings.ProductOptionsMatrixStrings>
	variantsStrings?: Partial<Strings.ProductVariantBulkTableStrings>
}

export interface ProductOptionActionContext extends ProductRowActionContext {
	/** Present so the option and variant menus hand their render prop the same shape. */
	onDuplicate?: () => void
}

export interface ProductOptionActionMenuProps {
	option: ProductOptionSummary
	index?: number
	onSelectOption?: (option: ProductOptionSummary) => void
	onEditOption?: (option: ProductOptionSummary) => void
	onDeleteOption?: (option: ProductOptionSummary) => void
	renderOptionActions?: (
		option: ProductOptionSummary,
		context: ProductRowActionContext,
	) => ReactNode
	menuLabel?: string
	className?: string
	strings?: Partial<Strings.ProductOptionActionMenuStrings>
}

export interface ProductVariantDetailsProps {
	/** Absent renders the empty state (this surface is often bound to a selection). */
	variant?: ProductVariantSummary
	/** Replaces the derived facts. The default is built from the variant's own fields. */
	metadata?: MetadataListItem[]
	optionItems?: ProductOptionSummary[]
	media?: ReactNode
	onBack?: () => void
	onSelectVariant?: (variant: ProductVariantSummary) => void
	onEditVariant?: (variant: ProductVariantSummary) => void
	onDuplicateVariant?: (variant: ProductVariantSummary) => void
	onDeleteVariant?: (variant: ProductVariantSummary) => void
	onSelectOption?: (option: ProductOptionSummary) => void
	actions?: ActionDefinition[]
	headerEnd?: ReactNode
	footerSlot?: ReactNode
	empty?: ReactNode
	renderActions?: ProductVariantActionMenuProps["renderVariantActions"]
	renderMetadata?: (variant: ProductVariantSummary) => ReactNode
	renderOption?: (option: ProductOptionSummary, index: number) => ReactNode
	className?: string
	strings?: Partial<Strings.ProductVariantDetailsStrings>
}

export interface ProductChoice {
	value: string
	label: string
	description?: ReactNode
	disabled?: boolean
}

/** Every field is a string: this is a form, and a form's value is what was typed. */
export interface ProductVariantEditorValues {
	name?: string
	description?: string
	sku?: string
	price?: string
	inventory?: string
	status?: string
	channels?: string
	/** Keyed by option group id. */
	options?: Record<string, string | undefined>
}

export interface ProductVariantOptionField {
	id: string
	label: string
	/** Overrides the value held under this field's id. */
	value?: string
	/** With choices it is a select; without, a text field. */
	choices?: ProductChoice[]
	placeholder?: string
	helperText?: string
}

export interface ProductVariantEditorProps {
	value?: ProductVariantEditorValues
	defaultValue?: ProductVariantEditorValues
	optionFields?: ProductVariantOptionField[]
	statusOptions?: ProductChoice[]
	onValueChange?: (value: ProductVariantEditorValues) => void
	onSubmit?: (value: ProductVariantEditorValues) => void | Promise<void>
	/** Receives a rejected submit. Persistence and the message stay with the consumer. */
	onError?: (error: unknown) => void
	onCancel?: () => void
	onDelete?: (value: ProductVariantEditorValues) => void
	actions?: ActionDefinition[]
	headerEnd?: ReactNode
	footerSlot?: ReactNode
	disabled?: boolean
	/** Shows the pending state and blocks a repeat submit. */
	submitting?: boolean
	className?: string
	strings?: Partial<Strings.ProductVariantEditorStrings>
}

export interface ProductOverviewProps {
	title?: ReactNode
	description?: ReactNode
	metrics?: ProductMetricSummary[]
	media?: ReactNode
	status?: ReactNode
	statusTone?: BadgeTone
	/** How wide the metric row is allowed to get. Drop it for a card in a rail. */
	metricColumns?: MetadataColumns
	actions?: ActionDefinition[]
	headerEnd?: ReactNode
	footerSlot?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductOverviewStrings>
}

export interface ProductQuotePreviewLine {
	id: string
	label: ReactNode
	value: ReactNode
	description?: ReactNode
	tone?: ProductTone
	/** Ruled off and emphasised: the line the rest add up to. */
	emphasis?: boolean
}

export interface ProductQuotePreviewCardProps {
	lines?: ProductQuotePreviewLine[]
	summary?: ReactNode
	note?: ReactNode
	onRecalculate?: () => void
	actions?: ActionDefinition[]
	footerSlot?: ReactNode
	empty?: ReactNode
	className?: string
	strings?: Partial<Strings.ProductQuotePreviewCardStrings>
}
