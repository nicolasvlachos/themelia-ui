import { act, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Toaster } from "./toaster"
import { createToastStore, toast, toastStore } from "./toast-store"

/** Two Toasters on one page keep separate queues and timers; the `toast()` singleton still works. */
const region = (label: string) => screen.getByRole("region", { name: label })

afterEach(() => {
	/* The singleton outlives the test; leave nothing on it for the next one. */
	act(() => toastStore.dismiss())
})

describe("Toaster", () => {
	it("renders only its own store's toasts", async () => {
		const a = createToastStore()
		const b = createToastStore()

		render(
			<>
				<Toaster store={a} strings={{ label: "Region A" }} />
				<Toaster store={b} strings={{ label: "Region B" }} />
			</>,
		)

		/* One toast in each region. */
		act(() => {
			a.toast("from A")
			b.toast("from B")
		})
		await waitFor(() => expect(screen.getByText("from B")).toBeInTheDocument())

		expect(within(region("Region A")).getByText("from A")).toBeInTheDocument()
		expect(within(region("Region A")).queryByText("from B")).toBeNull()
		expect(within(region("Region B")).getByText("from B")).toBeInTheDocument()
		expect(within(region("Region B")).queryByText("from A")).toBeNull()
	})

	it("dismissing one store leaves the other alone", async () => {
		const a = createToastStore()
		const b = createToastStore()

		render(
			<>
				<Toaster store={a} strings={{ label: "Region A" }} />
				<Toaster store={b} strings={{ label: "Region B" }} />
			</>,
		)

		act(() => {
			a.toast("from A")
			b.toast("from B")
		})
		await waitFor(() => expect(screen.getByText("from B")).toBeInTheDocument())

		act(() => a.dismiss())

		/* B's toast is untouched; A's is on its way out. */
		expect(within(region("Region B")).getByText("from B")).toBeInTheDocument()
	})

	it("pausing one store does not pause the other", async () => {
		// Hovering one Toaster must not pin the other's toasts open.
		const a = createToastStore()
		const b = createToastStore()

		render(
			<>
				<Toaster store={a} strings={{ label: "Region A" }} />
				<Toaster store={b} strings={{ label: "Region B" }} />
			</>,
		)

		act(() => {
			b.toast("from B", { duration: 20 })
		})
		await waitFor(() => expect(screen.getByText("from B")).toBeInTheDocument())

		act(() => a.pauseAll())

		/* B's own timer still runs, so its toast leaves on its own. */
		await waitFor(() => expect(screen.queryByText("from B")).toBeNull(), { timeout: 2_000 })
	})

	it("the singleton still works with no store prop", async () => {
		/* The singleton needs no wiring. */
		render(<Toaster strings={{ label: "Default region" }} />)

		act(() => {
			toast("Saved")
		})

		await waitFor(() =>
			expect(within(region("Default region")).getByText("Saved")).toBeInTheDocument(),
		)
	})

	it("a store-bound Toaster ignores the singleton", async () => {
		const own = createToastStore()
		render(<Toaster store={own} strings={{ label: "Own region" }} />)

		act(() => {
			toast("through the singleton")
		})

		/* Nothing to wait for — assert it never arrives. */
		await new Promise((resolve) => setTimeout(resolve, 50))
		expect(screen.queryByText("through the singleton")).toBeNull()
	})
})
