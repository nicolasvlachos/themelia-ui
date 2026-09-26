import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MediaLibrary } from "./media-library"
import { defaultMediaLibraryStrings, type MediaLibraryStrings } from "./media-library.strings"
import type { MediaLibraryFetchParams, MediaLibraryItem } from "./media-library.types"

describe("MediaLibrary recovery states", () => {
	it("keeps existing complete translations compatible and supplies the default retry label", async () => {
		const legacyStrings: Omit<MediaLibraryStrings, "retry"> = { ...defaultMediaLibraryStrings }
		Reflect.deleteProperty(legacyStrings, "retry")
		const strings: MediaLibraryStrings = legacyStrings
		render(<MediaLibrary allowUpload={false} strings={strings}
			fetcher={async () => { throw new Error("Offline") }} />)
		const alert = await screen.findByRole("alert")
		expect(within(alert).getByRole("button", { name: "Try again" })).toBeEnabled()
	})

	it("announces a new request outside the busy results and replaces the previous count", async () => {
		let finish!: (items: MediaLibraryItem[]) => void
		const fetcher = async ({ query }: MediaLibraryFetchParams) => {
			if (!query) return [{ id: "hall", name: "Hall.jpg", type: "image" as const }]
			return new Promise<MediaLibraryItem[]>((resolve) => { finish = resolve })
		}
		const { container } = render(<MediaLibrary fetcher={fetcher} allowUpload={false}
			strings={{ loading: "Recherche en cours…" }} />)
		const announcement = (await screen.findByText("1 of 1")).closest('[aria-live="polite"]')!
		fireEvent.change(screen.getByRole("textbox", { name: "Search assets…" }), { target: { value: "missing" } })
		await waitFor(() => expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument())
		expect(announcement).toHaveTextContent("Recherche en cours…")
		expect(announcement).not.toHaveTextContent("1 of 1")
		expect(announcement.closest('[aria-busy="true"]')).toBeNull()
		expect(announcement).toHaveAttribute("role", "status")
		const results = container.querySelector<HTMLElement>('[aria-busy="true"]')!
		expect(results).toBeInTheDocument()
		expect(within(results).queryByRole("status")).not.toBeInTheDocument()
		await act(async () => finish([]))
		expect(announcement).toHaveTextContent("0 of 0")
		expect(announcement).not.toHaveTextContent("Recherche en cours…")
		expect(announcement).toBeInTheDocument()
	})

	it("announces a translated fetch failure and retry progress, then returns selectable assets", async () => {
		let attempt = 0
		let finish!: (items: MediaLibraryItem[]) => void
		const fetcher = async () => {
			if (++attempt === 1) throw new Error("Offline")
			return new Promise<MediaLibraryItem[]>((resolve) => { finish = resolve })
		}
		const { container } = render(<MediaLibrary fetcher={fetcher} allowUpload={false}
			strings={{ error: "Chargement impossible", retry: "Réessayer", loading: "Chargement…" }} />)
		const alert = await screen.findByRole("alert")
		expect(alert).toHaveTextContent("Chargement impossible")
		fireEvent.click(within(alert).getByRole("button", { name: "Réessayer" }))
		expect(screen.getByRole("status")).toHaveTextContent("Chargement…")
		expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		await act(async () => finish([{ id: "hall", name: "Hall.jpg", type: "image" }]))
		expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument()
		expect(screen.getByRole("status")).toHaveTextContent("1 of 1")
		const asset = screen.getByRole("button", { name: "Select: Hall.jpg" })
		fireEvent.click(asset)
		expect(asset).toHaveAttribute("aria-pressed", "true")
	})

	it("keeps failed edits recoverable in the detail panel without offering a fetch retry", async () => {
		const asset: MediaLibraryItem = { id: "hall", name: "Hall.jpg", type: "image" }
		const fetcher = async () => [asset]
		let failures = 0
		render(<MediaLibrary fetcher={fetcher} allowUpload={false}
			onItemUpdate={async () => { if (++failures === 1) throw new Error("Save failed") }} />)
		fireEvent.click(await screen.findByRole("button", { name: /^Details:/ }))
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
		await screen.findByRole("alert")
		expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
		await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument())
		expect(screen.getByRole("button", { name: "Select: Hall.jpg" })).toBeVisible()
	})
})
