import { act, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { MediaLibrary } from "./media-library"
import { useMediaLibrary } from "./use-media-library"
import type { MediaLibraryItem, MediaLibraryUploadHandler } from "./media-library.types"

const photo: MediaLibraryItem = { id: "photo", name: "Hall.jpg", type: "image", alt: "Hall at sunset", collection: "venues", tags: ["hero"], public: true }
const file: MediaLibraryItem = { id: "file", name: "Plan.pdf", type: "file", size: 2400 }
const collections = [{ value: "venues", label: "Venues" }]
function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (error: unknown) => void
	const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
	return { promise, resolve, reject }
}

describe("media manager interactions", () => {
	it("seeds metadata on the first open and retains the draft and grid after a failed save", async () => {
		const onItemUpdate = vi.fn().mockRejectedValueOnce(new Error("Offline")).mockResolvedValue(undefined)
		render(<MediaLibrary items={[photo]} collections={collections} allowUpload={false} onItemUpdate={onItemUpdate} />)
		fireEvent.click(screen.getByRole("button", { name: /Details/ }))
		const alt = screen.getByRole("textbox", { name: "Alt text" })
		expect(alt).toHaveValue("Hall at sunset")
		fireEvent.change(alt, { target: { value: "A new description" } })
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
		await screen.findByRole("alert")
		expect(alt).toHaveValue("A new description")
		expect(screen.getByRole("button", { name: "Select: Hall.jpg" })).toBeVisible()
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
		await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument())
		expect(onItemUpdate).toHaveBeenLastCalledWith(photo, expect.objectContaining({ alt: "A new description", public: true, tags: ["hero"] }))
	})

	it("keeps a deleting asset and its panel present until success and prevents duplicate deletion", async () => {
		const pending = deferred<void>()
		const onItemDelete = vi.fn(() => pending.promise)
		render(<MediaLibrary items={[photo]} allowUpload={false} onItemDelete={onItemDelete} />)
		fireEvent.click(screen.getByRole("button", { name: /Details/ }))
		const remove = screen.getByRole("button", { name: "Delete" })
		fireEvent.click(remove)
		fireEvent.click(remove)
		expect(onItemDelete).toHaveBeenCalledTimes(1)
		expect(screen.getByRole("complementary", { name: "Hall.jpg" })).toBeVisible()
		await act(async () => pending.reject(new Error("Delete failed")))
		expect(screen.getByRole("alert")).toBeVisible()
		expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled()
	})

	it("renders a real table and forwards native section attributes", () => {
		render(<MediaLibrary items={[photo, file]} allowUpload={false} defaultView="table" aria-label="Assets" data-testid="manager" />)
		expect(screen.getByTestId("manager")).toHaveAttribute("aria-label", "Assets")
		const table = screen.getByRole("table")
		expect(within(table).getByRole("columnheader", { name: "Name" })).toBeVisible()
		expect(within(table).getByRole("columnheader", { name: "Size" })).toBeVisible()
	})
})

describe("media library API", () => {
	it("retains selected records across remote query changes in selection order", async () => {
		const onValueChange = vi.fn()
		const fetcher = async ({ query }: { query: string }) => query ? [file] : [photo]
		const { result } = renderHook(() => useMediaLibrary({ fetcher, onValueChange }))
		await waitFor(() => expect(result.current.items).toEqual([photo]))
		act(() => result.current.toggleSelection(photo.id))
		act(() => result.current.setQuery("plan"))
		await waitFor(() => expect(result.current.items).toEqual([file]))
		expect(result.current.selectedItems).toEqual([photo])
		act(() => result.current.toggleSelection(file.id))
		expect(onValueChange).toHaveBeenLastCalledWith([photo.id, file.id], [photo, file])
	})

	it("normalizes duplicate and single selections, and ignores unknown toggles", () => {
		const { result } = renderHook(() => useMediaLibrary({ items: [photo, file], selectionMode: "single", defaultValue: [photo.id, photo.id, file.id] }))
		expect(result.current.selectedIds).toEqual([photo.id])
		act(() => result.current.toggleSelection("missing"))
		expect(result.current.selectedIds).toEqual([photo.id])
	})

	it("supports patches for consumer-owned record shapes", async () => {
		const item = { key: "hall", title: "Hall", description: "Old" }
		const { result } = renderHook(() => useMediaLibrary({
			items: [item],
			accessors: { getId: (entry) => entry.key, getName: (entry) => entry.title, getType: () => "image", getAlt: (entry) => entry.description },
			applyItemPatch: (entry, patch) => ({ ...entry, description: patch.alt ?? entry.description }),
		}))
		await act(async () => { await result.current.updateItem(item, { alt: "New" }) })
		expect(result.current.accessors.getAlt(result.current.items[0]!)).toBe("New")
	})

	it("does not report upload success when no upload handler is supplied", async () => {
		const { result } = renderHook(() => useMediaLibrary({ items: [] }))
		act(() => result.current.addFiles([new File(["x"], "notes.txt")]))
		await act(async () => { await result.current.startUpload() })
		expect(result.current.stagedFiles).toHaveLength(1)
		expect(result.current.stagedFiles[0]!.status).toBe("staged")
	})

	it("gives uploads stable file IDs, deduplicates starts, and resolves newly selected records", async () => {
		const pending = deferred<MediaLibraryItem[]>()
		const onValueChange = vi.fn()
		const onUpload = vi.fn<MediaLibraryUploadHandler>((_files, _options, helpers) => {
			expect(helpers.files).toHaveLength(1)
			helpers.setProgress(helpers.files![0]!.id, 40)
			return pending.promise
		})
		const { result } = renderHook(() => useMediaLibrary({ items: [], onUpload, onValueChange }))
		act(() => result.current.addFiles([new File(["x"], "notes.txt")]))
		act(() => { void result.current.startUpload(); void result.current.startUpload() })
		expect(onUpload).toHaveBeenCalledTimes(1)
		expect(result.current.stagedFiles[0]!.progress).toBe(40)
		await act(async () => pending.resolve([file]))
		expect(onValueChange).toHaveBeenLastCalledWith([file.id], [file])
	})
})

it("retries only failed uploads and ignores late progress from completed and cancelled batches", async () => {
	let oldHelpers: Parameters<MediaLibraryUploadHandler>[2] | undefined
	const onUpload = vi.fn<MediaLibraryUploadHandler>(async (_files, _options, helpers) => {
		oldHelpers = helpers
		if (helpers.files!.length === 2) helpers.setFileStatus(helpers.files![1]!.id, "error", "Try again")
		return []
	})
	const { result } = renderHook(() => useMediaLibrary({ onUpload, defaultTab: "upload" }))
	act(() => result.current.addFiles([new File(["a"], "a.txt"), new File(["b"], "b.txt")]))
	await act(async () => { await result.current.startUpload() })
	expect(result.current.stagedFiles.map(file => file.name)).toEqual(["b.txt"])
	expect(result.current.stagedFiles[0]!.status).toBe("error")
	act(() => oldHelpers!.setProgress(oldHelpers!.files![1]!.id, 100))
	expect(result.current.stagedFiles[0]!.progress).toBe(0)
	await act(async () => { await result.current.startUpload() })
	expect(onUpload.mock.calls[1]![0].map(file => file.name)).toEqual(["b.txt"])
	expect(result.current.stagedFiles).toEqual([])
})

it("keeps cancelled files ready to retry and blocks queue changes during upload", async () => {
	const pending = deferred<MediaLibraryItem[]>()
	let helpers: Parameters<MediaLibraryUploadHandler>[2] | undefined
	const { result } = renderHook(() => useMediaLibrary({ onUpload: async (_files, _options, next) => { helpers = next; return pending.promise } }))
	act(() => result.current.addFiles([new File(["a"], "a.txt")]))
	act(() => { void result.current.startUpload(); result.current.clearStagedFiles(); result.current.addFiles([new File(["b"], "b.txt")]) })
	expect(result.current.stagedFiles).toHaveLength(1)
	act(() => result.current.cancelUpload())
	expect(helpers!.signal.aborted).toBe(true)
	await act(async () => { helpers!.setProgress(helpers!.files![0]!.id, 100); pending.resolve([file]) })
	expect(result.current.stagedFiles[0]!.status).toBe("staged")
	expect(result.current.items).toEqual([])
})

it("does not restart remote queries when accessors change", async () => {
	const fetcher = vi.fn(async () => [photo])
	const { result, rerender } = renderHook(({ prefix }) => useMediaLibrary({ fetcher, accessors: { getName: item => `${prefix}${item.name}` } }), { initialProps: { prefix: "" } })
	await waitFor(() => expect(result.current.items).toHaveLength(1))
	rerender({ prefix: "Asset: " })
	expect(result.current.accessors.getName(photo)).toBe("Asset: Hall.jpg")
	expect(fetcher).toHaveBeenCalledTimes(1)
})

it("does not restore a successfully deleted asset when a concurrent delete fails", async () => {
	const first = deferred<void>()
	const second = deferred<void>()
	const onItemDelete = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
	const { result } = renderHook(() => useMediaLibrary({ items: [photo], onItemDelete }))
	act(() => { void result.current.removeItem(photo); void result.current.removeItem(photo) })
	await act(async () => first.resolve())
	expect(result.current.items).toEqual([])
	await act(async () => second.reject(new Error("Already deleted")))
	expect(result.current.items).toEqual([])
})
