/**
 * The pure parts: field values and section membership. Consumer predicates run in a
 * try/catch; a throw falls back to a safe default (`hidden` false, `disabled` true) and is
 * reported through `onError`.
 */
import type {
	ResolvedSchemaFormSection, SchemaFormColumns, SchemaFormField, SchemaFormSchema,
	SchemaFormValue, SchemaFormValues,
} from "./schema-form.types"

type ErrorHandler = (error: unknown) => void

export function isFieldHidden(
	field: SchemaFormField,
	values: SchemaFormValues,
	onError?: ErrorHandler,
): boolean {
	if (typeof field.hidden === "function") {
		try {
			return field.hidden(values)
		} catch (error) {
			onError?.(error)
			return false
		}
	}
	return field.hidden ?? false
}

export function isFieldDisabled(
	field: SchemaFormField,
	values: SchemaFormValues,
	onError?: ErrorHandler,
): boolean {
	if (typeof field.disabled === "function") {
		try {
			return field.disabled(values)
		} catch (error) {
			onError?.(error)
			return true
		}
	}
	return field.disabled ?? false
}

export function getVisibleFields(
	fields: SchemaFormField[],
	values: SchemaFormValues,
	onError?: ErrorHandler,
): SchemaFormField[] {
	return fields.filter((field) => !isFieldHidden(field, values, onError))
}

/**
 * Buckets the visible fields into sections: by explicit list, else by `sectionId`.
 * Unclaimed fields go to a leading default bucket, titled only when other sections exist.
 * Empty sections are dropped.
 */
export function resolveSchemaSections(
	schema: SchemaFormSchema,
	values: SchemaFormValues,
	defaultSectionTitle: string,
	defaultColumns: SchemaFormColumns,
	onError?: ErrorHandler,
): ResolvedSchemaFormSection[] {
	const visible = getVisibleFields(schema.fields, values, onError)
	const byKey = new Map(visible.map((field) => [field.key, field]))
	const claimed = new Set<string>()
	const sections: ResolvedSchemaFormSection[] = []

	for (const section of schema.sections ?? []) {
		const fields = section.fields
			? section.fields
					.map((key) => byKey.get(key))
					.filter((field): field is SchemaFormField => field !== undefined)
			: visible.filter((field) => field.sectionId === section.id)

		for (const field of fields) claimed.add(field.key)

		sections.push({
			id: section.id,
			title: section.title,
			description: section.description,
			icon: section.icon,
			fields,
			columns: section.columns ?? defaultColumns,
			footerSlot: section.footerSlot,
			className: section.className,
		})
	}

	const unclaimed = visible.filter((field) => !claimed.has(field.key))
	if (unclaimed.length > 0 || sections.length === 0) {
		sections.unshift({
			id: "default",
			title: schema.sections?.length ? defaultSectionTitle : undefined,
			fields: unclaimed,
			columns: defaultColumns,
		})
	}

	return sections.filter((section) => section.fields.length > 0)
}

export function toStringValue(value: SchemaFormValue): string {
	if (value === undefined || value === null) return ""
	if (typeof value === "string") return value
	if (typeof value === "number" || typeof value === "boolean") return String(value)
	return JSON.stringify(value)
}

export function toStringArray(value: SchemaFormValue): string[] {
	if (!Array.isArray(value)) return []
	return value.map((item) => String(item))
}

/** `"true"` and `1` count too (values round-tripped through query strings or databases). */
export function toBooleanValue(value: SchemaFormValue): boolean {
	return value === true || value === "true" || value === 1
}

/** Empty is `null`, not `0`: a cleared field means "no answer". */
export function parseNumberValue(raw: string, integer = false): number | null {
	const trimmed = raw.trim()
	if (trimmed.length === 0) return null
	const parsed = integer ? Number.parseInt(trimmed, 10) : Number.parseFloat(trimmed)
	return Number.isNaN(parsed) ? null : parsed
}

export function formatJsonValue(value: SchemaFormValue, indent = 2): string {
	if (value === undefined || value === null) return ""
	if (typeof value === "string") return value
	try {
		return JSON.stringify(value, null, indent)
	} catch {
		// A cycle: show something rather than an empty box.
		return String(value)
	}
}

/**
 * Invalid JSON keeps the raw text as the value, so a mid-edit typo is never erased;
 * `valid` drives the message.
 */
export function parseJsonValue(raw: string): { value: SchemaFormValue; valid: boolean } {
	const trimmed = raw.trim()
	if (trimmed.length === 0) return { value: null, valid: true }
	try {
		return { value: JSON.parse(trimmed) as SchemaFormValue, valid: true }
	} catch {
		return { value: raw, valid: false }
	}
}

/** A field key can be anything; a DOM id cannot. */
export function toDomId(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, "-")
}
