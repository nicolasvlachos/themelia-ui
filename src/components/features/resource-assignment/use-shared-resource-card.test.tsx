// @vitest-environment jsdom
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { SharedResourceSelectorProps } from "./resource-assignment.types"
import { SharedResourceCard } from "./resource-assignment"
import { useSharedResourceCard } from "./use-shared-resource-card"

const nativeShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal")

beforeEach(() => {
	Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
		configurable: true,
		value(this: HTMLDialogElement) { this.open = true },
	})
})

afterEach(() => {
	if (nativeShowModal) Object.defineProperty(HTMLDialogElement.prototype, "showModal", nativeShowModal)
	else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal")
})

function deferred() {
	let resolve!: () => void
	const promise = new Promise<void>((done) => { resolve = done })
	return { promise, resolve }
}

describe("useSharedResourceCard", () => {
	it.each([
		["Assign", null],
		["Change", { id: "venue-a" }],
	] as const)("focuses the %s trigger before opening from a pointer click", (name, resource) => {
		let activeWhenOpening: Element | null = null
		render(
			<SharedResourceCard
				title="Venue"
				resource={resource}
				selector={{
					title: "Choose a venue",
					confirmText: "Assign venue",
					cancelText: "Cancel",
					SelectorComponent: () => <p>Available venues</p>,
					mapInitialSelected: () => null,
					onConfirmSelection: vi.fn(),
					onOpenChange: () => { activeWhenOpening = document.activeElement },
				}}
			/>,
		)
		const trigger = screen.getByRole("button", { name })
		fireEvent.click(trigger)
		expect(activeWhenOpening).toBe(trigger)
		expect(screen.getByRole("dialog", { name: "Choose a venue" })).toBeVisible()
	})

	it("names the assignment dialog from its visible title", async () => {
		function Selector({ onSelect }: SharedResourceSelectorProps<{ id: string }>) {
			return <button onClick={() => onSelect({ id: "venue-a" })}>Venue A</button>
		}

		render(
			<SharedResourceCard
				title="Venue"
				resource={null}
				selector={{
					title: "Choose a venue",
					description: "Available for this booking.",
					confirmText: "Assign venue",
					cancelText: "Cancel",
					SelectorComponent: Selector,
					mapInitialSelected: () => null,
					onConfirmSelection: vi.fn(),
				}}
			/>,
		)

		await userEvent.click(screen.getByRole("button", { name: "Assign" }))
		const dialog = screen.getByRole("dialog", { name: "Choose a venue" })
		expect(dialog).toHaveAccessibleDescription("Available for this booking.")
	})

	it("starts only one confirmation while the first callback is pending", async () => {
		const pending = deferred()
		const onConfirmSelection = vi.fn(() => pending.promise)
		const { result } = renderHook(() =>
			useSharedResourceCard({
				resource: null,
				mapInitialSelected: () => null,
				onConfirmSelection,
				defaultOpen: true,
				defaultValue: { id: "venue-a" },
			}),
		)

		let first!: Promise<void>
		let second!: Promise<void>
		act(() => {
			first = result.current.confirmSelection()
			second = result.current.confirmSelection()
		})

		expect(onConfirmSelection).toHaveBeenCalledTimes(1)
		await act(async () => pending.resolve())
		await Promise.all([first, second])
	})

	it("does not let an old confirmation close a newly reopened selection cycle", async () => {
		const pending = deferred()
		const onOpenChange = vi.fn()
		const onValueChange = vi.fn()
		const selectionA = { id: "venue-a" }
		const selectionB = { id: "venue-b" }
		const options = {
			resource: null,
			mapInitialSelected: () => null,
			onConfirmSelection: () => pending.promise,
			onOpenChange,
			onValueChange,
		}
		const { result, rerender } = renderHook(
			({ open, value }) => useSharedResourceCard({ ...options, open, value }),
			{ initialProps: { open: true, value: selectionA } },
		)

		let confirmation!: Promise<void>
		act(() => { confirmation = result.current.confirmSelection() })
		rerender({ open: false, value: selectionA })
		rerender({ open: true, value: selectionB })
		onOpenChange.mockClear()
		onValueChange.mockClear()

		await act(async () => pending.resolve())
		await confirmation

		expect(onOpenChange).not.toHaveBeenCalledWith(false)
		expect(onValueChange).not.toHaveBeenCalledWith(null)
		expect(result.current.selectedSuggestion).toEqual(selectionB)
	})
})
