/**
 * The variant form.
 *
 * Values stay strings (the consumer parses on submit), so "24.00" is never rewritten under
 * the cursor. Pending is `submitting` OR an in-flight async `onSubmit`, so a save cannot be
 * submitted twice without extra wiring. The layout is keyed to its container (drawers, rails).
 */
import { resolveStrings } from "@/lib/strings"
import { PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react"
import { useId, useState, type FormEvent } from "react"

import { ActionMenu } from "@/components/base/action-menu"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { FormField } from "@/components/base/forms"
import { Input, Textarea } from "@/components/base/text-inputs"
import { Select } from "@/components/base/choice-inputs"
import { DisplayLabel } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultProductVariantEditorStrings } from "./products.strings"
import type {
	ProductChoice, ProductVariantEditorProps, ProductVariantEditorValues,
	ProductVariantOptionField,
} from "./products.types"
import styles from "./products.module.css"

type ProductVariantTextField = keyof Omit<ProductVariantEditorValues, "options">

function toSelectOptions(choices: ProductChoice[]) {
	return choices.map((choice) => ({
		value: choice.value,
		label: choice.label,
		disabled: choice.disabled,
	}))
}

export function ProductVariantEditor({
	value: valueProp,
	defaultValue,
	optionFields = [],
	statusOptions = [],
	onValueChange,
	onSubmit,
	onError,
	onCancel,
	onDelete,
	actions,
	headerEnd,
	footerSlot,
	disabled = false,
	submitting = false,
	className,
	strings,
}: ProductVariantEditorProps) {
	const copy = resolveStrings(defaultProductVariantEditorStrings, strings)

	const formId = useId()
	const isControlled = valueProp !== undefined
	const [internalValue, setInternalValue] = useState<ProductVariantEditorValues>(
		() => defaultValue ?? {},
	)
	const [internalSubmitting, setInternalSubmitting] = useState(false)

	const value = (isControlled ? valueProp : internalValue) ?? {}
	const isSubmitting = submitting || internalSubmitting
	const isDisabled = disabled || isSubmitting

	const updateValue = (next: ProductVariantEditorValues) => {
		if (!isControlled) setInternalValue(next)
		onValueChange?.(next)
	}

	const updateField = (field: ProductVariantTextField, next: string) => {
		updateValue({ ...value, [field]: next })
	}

	const updateOption = (field: ProductVariantOptionField, next: string | undefined) => {
		updateValue({ ...value, options: { ...(value.options ?? {}), [field.id]: next } })
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!onSubmit || isSubmitting) return

		setInternalSubmitting(true)
		try {
			await onSubmit(value)
		} catch (error) {
			// Handed on: only the consumer knows what to say about it.
			onError?.(error)
		} finally {
			setInternalSubmitting(false)
		}
	}

	const hasFooter = !!(onDelete || onCancel || onSubmit)

	return (
		<ContentBlock
			surface="bordered"
			icon={<PencilIcon />}
			title={copy.title}
			description={copy.description}
			headerEnd={
				<>
					{headerEnd}
					{!!actions?.length && <ActionMenu actions={actions} />}
				</>
			}
			className={cx("product-variant-editor--component", styles.editor, className)}
		>
			<form id={formId} className={styles.editorForm} onSubmit={handleSubmit}>
				<section className={styles.section}>
					<DisplayLabel>{copy.identityTitle}</DisplayLabel>
					<div className={styles.fields}>
						<FormField label={copy.fields.name} required>
							<Input
								value={value.name ?? ""}
								placeholder={copy.placeholders.name}
								disabled={isDisabled}
								onChange={(event) => updateField("name", event.target.value)}
							/>
						</FormField>
						<FormField label={copy.fields.sku}>
							<Input
								value={value.sku ?? ""}
								placeholder={copy.placeholders.sku}
								disabled={isDisabled}
								onChange={(event) => updateField("sku", event.target.value)}
							/>
						</FormField>
						<FormField label={copy.fields.description} className={styles.fieldWide}>
							<Textarea
								value={value.description ?? ""}
								placeholder={copy.placeholders.description}
								disabled={isDisabled}
								minRows={2}
								onChange={(event) => updateField("description", event.target.value)}
							/>
						</FormField>
					</div>
				</section>

				<section className={styles.section}>
					<DisplayLabel>{copy.commercialTitle}</DisplayLabel>
					<div className={styles.fields}>
						<FormField label={copy.fields.price}>
							<Input
								value={value.price ?? ""}
								placeholder={copy.placeholders.price}
								disabled={isDisabled}
								onChange={(event) => updateField("price", event.target.value)}
							/>
						</FormField>
						<FormField label={copy.fields.inventory}>
							<Input
								value={value.inventory ?? ""}
								placeholder={copy.placeholders.inventory}
								disabled={isDisabled}
								inputMode="numeric"
								onChange={(event) => updateField("inventory", event.target.value)}
							/>
						</FormField>
						<FormField label={copy.fields.status}>
							{/* A select when statuses are known, a free-text field when not. */}
							{statusOptions.length > 0 ? (
								<Select
									options={toSelectOptions(statusOptions)}
									value={value.status ?? null}
									placeholder={copy.statusPlaceholder}
									disabled={isDisabled}
									aria-label={copy.fields.status}
									onValueChange={(next) => updateField("status", next ?? "")}
								/>
							) : (
								<Input
									value={value.status ?? ""}
									placeholder={copy.placeholders.status}
									disabled={isDisabled}
									onChange={(event) => updateField("status", event.target.value)}
								/>
							)}
						</FormField>
						<FormField label={copy.fields.channels}>
							<Input
								value={value.channels ?? ""}
								placeholder={copy.placeholders.channels}
								disabled={isDisabled}
								onChange={(event) => updateField("channels", event.target.value)}
							/>
						</FormField>
					</div>
				</section>

				{optionFields.length > 0 && (
					<section className={styles.section}>
						<DisplayLabel>{copy.optionsTitle}</DisplayLabel>
						<div className={styles.fields}>
							{optionFields.map((field) => {
								const fieldValue = field.value ?? value.options?.[field.id] ?? ""

								return (
									<FormField key={field.id} label={field.label} helperText={field.helperText}>
										{field.choices?.length ? (
											<Select
												options={toSelectOptions(field.choices)}
												value={fieldValue || null}
												placeholder={field.placeholder ?? copy.optionPlaceholder}
												disabled={isDisabled}
												aria-label={field.label}
												onValueChange={(next) => updateOption(field, next)}
											/>
										) : (
											<Input
												value={fieldValue}
												placeholder={field.placeholder ?? copy.optionPlaceholder}
												disabled={isDisabled}
												onChange={(event) => updateOption(field, event.target.value)}
											/>
										)}
									</FormField>
								)
							})}
						</div>
					</section>
				)}
			</form>

			{footerSlot ??
				(hasFooter && (
					<div className={styles.editorFooter}>
						{/* Delete sits apart from the pair that finishes the edit. */}
						<div>
							{!!onDelete && (
								<Button
									type="button"
									tone="destructive"
									buttonStyle="ghost"
									disabled={isDisabled}
									onClick={() => onDelete(value)}
								>
									<Trash2Icon />
									{copy.deleteLabel}
								</Button>
							)}
						</div>
						<div className={styles.editorFooterEnd}>
							{!!onCancel && (
								<Button
									type="button"
									tone="neutral"
									buttonStyle="ghost"
									disabled={isDisabled}
									onClick={onCancel}
								>
									<XIcon />
									{copy.cancelLabel}
								</Button>
							)}
							{!!onSubmit && (
								<Button type="submit" form={formId} disabled={isDisabled} loading={isSubmitting}>
									<SaveIcon />
									{isSubmitting ? copy.savingLabel : copy.saveLabel}
								</Button>
							)}
						</div>
					</div>
				))}
		</ContentBlock>
	)
}
