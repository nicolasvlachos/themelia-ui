import { useState } from "react"

import { Input } from "@/components/base/text-inputs"
import { FormField } from "@/components/base/forms"
import {
	KeyValueEditor, LocalizedStringField, Repeater, StringRepeater,
	type KeyValuePair, type LocalizedValue,
} from "@/components/base/repeaters"
import { Stack } from "@/components/base/structure"

import { MEASURE } from "../partials/measures"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

type Contact = { id: string; name: string; email: string }

const LOCALES = [
	{ value: "en", label: "English" },
	{ value: "nl", label: "Nederlands" },
]

export function RepeaterPage() {
	const [domains, setDomains] = useState(["acme.com", "acme.dev"])
	const [headers, setHeaders] = useState<KeyValuePair[]>([
		{ key: "X-Api-Version", value: "2026-01" },
		{ key: "X-Trace", value: "on" },
	])
	const [contacts, setContacts] = useState<Contact[]>([
		{ id: "a", name: "Jamie Moreau", email: "jamie@acme.com" },
		{ id: "b", name: "Rin Fujita", email: "rin@acme.com" },
	])
	const [name, setName] = useState<LocalizedValue>({ en: "Invoice", nl: "Factuur" })

	const move = (from: number, to: number) =>
		setContacts((current) => {
			if (to < 0 || to >= current.length) return current
			const next = [...current]
			next.splice(to, 0, ...next.splice(from, 1))
			return next
		})

	return (
		<ComponentPage
			title="Repeater"
			summary="A list the reader edits row by row — add, remove, reorder. The generic Repeater renders any row you give it; the three specialised ones cover the shapes that come up constantly."
			importPath="@/components/base/repeaters"
			exports={["Repeater", "StringRepeater", "KeyValueEditor", "LocalizedStringField", "ObjectRepeater", "LocalizedStringRepeater", "LocalizedObjectField"
			]}
		>
			<Example
				id="repeater"
				title="Repeater"
				description="The base component. It does not own the array — you pass items and the handlers, which is what keeps it usable with a form library or with plain state. Supplying onMove is what enables reordering and renders the handle."
				stacked
				code={`<Repeater
  items={contacts}
  getKey={(contact) => contact.id}
  onAdd={() => setContacts([...contacts, blank()])}
  onRemove={(index) => setContacts(contacts.filter((_, i) => i !== index))}
  onMove={move}
  rowVariant="card"
>
  {(contact, { index }) => (
    <Stack direction="horizontal" gap="md">
      <Input value={contact.name} onChange={…} aria-label="Name" />
      <Input value={contact.email} onChange={…} aria-label="Email" />
    </Stack>
  )}
</Repeater>`}
			>
				<Stack style={MEASURE.wide}>
					<FormField htmlFor={false} label="Contacts" helperText="Drag a handle, or focus it and press ↑ / ↓.">
						<Repeater
							items={contacts}
							getKey={(contact) => contact.id}
							rowVariant="card"
							strings={{ add: "Add contact" }}
							onAdd={() =>
								setContacts((current) => [
									...current,
									{ id: String(current.length + 1), name: "", email: "" },
								])
							}
							onRemove={(index) => setContacts((current) => current.filter((_, i) => i !== index))}
							onMove={move}
						>
							{(contact, { index }) => (
								<Stack direction="horizontal" gap="md" style={{ width: "100%" }}>
									<Input
										value={contact.name}
										aria-label="Name"
										placeholder="Name"
										onChange={(event) =>
											setContacts((current) =>
												current.map((row, i) =>
													i === index ? { ...row, name: event.target.value } : row,
												),
											)
										}
									/>
									<Input
										value={contact.email}
										aria-label="Email"
										placeholder="name@example.com"
										onChange={(event) =>
											setContacts((current) =>
												current.map((row, i) =>
													i === index ? { ...row, email: event.target.value } : row,
												),
											)
										}
									/>
								</Stack>
							)}
						</Repeater>
					</FormField>
				</Stack>
			</Example>

			<Example
				id="string-repeater"
				title="StringRepeater"
				description="A repeater of plain strings, which is most of them — domains, tags, recipients. Reordering is the native drag API plus arrow keys on the handle. A pointer library brings its own dependency and, on its own, no keyboard story — and reordering is exactly what a keyboard user cannot improvise."
				stacked
				code={`<StringRepeater value={domains} onValueChange={setDomains} sortable />`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField htmlFor={false} label="Allowed domains" helperText="Drag the handle, or focus it and press ↑ / ↓.">
						<StringRepeater
							value={domains}
							onValueChange={setDomains}
							placeholder="example.com"
							sortable
							aria-label="Domain"
						/>
					</FormField>
					<FormField htmlFor={false} label="Empty" helperText="With a cap of three.">
						<StringRepeater value={[]} onValueChange={() => {}} maxItems={3} />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="key-value"
				title="KeyValueEditor"
				description="Pairs rather than an object, because an object cannot hold a half-typed key: clearing one to retype it would lose the row and its value with it. Duplicate keys are flagged as you type."
				stacked
				code={`<KeyValueEditor value={headers} onValueChange={setHeaders} sortable />`}
			>
				<Stack style={MEASURE.wide}>
					<FormField htmlFor={false} label="Request headers" helperText="Try entering the same key twice.">
						<KeyValueEditor value={headers} onValueChange={setHeaders} sortable />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="localized"
				title="LocalizedStringField"
				description="One value per locale, behind a locale switcher, so a translated field costs one row instead of one row per language. The value is an object keyed by locale code."
				stacked
				code={`<LocalizedStringField
  locales={[{ value: "en", label: "English" }, { value: "nl", label: "Nederlands" }]}
  value={name}
  onValueChange={setName}
/>`}
			>
				<Stack style={MEASURE.field}>
					<FormField htmlFor={false} label="Display name" helperText="Switch locale — the value follows.">
						<LocalizedStringField locales={LOCALES} value={name} onValueChange={setName} />
					</FormField>
				</Stack>
			</Example>

			<Example id="repeater-rule" title="It never owns the array" stacked>
				<Callout label="Rule">
					Every repeater is controlled. It takes the items and the handlers and renders
					them; it keeps no copy. A component that owned the list would have to
					reconcile with whatever the form library also thinks the list is, and the two
					drift the first time a reset or a server round-trip happens.
				</Callout>
			</Example>

			<Example id="repeater-api" title="API">
				<PropTable owner="Repeater"
					rows={[
						{ name: "items", type: "T[]", description: "The rows. Required — the repeater renders what it is given and nothing else." },
						{ name: "getKey", type: "(item: T, index: number) => string", description: "Stable identity per row. Index alone would re-key every row after a reorder and lose focus." },
						{ name: "children", type: "(item: T, context) => ReactNode", description: "Render prop for one row. context carries index and dragging." },
						{ name: "onAdd", type: "() => void", description: "Supplying it renders the add button." },
						{ name: "onRemove", type: "(index: number) => void", description: "Supplying it renders the per-row remove button." },
						{ name: "onMove", type: "(from: number, to: number) => void", description: "Supplying it enables reordering and renders the drag handle. The handle is the drag source, not the row." },
						{ name: "rowVariant", type: '"inline" | "card"', default: '"inline"', description: "card wraps each row in a bordered surface, for multi-field rows." },
						{ name: "maxItems", type: "number", description: "Hides the add button once reached." },
						{ name: "strings", type: "Partial<RepeaterStrings>", description: "Overrides this list's own copy. `remove` is a FUNCTION of the row index — every remove button in a list saying the same thing is a column of controls a screen reader cannot tell apart." },
						{ name: "emptyState", type: "ReactNode", description: "Shown in place of the rows when items is empty." },
						{ name: "StringRepeater sortable", type: "boolean", default: "false", description: "Adds the drag handle and arrow-key reordering." },
						{ name: "KeyValueEditor flagDuplicateKeys", type: "boolean", default: "true", description: "Marks a key already used elsewhere. A blank key is not a duplicate — it is an unfinished row." },
						{ name: "LocalizedStringField locales", type: "LocaleDescriptor[]", description: "Which locales the switcher offers, in order. The first is the default." },
						{ name: "showAdd", type: "boolean", description: "Hides the add control while keeping the rows, for a list at its cap or one whose entries come from elsewhere." },
						{ name: "ObjectRepeater value / fields", type: "ObjectRow[] / ObjectFieldDef[]", description: "A repeating row of several fields, described once as data rather than assembled per row. The component reads and writes the array it is given; renderField lets the caller connect individual fields to a form library." },
						{ name: "LocalizedStringRepeater / LocalizedObjectField", type: "component", description: "The same shapes with a locale axis: one value per language, with the active locale switchable in place. A translation UI built out of plain repeaters loses which language a row belongs to the moment rows reorder." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
