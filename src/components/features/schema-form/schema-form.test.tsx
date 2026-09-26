import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SchemaForm } from "./schema-form"
import { useSchemaForm } from "./use-schema-form"
import { defaultSchemaFormStrings } from "./schema-form.strings"

describe("schema form interaction contracts", () => {
	it("keeps consecutive helper updates in one event", () => {
		const { result } = renderHook(() => useSchemaForm({ fields: [], ...defaultSchemaFormStrings }))
		act(() => { result.current.setFieldValue("name", "Ada"); result.current.setFieldValue("team", "Design") })
		expect(result.current.values).toEqual({ name: "Ada", team: "Design" })
	})
	it("does not submit invalid JSON, and recovers after correction", async () => {
		const onSubmit = vi.fn()
		const { container } = render(<SchemaForm schema={{ fields: [{ key: "payload", type: "json", label: "Payload" }] }} onSubmit={onSubmit} />)
		const input = screen.getByLabelText("Payload")
		fireEvent.change(input, { target: { value: "{broken" } })
		fireEvent.submit(container.querySelector("form")!)
		expect(onSubmit).not.toHaveBeenCalled()
		fireEvent.change(input, { target: { value: '{"ok":true}' } })
		fireEvent.submit(container.querySelector("form")!)
		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
		expect(onSubmit.mock.calls[0]![0]).toEqual({ payload: { ok: true } })
	})
	it("owns pending state and prevents a duplicate submission", async () => {
		let finish!: () => void
		const onSubmit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
		const { container } = render(<SchemaForm schema={{ fields: [{ key: "name", label: "Name" }] }} onSubmit={onSubmit} onReset={vi.fn()} />)
		const form = container.querySelector("form")!
		fireEvent.submit(form)
		fireEvent.submit(form)
		expect(onSubmit).toHaveBeenCalledTimes(1)
		expect(form).toHaveAttribute("aria-busy", "true")
		expect(screen.getByRole("button", { name: "Reset" })).toBeDisabled()
		await act(async () => finish())
		expect(form).not.toHaveAttribute("aria-busy", "true")
	})
	it("focuses the first field that fails schema validation", async () => {
		const { container } = render(<SchemaForm schema={{ fields: [{ key: "name", label: "Name", required: true }] }} onSubmit={vi.fn()} />)
		fireEvent.submit(container.querySelector("form")!)
		await waitFor(() => expect(screen.getByLabelText(/Name/)).toHaveFocus())
	})
	it("clears an invalid JSON draft and validity on reset", () => {
		const onSubmit = vi.fn()
		const { container } = render(<SchemaForm schema={{ fields: [{ key: "payload", type: "json", label: "Payload", defaultValue: { ok: true } }] }} onSubmit={onSubmit} onReset={vi.fn()} />)
		const input = screen.getByLabelText("Payload") as HTMLTextAreaElement
		fireEvent.change(input, { target: { value: "{broken" } })
		fireEvent.click(screen.getByRole("button", { name: "Reset" }))
		expect(input.value).toContain('"ok": true')
		expect(input.checkValidity()).toBe(true)
		fireEvent.submit(container.querySelector("form")!)
		expect(onSubmit).toHaveBeenCalledTimes(1)
	})
	it("keeps values and offers feedback after a failed submission", async () => {
		const onSubmit = vi.fn().mockRejectedValueOnce(new Error("Unavailable")).mockResolvedValueOnce(undefined)
		const { container } = render(<SchemaForm schema={{ fields: [{ key: "name", label: "Name", defaultValue: "Ada" }] }} onSubmit={onSubmit} />)
		fireEvent.submit(container.querySelector("form")!)
		await screen.findByText("Changes could not be saved. Please try again.")
		expect(screen.getByLabelText("Name")).toHaveValue("Ada")
		fireEvent.submit(container.querySelector("form")!)
		await waitFor(() => expect(screen.queryByText("Changes could not be saved. Please try again.")).not.toBeInTheDocument())
	})

})
