/**
 * The option groups a product's variants are generated from. One card with ruled rows,
 * because the options are one ordered list. The whole row is the edit target and the
 * editor replaces it in place. Options and their values are both `Repeater`s (reorder,
 * keyboard grip, remove, add).
 */
import { LayersIcon } from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"

import { ActionMenu } from "@/components/base/action-menu"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ConfirmDialog, useOverlayVisibility } from "@/components/features/overlays"
import { ContentBlock } from "@/components/base/display"
import { FormField } from "@/components/base/forms"
import { Input } from "@/components/base/text-inputs"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/base/item"
import { Repeater } from "@/components/base/repeaters"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { ToggleField } from "@/components/base/choice-inputs"
import { cx } from "@/lib/cx"

import { ProductEmptyState } from "./product-parts"
import { defaultProductOptionsMatrixStrings } from "./products.strings"
import type {
	ProductOptionEditDraft, ProductOptionGroup, ProductOptionValue, ProductOptionsMatrixProps,
} from "./products.types"
import styles from "./products.module.css"

/** A label is a ReactNode; a text field needs a string. Anything else edits as empty. */
function toDraftText(value: ReactNode): string {
	return typeof value === "string" || typeof value === "number" ? String(value) : ""
}

let draftSequence = 0

/** Returns a copy with the entry at `from` moved to `to`, as `Repeater` reports a move. */
function moved<T>(items: readonly T[], from: number, to: number): T[] {
	const next = [...items]
	next.splice(to, 0, ...next.splice(from, 1))
	return next
}

export function ProductOptionsMatrix({
	optionGroups = [],
	surface = "card",
	editingOptionId,
	defaultEditingOptionId = null,
	onEditingOptionIdChange,
	onCreateOption,
	onEditOption,
	onDeleteOption,
	confirmDelete = true,
	onAddValue,
	onDeleteValue,
	onOptionNameChange,
	onValueLabelChange,
	onSaveEditingOption,
	onCancelEditingOption,
	onToggleUsedForVariants,
	onReorderOptions,
	actions,
	footerSlot,
	empty,
	className,
	strings,
}: ProductOptionsMatrixProps) {
	const copy = { ...defaultProductOptionsMatrixStrings, ...strings }

	const [internalEditing, setInternalEditing] = useState<string | null>(defaultEditingOptionId)
	const editing = editingOptionId !== undefined ? editingOptionId : internalEditing

	const [draft, setDraft] = useState<ProductOptionEditDraft>({ name: "", values: [] })
	const [pendingDelete, setPendingDelete] = useState<ProductOptionGroup | null>(null)
	const confirm = useOverlayVisibility()

	const ordered = useMemo(
		() => [...optionGroups].sort((left, right) => (left.position ?? 0) - (right.position ?? 0)),
		[optionGroups],
	)

	const startEditing = (option: ProductOptionGroup) => {
		// Re-seeded on every open, so a cancelled edit cannot leak into the next.
		setDraft({ name: toDraftText(option.name), values: [...(option.values ?? [])] })
		if (editingOptionId === undefined) setInternalEditing(option.id)
		onEditingOptionIdChange?.(option.id, option)
		onEditOption?.(option)
	}

	const stopEditing = () => {
		if (editingOptionId === undefined) setInternalEditing(null)
		onEditingOptionIdChange?.(null)
	}

	const requestDelete = (option: ProductOptionGroup) => {
		if (!onDeleteOption) return
		if (!confirmDelete) {
			onDeleteOption(option)
			stopEditing()
			return
		}
		setPendingDelete(option)
		confirm.show()
	}

	const editor = (option: ProductOptionGroup) => (
		<Stack gap="lg" className={styles.optionEditor}>
			<FormField label={copy.nameLabel}>
				<Input
					value={draft.name}
					placeholder={copy.namePlaceholder}
					onChange={(event) => {
						setDraft((current) => ({ ...current, name: event.target.value }))
						onOptionNameChange?.(option, event.target.value)
					}}
				/>
			</FormField>

			<FormField label={copy.valuesLabel}>
				<Repeater<ProductOptionValue>
					items={draft.values}
					getKey={(value) => value.id}
					strings={{ add: copy.addValueLabel, remove: (index) => `${copy.removeValueLabel} ${index}` }}
					emptyState={<Text type="secondary">{copy.noValues}</Text>}
					onAdd={() => {
						const created: ProductOptionValue = {
							id: `draft-value-${(draftSequence += 1)}`,
							label: "",
						}
						setDraft((current) => ({ ...current, values: [...current.values, created] }))
						onAddValue?.(option)
					}}
					onRemove={(index) => {
						const value = draft.values[index]
						setDraft((current) => ({
							...current,
							values: current.values.filter((_, position) => position !== index),
						}))
						if (value) onDeleteValue?.(option, value)
					}}
					onMove={(from, to) =>
						setDraft((current) => ({ ...current, values: moved(current.values, from, to) }))
					}
				>
					{(value, { index }) => (
						<Input
							value={toDraftText(value.label)}
							placeholder={copy.valuePlaceholder}
							aria-label={`${copy.valuesLabel} ${index + 1}`}
							onChange={(event) => {
								const label = event.target.value
								/* From the latest state, like the handlers beside it: a stale copy drops a fast second edit. */
								setDraft((current) => ({
									...current,
									values: current.values.map((entry, position) => (position === index ? { ...entry, label } : entry)),
								}))
								onValueLabelChange?.(option, value, label)
							}}
						/>
					)}
				</Repeater>
			</FormField>

			{!!onToggleUsedForVariants && (
				<ToggleField
					label={copy.usedForVariantsLabel}
					description={copy.usedForVariantsDescription}
					value={option.usedForVariants ?? true}
					onValueChange={(used) => onToggleUsedForVariants(option, used)}
				/>
			)}

			{/* Delete sits apart from Cancel/Done so it is never pressed to back out. */}
			<div className={styles.optionEditorActions}>
				<div>
					{!!onDeleteOption && (
						<Button
							type="button"
							tone="destructive"
							buttonStyle="ghost"
							onClick={() => requestDelete(option)}
						>
							{copy.deleteLabel}
						</Button>
					)}
				</div>
				<Stack direction="horizontal" gap="sm" align="center">
					<Button
						type="button"
						tone="neutral"
						buttonStyle="ghost"
						onClick={() => {
							onCancelEditingOption?.(option, draft)
							stopEditing()
						}}
					>
						{copy.cancelLabel}
					</Button>
					<Button
						type="button"
						onClick={() => {
							onSaveEditingOption?.(option, draft)
							stopEditing()
						}}
					>
						{copy.doneLabel}
					</Button>
				</Stack>
			</div>
		</Stack>
	)

	const body =
		ordered.length === 0 ? (
			(empty ?? (
				<ProductEmptyState
					title={copy.emptyTitle}
					description={copy.emptyDescription}
					action={
						onCreateOption ? (
							<Button type="button" onClick={onCreateOption}>{copy.createLabel}</Button>
						) : undefined
					}
				/>
			))
		) : (
			<Repeater<ProductOptionGroup>
				items={ordered}
				getKey={(option) => option.id}
				strings={{ add: copy.createLabel }}
				className={styles.optionList}
				onAdd={onCreateOption}
				onMove={
					onReorderOptions
						? (from, to) =>
								onReorderOptions(
									moved(ordered, from, to).map((option, index) => ({ ...option, position: index })),
								)
						: undefined
				}
			>
				{(option) => {
					const isEditing = editing === option.id
					if (isEditing) return editor(option)

					const values = option.values ?? []

					return (
						/* The row is the only edit control; no separate pencil. */
						<Item
							render={<button type="button" />}
							onClick={() => startEditing(option)}
							className={styles.optionRow}
						>
							<ItemContent>
								<ItemTitle>
									{option.name}
									{option.badge}
								</ItemTitle>
								{!!option.description && <ItemDescription>{option.description}</ItemDescription>}
								<span className={styles.optionValues}>
									{values.map((value) => (
										<Badge key={value.id} tone="neutral">{value.label}</Badge>
									))}
								</span>
							</ItemContent>
						</Item>
					)
				}}
			</Repeater>
		)

	const dialog = (
		<ConfirmDialog
			{...confirm.overlayProps}
			destructive
			title={copy.confirmDeleteTitle}
			description={
				pendingDelete ? copy.confirmDeleteDescription(toDraftText(pendingDelete.name)) : undefined
			}
			strings={{ confirm: copy.confirmDeleteConfirm, cancel: copy.confirmDeleteCancel }}
			onConfirm={() => {
				if (pendingDelete) onDeleteOption?.(pendingDelete)
				setPendingDelete(null)
				stopEditing()
			}}
		/>
	)

	if (surface === "embedded") {
		return (
			<div className={cx("product-options-matrix--component", styles.matrix, className)}>
				{body}
				{footerSlot}
				{dialog}
			</div>
		)
	}

	return (
		<ContentBlock
			surface="bordered"
			icon={<LayersIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={actions?.length ? <ActionMenu actions={actions} /> : undefined}
			className={cx("product-options-matrix--component", styles.card, className)}
		>
			{body}
			{footerSlot}
			{dialog}
		</ContentBlock>
	)
}
