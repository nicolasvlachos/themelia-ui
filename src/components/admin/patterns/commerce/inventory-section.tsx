/**
 * InventorySection: the inventory half of a product editor. Fully controlled and
 * stateless, and never validates: the consumer's form owns draft, lifecycle and rules.
 * `sections` narrows what is drawn; each change reports its previous value for undo.
 */
import { resolveStrings } from "@/lib/strings"
import type { ComponentProps } from "react"

import { Switch } from "@/components/base/choice-inputs"
import { ContentBlock, MetadataList } from "@/components/base/display"
import { FormField } from "@/components/base/forms"
import { Select } from "@/components/base/choice-inputs"
import { Input } from "@/components/base/text-inputs"
import { DisplayLabel, Text } from "@/components/base/typography"
import { TagsInput } from "@/components/base/value-inputs"
import { cx } from "@/lib/cx"

import { defaultInventorySectionStrings, type InventorySectionStrings } from "./commerce.strings"
import { SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/** What happens when stock runs out. */
export type InventoryPolicy = "deny" | "continue"

export interface InventorySectionValue {
	sku?: string
	barcode?: string
	/** Off means the other quantity fields have no meaning and are not drawn. */
	trackQuantity?: boolean
	available?: string
	committed?: string
	incoming?: string
	lowStockThreshold?: string
	inventoryPolicy?: InventoryPolicy
	binLocation?: string
	requiresShipping?: boolean
	weight?: string
	countryOfOrigin?: string
	hsCode?: string
	tags?: string[]
}

export type InventorySectionField = keyof InventorySectionValue

/** Which groups to draw. Omit for all of them. */
export type InventorySectionName = "summary" | "identity" | "tracking" | "location" | "shipping" | "customs" | "tags"

const ALL_SECTIONS: InventorySectionName[] = [
	"summary", "identity", "tracking", "location", "shipping", "customs", "tags",
]

export interface InventorySectionProps
	extends Omit<ComponentProps<typeof ContentBlock>, "children" | "onChange"> {
	value: InventorySectionValue
	/** Reports the field, its new value, and what it replaced. Omit for a read-only record. */
	onFieldChange?: (change: {
		field: InventorySectionField
		value: InventorySectionValue[InventorySectionField]
		previousValue: InventorySectionValue[InventorySectionField]
	}) => void
	sections?: InventorySectionName[]
	strings?: Partial<InventorySectionStrings>
}

export function InventorySection({
	value,
	onFieldChange,
	sections = ALL_SECTIONS,
	strings,
	className,
	...props
}: InventorySectionProps) {
	const copy = resolveStrings(defaultInventorySectionStrings, strings)
	const shown = new Set(sections)
	const tracked = value.trackQuantity !== false

	function change<K extends InventorySectionField>(field: K, next: InventorySectionValue[K]) {
		onFieldChange?.({ field, value: next, previousValue: value[field] })
	}

	const text = (field: InventorySectionField, hint?: string) => (
		<FormField label={copy.fields[field]} hint={hint}>
			<Input
				value={(value[field] as string | undefined) ?? ""}
				readOnly={!onFieldChange}
				inputMode={field === "weight" ? "decimal" : ["available", "committed", "incoming", "lowStockThreshold"].includes(field) ? "numeric" : undefined}
				placeholder={copy.placeholders[field]}
				onChange={(event) => change(field, event.target.value)}
			/>
		</FormField>
	)

	return (
		<ContentBlock
			title={copy.title}
			description={copy.description}
			className={cx("inventory-section--component", styles.block, className)}
			{...props}
		>
			{/* A deliberate restatement of the numbers the fields below edit. */}
			{shown.has("summary") && tracked && (
				<SummaryPanel className="inventory-section--summary">
					<MetadataList columns={{ base: 2, lg: 4 }} items={[
						{ id: "available", label: copy.summary.available, value: value.available ?? "0" },
						{ id: "committed", label: copy.summary.committed, value: value.committed ?? "0" },
						{ id: "incoming", label: copy.summary.incoming, value: value.incoming ?? "0" },
						...(value.lowStockThreshold != null ? [{ id: "threshold", label: copy.summary.threshold, value: value.lowStockThreshold }] : []),
					].map(item => ({ ...item, render: () => <Text size="lg" weight="semibold" numeric lineHeight="tight">{item.value}</Text> }))} />
				</SummaryPanel>
			)}

			{shown.has("identity") && (
				<fieldset className={cx("inventory-section--group", styles.inventoryGroup)}>
					<legend className={styles.inventoryLegend}><DisplayLabel>{copy.sections.identity}</DisplayLabel></legend>
					<div className={styles.inventoryFields}>
						{text("sku")}
						{text("barcode")}
					</div>
				</fieldset>
			)}

			{shown.has("tracking") && (
				<fieldset className={cx("inventory-section--group", styles.inventoryGroup)}>
					<legend className={styles.inventoryLegend}><DisplayLabel>{copy.sections.tracking}</DisplayLabel></legend>
					<FormField
						label={copy.fields.trackQuantity}
						className={styles.inventoryToggle}
						hint={copy.hints.trackQuantity}
					>
						<Switch
							disabled={!onFieldChange}
							checked={tracked}
							onChange={(event) => change("trackQuantity", event.target.checked)}
						/>
					</FormField>

					{/* Hidden, not disabled, when tracking is off: the fields have no meaning then. */}
					{tracked && (
						<>
							<div className={styles.inventoryFields}>
								{text("available")}
								{text("committed")}
								{text("incoming")}
								{text("lowStockThreshold", copy.hints.lowStockThreshold)}
							</div>
							<FormField label={copy.fields.inventoryPolicy} hint={copy.hints.inventoryPolicy}>
								<Select
									disabled={!onFieldChange}
									value={value.inventoryPolicy ?? "deny"}
									onValueChange={(next) => next && change("inventoryPolicy", next as InventoryPolicy)}
									options={[
										{ value: "deny", label: copy.policy.deny },
										{ value: "continue", label: copy.policy.continue },
									]}
								/>
							</FormField>
						</>
					)}
				</fieldset>
			)}

			{shown.has("location") && (
				<fieldset className={cx("inventory-section--group", styles.inventoryGroup)}>
					<legend className={styles.inventoryLegend}><DisplayLabel>{copy.sections.location}</DisplayLabel></legend>
					<div className={styles.inventoryFields}>{text("binLocation", copy.hints.binLocation)}</div>
				</fieldset>
			)}

			{shown.has("shipping") && (
				<fieldset className={cx("inventory-section--group", styles.inventoryGroup)}>
					<legend className={styles.inventoryLegend}><DisplayLabel>{copy.sections.shipping}</DisplayLabel></legend>
					<FormField label={copy.fields.requiresShipping} className={styles.inventoryToggle}>
						<Switch
							disabled={!onFieldChange}
							checked={value.requiresShipping !== false}
							onChange={(event) => change("requiresShipping", event.target.checked)}
						/>
					</FormField>
					{value.requiresShipping !== false && (
						<div className={styles.inventoryFields}>{text("weight")}</div>
					)}
				</fieldset>
			)}

			{shown.has("customs") && (
				<fieldset className={cx("inventory-section--group", styles.inventoryGroup)}>
					<legend className={styles.inventoryLegend}><DisplayLabel>{copy.sections.customs}</DisplayLabel></legend>
					<Text size="xs" type="secondary">
						{copy.hints.customs}
					</Text>
					<div className={styles.inventoryFields}>
						{text("countryOfOrigin")}
						{text("hsCode", copy.hints.hsCode)}
					</div>
				</fieldset>
			)}

			{shown.has("tags") && (
				<fieldset className={cx("inventory-section--group", styles.inventoryGroup)}>
					<legend className={styles.inventoryLegend}><DisplayLabel>{copy.sections.tags}</DisplayLabel></legend>
					<FormField label={copy.fields.tags}>
						<TagsInput
							disabled={!onFieldChange}
							value={value.tags ?? []}
							placeholder={copy.placeholders.tags}
							onValueChange={(next) => change("tags", next)}
						/>
					</FormField>
				</fieldset>
			)}
		</ContentBlock>
	)
}
