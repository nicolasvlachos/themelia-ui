/**
 * The control for one field: a dispatch on `field.type` onto kit components, with
 * `FormField` owning label, hint and message. Narrowed branches let TypeScript prove each
 * reads only keys its field type has.
 */
import { useEffect, useRef, useState } from "react"
import { PlusIcon } from "lucide-react"

import {
	CardCheckboxGroup, CardRadioGroup, Select, SwitchCard, ToggleField,
} from "@/components/base/choice-inputs"
import { DecimalInput } from "@/components/base/forms-numeric"
import { FormField } from "@/components/base/forms"
import { Input, Textarea } from "@/components/base/text-inputs"
import { TagsInput } from "@/components/base/value-inputs"
import { Badge } from "@/components/base/badge"
import { cx } from "@/lib/cx"

import type { SchemaFormStrings } from "./schema-form.strings"
import type {
	SchemaFormField, SchemaFormFieldContext, SchemaFormTextField, SchemaFormValue,
	SchemaFormValues,
} from "./schema-form.types"
import {
	formatJsonValue, parseJsonValue, parseNumberValue, toBooleanValue, toStringArray,
	toStringValue,
} from "./schema-form.utils"
import styles from "./schema-form.module.css"

export interface SchemaFormFieldRendererProps extends SchemaFormFieldContext {
	strings: SchemaFormStrings
	className?: string
}

/** The hint takes whichever of `hint` and `description` exists. */
function hintFor(field: SchemaFormField): string | undefined {
	return field.hint ?? field.description
}

function displayValue(
	field: SchemaFormField,
	value: SchemaFormValue,
	values: SchemaFormValues,
	onError?: (error: unknown) => void,
): string {
	if (field.formatValue) {
		try {
			return field.formatValue(value, values)
		} catch (error) {
			onError?.(error)
		}
	}
	return toStringValue(value)
}

function parseText(
	field: SchemaFormField,
	raw: string,
	values: SchemaFormValues,
	onError?: (error: unknown) => void,
): SchemaFormValue {
	if (field.parseValue) {
		try {
			return field.parseValue(raw, values)
		} catch (error) {
			onError?.(error)
		}
	}
	return raw
}

function parseNumber(
	field: SchemaFormField,
	raw: string,
	values: SchemaFormValues,
	integer: boolean,
	onError?: (error: unknown) => void,
): SchemaFormValue {
	if (field.parseValue) {
		try {
			return field.parseValue(raw, values)
		} catch (error) {
			onError?.(error)
		}
	}
	return parseNumberValue(raw, integer)
}

function parseJson(
	field: SchemaFormField,
	raw: string,
	values: SchemaFormValues,
	onError?: (error: unknown) => void,
): { value: SchemaFormValue; valid: boolean } {
	if (field.type === "json" && field.parseValue) {
		try {
			return { value: field.parseValue(raw, values), valid: true }
		} catch (error) {
			onError?.(error)
			return { value: raw, valid: false }
		}
	}
	return parseJsonValue(raw)
}

/**
 * The JSON field keeps its own text while focused, so re-serialising the object does not
 * reformat under the caret; it re-derives from the value once focus leaves.
 */
function JsonControl({
	field, value, values, error, disabled, fieldId, onValueChange, onError, strings,
}: SchemaFormFieldContext & { strings: SchemaFormStrings }) {
	const indent = field.type === "json" ? (field.jsonIndent ?? 2) : 2
	const [parseError, setParseError] = useState<string | undefined>()
	const controlRef = useRef<HTMLTextAreaElement>(null)
	const emittedValue = useRef(value)

	/*
	 * `draft` is the text while the reader holds the field; `null` shows `formatJsonValue(value)`.
	 * Invalid text survives a blur: `parseJsonValue` returns the raw string on failure and
	 * `formatJsonValue` passes strings through unchanged.
	 */
	const [draft, setDraft] = useState<string | null>(null)
	const text = draft ?? formatJsonValue(value, indent)
	useEffect(() => {
		if (Object.is(value, emittedValue.current)) return
		emittedValue.current = value
		// oxlint-disable-next-line react/set-state-in-effect -- an external reset replaces the editor draft and its parse validity
		setDraft(null)
		setParseError(undefined)
		controlRef.current?.setCustomValidity("")
	}, [value])

	if (field.type !== "json") return null

	return (
		<FormField
			label={field.label}
			required={field.required}
			hint={hintFor(field)}
			helperText={field.helperText}
			error={error ?? parseError}
			htmlFor={fieldId}
			className="schema-form-field--component"
		>
			<Textarea
				ref={controlRef}
				id={fieldId}
				name={field.key}
				value={text}
				rows={field.rows ?? 6}
				disabled={disabled}
				invalid={!!(error ?? parseError)}
				placeholder={field.placeholder}
				spellCheck={false}
				className={cx(styles.mono, field.controlClassName)}
				onChange={(event) => {
					const next = event.target.value
					setDraft(next)
					const parsed = parseJson(field, next, values, onError)
					setParseError(parsed.valid ? undefined : strings.jsonParseError)
					event.currentTarget.setCustomValidity(parsed.valid ? "" : strings.jsonParseError)
					emittedValue.current = parsed.value
					onValueChange(parsed.value)
				}}
				onBlur={(event) => {
					const parsed = parseJson(field, text, values, onError)
					setParseError(parsed.valid ? undefined : strings.jsonParseError)
					event.currentTarget.setCustomValidity(parsed.valid ? "" : strings.jsonParseError)
					emittedValue.current = parsed.value
					onValueChange(parsed.value)
					/* Releasing the draft tidies valid JSON and leaves invalid text untouched. */
					setDraft(null)
				}}
				{...field.textareaProps}
			/>
		</FormField>
	)
}

export function SchemaFormFieldRenderer({
	field, value, values, error, disabled, required, fieldId, onValueChange, onError,
	strings, className,
}: SchemaFormFieldRendererProps) {
	const type = field.type ?? "text"
	/*
	 * Card groups are clusters of radios/checkboxes with no single control to label, so the
	 * field becomes a named group (`htmlFor: false`).
	 */
	const CLUSTER = new Set(["radio-cards", "checkbox-cards"])
	const chrome = {
		label: field.label,
		required,
		hint: hintFor(field),
		helperText: field.helperText,
		error,
		htmlFor: CLUSTER.has(type) ? (false as const) : fieldId,
		className: cx("schema-form-field--component", className),
	}
	const control = field.controlClassName

	if (field.type === "custom") {
		return (
			<div className={cx("schema-form-field--component", className)}>
				{field.render({
					field, value, values, error, disabled, required, fieldId, onValueChange, onError,
				})}
			</div>
		)
	}

	if (field.type === "switch") {
		const checked = toBooleanValue(value)

		/* No `label` on the FormField: the switch carries its own. */
		if (field.switchStyle === "card") {
			return (
				<FormField error={error} className={cx("schema-form-field--component", className)}>
					<SwitchCard
						label={field.label}
						description={field.description}
						hint={field.hint}
						name={field.key}
						value={checked}
						disabled={disabled}
						invalid={!!error}
						className={control}
						onValueChange={onValueChange}
						{...field.switchCardProps}
					/>
				</FormField>
			)
		}

		return (
			<FormField error={error} className={cx("schema-form-field--component", className)}>
				<ToggleField
					label={field.label}
					description={field.description ?? field.hint}
					name={field.key}
					value={checked}
					disabled={disabled}
					invalid={!!error}
					className={control}
					onValueChange={onValueChange}
					{...field.switchProps}
				/>
			</FormField>
		)
	}

	if (field.type === "json") {
		return (
			<JsonControl
				field={field} value={value} values={values} error={error} disabled={disabled}
				required={required} fieldId={fieldId} onValueChange={onValueChange}
				onError={onError} strings={strings}
			/>
		)
	}

	if (field.type === "textarea") {
		return (
			<FormField {...chrome}>
				<Textarea
					id={fieldId}
					name={field.key}
					value={displayValue(field, value, values, onError)}
					rows={field.rows}
					disabled={disabled}
					required={required}
					invalid={!!error}
					placeholder={field.placeholder}
					className={control}
					onChange={(event) =>
						onValueChange(parseText(field, event.target.value, values, onError))
					}
					{...field.textareaProps}
				/>
			</FormField>
		)
	}

	if (field.type === "number" || field.type === "integer" || field.type === "decimal") {
		const integer = field.type === "integer"
		/* Integer 0 places, decimal (money) 2, plain number 4. */
		const places = integer ? 0 : (field.decimalPlaces ?? (field.type === "decimal" ? 2 : 4))
		return (
			<FormField {...chrome}>
				<DecimalInput
					id={fieldId}
					name={field.key}
					value={displayValue(field, value, values, onError)}
					min={field.min}
					max={field.max}
					step={field.step}
					decimalPlaces={places}
					disabled={disabled}
					required={required}
					invalid={!!error}
					placeholder={field.placeholder}
					className={control}
					onChange={(event) =>
						onValueChange(parseNumber(field, event.target.value, values, integer, onError))
					}
					{...field.numberProps}
				/>
			</FormField>
		)
	}

	if (field.type === "select") {
		return (
			<FormField {...chrome}>
				<Select
					name={field.key}
					value={toStringValue(value)}
					options={field.options.map((option) => ({
						value: option.value,
						label: option.label,
						disabled: option.disabled,
						icon: option.icon,
					}))}
					allowClear={field.allowClear}
					disabled={disabled}
					required={required}
					invalid={!!error}
					placeholder={field.placeholder}
					className={control}
					// Select clears with `undefined`; the form stores `null` so the key stays readable.
					onValueChange={(next) => onValueChange(next ?? null)}
					{...field.selectProps}
				/>
			</FormField>
		)
	}

	if (field.type === "radio-cards") {
		return (
			<FormField {...chrome}>
				<CardRadioGroup
					name={field.key}
					value={toStringValue(value)}
					options={field.options}
					columns={field.columns}
					disabled={disabled}
					invalid={!!error}
					className={control}
					onValueChange={onValueChange}
					{...field.radioProps}
				/>
			</FormField>
		)
	}

	if (field.type === "checkbox-cards") {
		return (
			<FormField {...chrome}>
				<CardCheckboxGroup
					name={field.key}
					value={toStringArray(value)}
					options={field.options}
					columns={field.columns}
					disabled={disabled}
					invalid={!!error}
					className={control}
					onValueChange={onValueChange}
					{...field.checkboxProps}
				/>
			</FormField>
		)
	}

	if (field.type === "tags") {
		const tags = toStringArray(value)
		/* Already-added recommendations are dropped rather than disabled. */
		const offered = (field.recommendations ?? []).filter((tag) => !tags.includes(tag))
		const full = field.maxTags !== undefined && tags.length >= field.maxTags

		return (
			<FormField {...chrome}>
				<TagsInput
					name={field.key}
					value={tags}
					maxTags={field.maxTags}
					disabled={disabled}
					invalid={!!error}
					placeholder={field.placeholder}
					className={control}
					onValueChange={onValueChange}
					{...field.tagsProps}
				/>
				{offered.length > 0 && !full && (
					<div className={styles.recommendations}>
						{offered.map((tag) => (
							<button
								key={tag}
								type="button"
								disabled={disabled}
								className={styles.recommendation}
								onClick={() => onValueChange([...tags, tag])}
							>
								{/* The plus distinguishes a suggestion from an added tag. */}
								<Badge tone="neutral"><PlusIcon aria-hidden />{tag}</Badge>
							</button>
						))}
					</div>
				)}
			</FormField>
		)
	}

	/*
	 * Everything left is a text field. The cast is needed because `type` is optional on the
	 * text member, so equality checks cannot eliminate `undefined`.
	 */
	const text = field as SchemaFormTextField

	return (
		<FormField {...chrome}>
			<Input
				id={fieldId}
				name={field.key}
				type={type === "text" ? "text" : type}
				value={displayValue(field, value, values, onError)}
				disabled={disabled}
				required={required}
				invalid={!!error}
				placeholder={field.placeholder}
				className={control}
				onChange={(event) =>
					onValueChange(parseText(field, event.target.value, values, onError))
				}
				{...text.inputProps}
			/>
		</FormField>
	)
}
