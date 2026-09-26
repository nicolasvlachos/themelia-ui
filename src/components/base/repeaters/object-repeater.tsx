/**
 * ObjectRepeater — rows of small objects whose fields are fixed by a definition (contacts,
 * line items, addresses). Controlled; no form library is imported, so any can drive it.
 */
import { useCallback, useState, type ReactNode } from "react"

import { FormField } from "@/components/base/forms"
import { Input, Textarea } from "@/components/base/text-inputs"
import { Stack } from "@/components/base/structure"
import { cx } from "@/lib/cx"

import { defaultObjectRepeaterStrings, type ObjectRepeaterStrings } from "./repeaters.strings"
import { Repeater } from "./repeater"

export interface ObjectFieldDef {
	/** Key within each row object. */
	name: string
	label: string
	/** `textarea` for prose; `number` narrows the keyboard on a phone. */
	type?: "text" | "textarea" | "number"
	placeholder?: string
	required?: boolean
	/** A line under the field. */
	hint?: string
	/** Fraction of the row this field takes, 1–12. Defaults to an even share. */
	span?: number
}

export interface ObjectRepeaterFieldContext {
	index: number
	/** `items.2.email` — the path this field would have in a form library. */
	path: string
	value: string
	onChange: (value: string) => void
	invalid: boolean
	disabled: boolean
}

export type ObjectRow = Record<string, string>

/*
 * Keys rows by object identity, so a moved row keeps its fields' DOM and focus. An edit
 * `carry`s the key to the new object; a row seen twice in one list falls back to its index.
 */
function createRowKeys() {
	const keys = new WeakMap<ObjectRow, string>()
	let next = 0
	return {
		list(rows: ObjectRow[]) {
			const seen = new Set<string>()
			return rows.map((row, index) => {
				let key = keys.get(row)
				if (key === undefined) keys.set(row, (key = `row-${next++}`))
				const unique = seen.has(key) ? `${key}-at-${index}` : key
				seen.add(unique)
				return unique
			})
		},
		carry(from: ObjectRow, to: ObjectRow) {
			const key = keys.get(from)
			if (key !== undefined) keys.set(to, key)
		},
	}
}

export interface ObjectRepeaterProps {
	value: ObjectRow[]
	onValueChange: (value: ObjectRow[]) => void
	fields: ObjectFieldDef[]
	/** Prefixes the generated field paths (`items.2.email`) to match a form library. Naming only. */
	name?: string
	emptyState?: ReactNode
	maxItems?: number
	sortable?: boolean
	disabled?: boolean
	invalid?: boolean
	/** Replaces one field's control, keeping the row and array behaviour. */
	renderField?: (field: ObjectFieldDef, context: ObjectRepeaterFieldContext) => ReactNode
	strings?: Partial<ObjectRepeaterStrings>
	className?: string
}

export function ObjectRepeater({
	value,
	onValueChange,
	fields,
	name = "items",
	emptyState,
	maxItems,
	sortable = false,
	disabled = false,
	invalid = false,
	renderField,
	strings,
	className,
}: ObjectRepeaterProps) {
	const copy = { ...defaultObjectRepeaterStrings, ...strings }
	const [rowKeys] = useState(createRowKeys)
	const keys = rowKeys.list(value)

	/** A row with every declared key present, so a control is never uncontrolled. */
	const emptyRow = useCallback(
		() => Object.fromEntries(fields.map((field) => [field.name, ""])),
		[fields],
	)

	const setAt = useCallback(
		(index: number, key: string, next: string) =>
			onValueChange(
				value.map((row, position) => {
					if (position !== index) return row
					const edited = { ...row, [key]: next }
					rowKeys.carry(row, edited)
					return edited
				}),
			),
		[onValueChange, rowKeys, value],
	)

	const move = useCallback(
		(from: number, to: number) => {
			const next = [...value]
			const [moved] = next.splice(from, 1)
			if (moved) next.splice(to, 0, moved)
			onValueChange(next)
		},
		[onValueChange, value],
	)

	return (
		<Repeater
			items={value}
			getKey={(_, index) => keys[index] ?? String(index)}
			onAdd={() => onValueChange([...value, emptyRow()])}
			onRemove={(index) => onValueChange(value.filter((_, position) => position !== index))}
			onMove={sortable ? move : undefined}
			rowVariant="card"
			emptyState={emptyState ?? copy.emptyState}
			maxItems={maxItems}
			disabled={disabled}
			strings={copy}
			className={cx("object-repeater--component", className)}
		>
			{(row, { index }) => (
				/* Horizontal and wrapping, so short fields share a line until the row narrows. */
				<Stack direction="horizontal" gap="md" wrap>
					{fields.map((field) => {
						const context: ObjectRepeaterFieldContext = {
							index,
							path: `${name}.${index}.${field.name}`,
							value: row[field.name] ?? "",
							onChange: (next) => setAt(index, field.name, next),
							invalid,
							disabled,
						}

						if (renderField) return <div key={field.name}>{renderField(field, context)}</div>

						const Control = field.type === "textarea" ? Textarea : Input

						return (
							<FormField
								key={field.name}
								label={field.label}
								hint={field.hint}
								required={field.required}
								style={{ flex: `1 1 ${field.span ? `${(field.span / 12) * 100}%` : "12rem"}` }}
							>
								<Control
									value={context.value}
									type={field.type === "number" ? "number" : undefined}
									inputMode={field.type === "number" ? "decimal" : undefined}
									placeholder={field.placeholder}
									disabled={disabled}
									invalid={invalid}
									onChange={(event) => context.onChange(event.target.value)}
								/>
							</FormField>
						)
					})}
				</Stack>
			)}
		</Repeater>
	)
}
