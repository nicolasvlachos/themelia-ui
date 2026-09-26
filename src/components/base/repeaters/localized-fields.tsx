/**
 * Localized fields — one value per locale (`{ en: "Name", nl: "Naam" }`) behind a single
 * field with a locale switcher. The active locale is view state, not part of the value.
 */
import { useId, useMemo, useState, type ReactNode } from "react"

import { PillRadioGroup } from "@/components/base/choice-inputs"
import { VisuallyHidden } from "@/components/base/display"
import { FormField } from "@/components/base/forms"
import { Input, Textarea } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import styles from "./repeater.module.css"

export interface LocaleDescriptor {
	/** BCP 47 tag — "en", "nl", "pt-BR". */
	value: string
	/** Shown on the switcher. Falls back to the tag. */
	label?: string
}

/** `{ en: "Name", nl: "Naam" }`. Missing keys are simply untranslated. */
export type LocalizedValue = Record<string, string>

export interface LocalizedStringFieldProps {
	locales: (string | LocaleDescriptor)[]
	value?: LocalizedValue
	onValueChange?: (value: LocalizedValue) => void
	/** A textarea per locale rather than an input. */
	multiline?: boolean
	placeholder?: string
	disabled?: boolean
	invalid?: boolean
	/** Marks locales that must be filled, so the switcher can flag what is missing. */
	requiredLocales?: string[]
	className?: string
	/** The field's name; `FormField` supplies the `aria-*` wiring below. */
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
}

function normalizeLocales(locales: (string | LocaleDescriptor)[]): LocaleDescriptor[] {
	return locales.map((locale) => (typeof locale === "string" ? { value: locale } : locale))
}

export function LocalizedStringField({
	locales,
	value = {},
	onValueChange,
	multiline = false,
	placeholder,
	disabled = false,
	invalid = false,
	requiredLocales,
	className,
	"aria-label": ariaLabel,
	"aria-labelledby": labelledBy,
	"aria-describedby": describedBy,
	"aria-invalid": ariaInvalid,
}: LocalizedStringFieldProps) {
	const options = useMemo(() => normalizeLocales(locales), [locales])
	const [active, setActive] = useState(options[0]?.value ?? "")
	const localeId = useId()
	const nameId = useId()
	const activeLabel = options.find((locale) => locale.value === active)?.label ?? active
	const isInvalid = invalid || ariaInvalid === true || ariaInvalid === "true"

	const set = (next: string) => onValueChange?.({ ...value, [active]: next })

	// The switcher marks each required locale that is still empty.
	const switcherOptions = options.map((locale) => {
		const missing = requiredLocales?.includes(locale.value) && !value[locale.value]?.trim()
		return {
			value: locale.value,
			label: missing ? `${locale.label ?? locale.value} •` : (locale.label ?? locale.value),
		}
	})

	const Control = multiline ? Textarea : Input

	return (
		<div className={cx("localized-string-field--component", styles.root, className)}>
			{/* No `name`: the locale is view state, not part of the value. */}
			<PillRadioGroup
				options={switcherOptions}
				value={active}
				onValueChange={(next) => next && setActive(next)}
				disabled={disabled}
				// Described, not named, by the field, so `getByLabelText` finds only the input.
				aria-describedby={labelledBy ?? (ariaLabel ? nameId : undefined)}
			/>
			{/*
			  * The input is named by the field's label, then the locale ("Display name English"),
			  * by id reference rather than a string template.
			  */}
			{!labelledBy && !!ariaLabel && <VisuallyHidden id={nameId}>{ariaLabel}</VisuallyHidden>}
			<VisuallyHidden id={localeId}>{activeLabel}</VisuallyHidden>
			<Control
				value={value[active] ?? ""}
				placeholder={placeholder}
				disabled={disabled}
				aria-invalid={isInvalid || undefined}
				aria-labelledby={[labelledBy ?? (ariaLabel ? nameId : undefined), localeId].filter(Boolean).join(" ")}
				aria-describedby={describedBy}
				onChange={(event: { target: { value: string } }) => set(event.target.value)}
			/>
		</div>
	)
}

export interface LocalizedObjectFieldDefinition {
	/** Key in each locale's object. */
	name: string
	label: ReactNode
	multiline?: boolean
	placeholder?: string
}

/** `{ en: { title: "…", body: "…" }, nl: { … } }`. */
export type LocalizedObjectValue = Record<string, Record<string, string>>

export interface LocalizedObjectFieldProps {
	locales: (string | LocaleDescriptor)[]
	/** The fields inside each locale. */
	fields: LocalizedObjectFieldDefinition[]
	value?: LocalizedObjectValue
	onValueChange?: (value: LocalizedObjectValue) => void
	disabled?: boolean
	invalid?: boolean
	className?: string
}

/** Several fields per locale — a title and a body, say — behind one switcher. */
export function LocalizedObjectField({
	locales,
	fields,
	value = {},
	onValueChange,
	disabled = false,
	invalid = false,
	className,
}: LocalizedObjectFieldProps) {
	const options = useMemo(() => normalizeLocales(locales), [locales])
	const [active, setActive] = useState(options[0]?.value ?? "")
	const current = value[active] ?? {}
	const localeId = useId()
	const activeLabel = options.find((locale) => locale.value === active)?.label ?? active

	const set = (name: string, next: string) =>
		onValueChange?.({ ...value, [active]: { ...current, [name]: next } })

	return (
		<div className={cx("localized-object-field--component", styles.root, className)}>
			<PillRadioGroup
				options={options.map((locale) => ({ value: locale.value, label: locale.label ?? locale.value }))}
				value={active}
				onValueChange={(next) => next && setActive(next)}
				disabled={disabled}
			/>
			<VisuallyHidden id={localeId}>{activeLabel}</VisuallyHidden>
			{/* Each field carries its own visible label. */}
			{fields.map((field) => {
				const Control = field.multiline ? Textarea : Input
				return (
					<FormField key={field.name} label={field.label}>
						{(wiring) => (
							<Control
								{...wiring}
								aria-labelledby={`${wiring["aria-labelledby"] ?? ""} ${localeId}`.trim()}
								value={current[field.name] ?? ""}
								placeholder={field.placeholder}
								disabled={disabled}
								aria-invalid={invalid || undefined}
								onChange={(event: { target: { value: string } }) => set(field.name, event.target.value)}
							/>
						)}
					</FormField>
				)
			})}
		</div>
	)
}
