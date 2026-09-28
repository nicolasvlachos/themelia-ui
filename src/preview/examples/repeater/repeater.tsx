import { useState } from "react"

import { Input } from "themelia-ui/base/text-inputs"
import { FormField } from "themelia-ui/base/forms"
import { Repeater } from "themelia-ui/base/repeaters"
import { Stack } from "themelia-ui/base/structure"


type Contact = { id: string; name: string; email: string }

export default function RepeaterExample() {
	const [contacts, setContacts] = useState<Contact[]>([
		{ id: "a", name: "Jamie Moreau", email: "jamie@acme.com" },
		{ id: "b", name: "Rin Fujita", email: "rin@acme.com" },
	])

	const move = (from: number, to: number) =>
		setContacts((current) => {
			if (to < 0 || to >= current.length) return current
			const next = [...current]
			next.splice(to, 0, ...next.splice(from, 1))
			return next
		})

	return (
		<Stack gap="sm" style={{ maxWidth: "34rem", width: "100%" }}>
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
						<Stack direction="horizontal" gap="sm" style={{ width: "100%" }}>
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
	)
}
