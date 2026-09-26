import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FormField } from "@/components/base/forms"

import { AvatarUpload, ImageUpload } from "./media-upload"

describe("single image pickers", () => {
	it("names an empty picker as an add action and a filled picker as a change action", () => {
		const { rerender } = render(<AvatarUpload />)
		expect(screen.getByLabelText("Add a photo")).toHaveAttribute("type", "file")
		rerender(<AvatarUpload previewUrl="/photo.png" />)
		expect(screen.getByLabelText("Change photo")).toHaveAttribute("type", "file")
	})

	it("clears a stored preview in uncontrolled mode and accepts a new preview later", () => {
		const onValueChange = vi.fn()
		const { container, rerender } = render(<ImageUpload previewUrl="/old.png" onValueChange={onValueChange} />)
		fireEvent.click(screen.getByRole("button", { name: "Remove image" }))
		expect(onValueChange).toHaveBeenCalledWith(undefined)
		expect(container.querySelector("img")).toBeNull()
		expect(screen.queryByRole("button", { name: "Remove image" })).toBeNull()
		rerender(<ImageUpload previewUrl="/new.png" onValueChange={onValueChange} />)
		expect(container.querySelector("img")).toHaveAttribute("src", "/new.png")
	})

	it("lets the consumer own removal when value is controlled", () => {
		const onValueChange = vi.fn()
		const { container, rerender } = render(<ImageUpload value={null} previewUrl="/stored.png" onValueChange={onValueChange} />)
		fireEvent.click(screen.getByRole("button", { name: "Remove image" }))
		expect(onValueChange).toHaveBeenCalledWith(undefined)
		expect(container.querySelector("img")).toHaveAttribute("src", "/stored.png")
		rerender(<ImageUpload value={null} onValueChange={onValueChange} />)
		expect(container.querySelector("img")).toBeNull()
	})

	it("forwards form errors and descriptions to the file input", () => {
		render(<ImageUpload invalid aria-label="Cover" aria-describedby="cover-help" aria-required />)
		expect(screen.getByLabelText("Cover")).toHaveAttribute("aria-invalid", "true")
		expect(screen.getByLabelText("Cover")).toHaveAttribute("aria-describedby", "cover-help")
		expect(screen.getByLabelText("Cover")).toHaveAttribute("aria-required", "true")
	})

	it("is named by its field and by what it does", () => {
		render(
			<FormField label="Logo">
				<ImageUpload />
			</FormField>,
		)
		const input = document.querySelector("input[type=file]")
		expect(input).toHaveAccessibleName(/^Logo .+/)
	})
})
