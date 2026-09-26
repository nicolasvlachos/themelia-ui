import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, expectTypeOf, it, vi } from "vitest"
import { FormField } from "@/components/base/forms"
import { SliderField } from "./slider"
import { TagsInput } from "./tags-input"
import { PhoneInput } from "./phone-input"

describe("value input contracts", () => {
	it("keeps a read-only phone prefix and text unchanged", () => {
		const onChange = vi.fn()
		render(<PhoneInput aria-label="Phone" defaultValue="0123" defaultPrefix="GB" readOnly onChange={onChange} />)
		fireEvent.blur(screen.getByRole("textbox"))
		expect(screen.getByRole("textbox")).toHaveValue("0123")
		expect(screen.getByRole("combobox")).toBeDisabled()
		expect(onChange).not.toHaveBeenCalled()
	})
	it("names the slider and exposes its validation message through FormField", () => {
		render(<FormField label="Volume" error="Choose at least 50"><SliderField defaultValue={40} /></FormField>)
		const slider = screen.getByRole("slider", { name: "Volume" })
		expect(slider).toHaveAccessibleDescription("Choose at least 50")
		expect(slider).toHaveAttribute("aria-invalid", "true")
	})
	it("infers scalar and range callback values", () => {
		expect(<SliderField value={40} onValueChange={value => expectTypeOf(value).toEqualTypeOf<number>()} />).toBeTruthy()
		expect(<SliderField value={[20, 70]} onValueChange={value => expectTypeOf(value).toEqualTypeOf<number[]>()} onChange={event => expectTypeOf(event.target.value).toEqualTypeOf<number[]>()} />).toBeTruthy()
	})
	it("updates an uncontrolled slider readout and named form value", () => {
		const { container } = render(<form><SliderField name="volume" defaultValue={40} showValue unit="%" /></form>)
		fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" })
		expect(screen.getByText("41%")).toBeInTheDocument()
		expect(new FormData(container.querySelector("form")!).get("volume")).toBe("41")
	})
	it("does not commit tags while an IME is composing", () => {
		const onValueChange = vi.fn()
		render(<TagsInput aria-label="Tags" onValueChange={onValueChange} />)
		const input = screen.getByRole("textbox")
		fireEvent.change(input, { target: { value: "東京" } })
		fireEvent.keyDown(input, { key: "Enter", isComposing: true })
		expect(onValueChange).not.toHaveBeenCalled()
		expect(input).toHaveValue("東京")
	})
	it("keeps rejected pasted tags available for correction", () => {
		const onValueChange = vi.fn()
		render(<TagsInput aria-label="Tags" maxLength={4} onValueChange={onValueChange} />)
		const input = screen.getByRole("textbox")
		fireEvent.paste(input, { clipboardData: { getData: () => "good,too-long" } })
		expect(onValueChange).toHaveBeenCalledWith(["good"])
		expect(input).toHaveValue("too-long")
	})
	it("omits disabled tags from form submission", () => {
		const { container } = render(<form><TagsInput name="tags" defaultValue={["one"]} disabled /></form>)
		expect(new FormData(container.querySelector("form")!).getAll("tags[]")).toEqual([])
	})
	it("splits typed tags using the configured delimiter", () => {
		const onValueChange = vi.fn()
		render(<TagsInput aria-label="Tags" delimiter=";" onValueChange={onValueChange} />)
		const input = screen.getByRole("textbox")
		fireEvent.change(input, { target: { value: "one;two" } })
		fireEvent.keyDown(input, { key: "Enter" })
		expect(onValueChange).toHaveBeenCalledWith(["one", "two"])
	})
	it("keeps the tag input reachable at its limit so keyboard removal still works", () => {
		render(<TagsInput aria-label="Tags" defaultValue={["one"]} maxTags={1} />)
		const input = screen.getByRole("textbox")
		expect(input).toBeEnabled()
		fireEvent.keyDown(input, { key: "Backspace" })
		expect(screen.queryByRole("button", { name: "Remove one" })).not.toBeInTheDocument()
	})
})

describe("PhoneInput country", () => {
	const openPicker = async () => {
		fireEvent.click(screen.getByRole("combobox", { name: "Country dial code" }))
		return screen.findAllByRole("option")
	}
	const selected = (options: HTMLElement[]) =>
		options.filter((option) => option.getAttribute("aria-selected") === "true").map((option) => option.textContent)

	it("keeps Canada selected although it shares +1 with the United States", async () => {
		const onPrefixChange = vi.fn()
		render(<PhoneInput aria-label="Phone" defaultPrefix="CA" onPrefixChange={onPrefixChange} />)
		expect(selected(await openPicker())).toEqual([expect.stringContaining("Canada")])
	})

	it("resolves a caller's own country to its dial code", async () => {
		const onPrefixChange = vi.fn()
		render(
			<PhoneInput
				aria-label="Phone"
				prefixes={["US", { value: "+999", label: "Freedonia", iso: "FD" }]}
				defaultPrefix="FD"
				onPrefixChange={onPrefixChange}
			/>,
		)
		const options = await openPicker()
		expect(selected(options)).toEqual([expect.stringContaining("Freedonia")])
		await userEvent.click(options[0]!)
		expect(onPrefixChange).toHaveBeenLastCalledWith("+1")
	})

	it("reports a caller's own country's dial code when picked", async () => {
		const onPrefixChange = vi.fn()
		render(
			<PhoneInput
				aria-label="Phone"
				prefixes={["US", { value: "+999", label: "Freedonia", iso: "FD" }]}
				onPrefixChange={onPrefixChange}
			/>,
		)
		await userEvent.click((await openPicker())[1]!)
		expect(onPrefixChange).toHaveBeenLastCalledWith("+999")
	})
})
