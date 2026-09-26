import { useState } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { useNativeDialog } from "./use-native-dialog"

// jsdom has no native dialog methods; emulate only the browser's open attribute.
const prototype = HTMLDialogElement.prototype
const nativeShow = Object.getOwnPropertyDescriptor(prototype, "show")
const nativeClose = Object.getOwnPropertyDescriptor(prototype, "close")
beforeAll(() => {
	Object.defineProperty(prototype, "show", { configurable: true, value(this: HTMLDialogElement) { this.open = true } })
	Object.defineProperty(prototype, "close", { configurable: true, value(this: HTMLDialogElement) { this.open = false } })
})
afterAll(() => {
	if (nativeShow) Object.defineProperty(prototype, "show", nativeShow)
	else Reflect.deleteProperty(prototype, "show")
	if (nativeClose) Object.defineProperty(prototype, "close", nativeClose)
	else Reflect.deleteProperty(prototype, "close")
})

function Inspector({ escape = true, nested = false }: { escape?: boolean; nested?: boolean }) {
	const [open, setOpen] = useState(true)
	const { ref, onClose, onCancel } = useNativeDialog({ open, onOpenChange: setOpen, modal: false, closeOnEscape: escape })
	return <dialog ref={ref} onClose={onClose} onCancel={onCancel} aria-label="Inspector"><button onKeyDown={nested ? (event) => event.preventDefault() : undefined}>Control</button></dialog>
}

describe("non-modal keyboard dismissal", () => {
	it("closes when Escape reaches the panel", () => {
		render(<Inspector />)
		fireEvent.keyDown(screen.getByRole("button", { name: "Control" }), { key: "Escape" })
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
	})
	it("honors a disabled Escape dismissal", () => {
		render(<Inspector escape={false} />)
		fireEvent.keyDown(screen.getByRole("button", { name: "Control" }), { key: "Escape" })
		expect(screen.getByRole("dialog")).toBeVisible()
	})
	it("lets a nested control consume Escape first", () => {
		render(<Inspector nested />)
		fireEvent.keyDown(screen.getByRole("button", { name: "Control" }), { key: "Escape" })
		expect(screen.getByRole("dialog")).toBeVisible()
	})
})
