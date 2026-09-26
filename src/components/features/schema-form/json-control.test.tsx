import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SchemaForm } from "./schema-form"

/** The JSON field's draft: invalid text survives a blur untouched; valid text is reformatted. */
/* `fields` is the flat list; `sections` only groups them for layout. */
const schema = {
	fields: [{ key: "payload", type: "json" as const, label: "Payload" }],
}

function Form() {
	return <SchemaForm schema={schema} defaultValue={{ payload: { a: 1 } }} showActions={false} />
}

describe("SchemaForm json field", () => {
	it("shows the value formatted", () => {
		render(<Form />)

		const field = screen.getByLabelText("Payload") as HTMLTextAreaElement
		expect(field.value).toContain('"a"')
	})

	it("keeps what the reader typed while the field has focus", async () => {
		const user = userEvent.setup()
		render(<Form />)

		const field = screen.getByLabelText("Payload") as HTMLTextAreaElement
		await user.clear(field)
		await user.type(field, '{{"a": 2}')

		expect(field.value).toBe('{"a": 2}')
	})

	it("keeps invalid text on the screen after blur", async () => {
		/* The reader's mistake stays where they left it, so the error refers to text that is still there. */
		const user = userEvent.setup()
		render(<Form />)

		const field = screen.getByLabelText("Payload") as HTMLTextAreaElement
		await user.clear(field)
		await user.type(field, "{{not json")
		await user.tab()

		expect(field.value).toBe("{not json")
	})

	it("tidies up text that does parse, once focus leaves", async () => {
		const user = userEvent.setup()
		render(<Form />)

		const field = screen.getByLabelText("Payload") as HTMLTextAreaElement
		await user.clear(field)
		await user.type(field, '{{"a":3}')
		await user.tab()

		/* Reformatted with the field's indent. */
		expect(field.value).toContain('"a": 3')
	})
})
