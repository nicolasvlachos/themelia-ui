import { useMemo, useRef, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { MediaLibrary, type MediaLibraryFetcher } from "themelia-ui/features/media-library"

import { ASSETS, COLLECTIONS } from "./data"

/** A local stand-in for a service: cancellation, filtering and sorting belong here. */
export default function AsyncLibrary() {
	const [scenario, setScenario] = useState<{ kind: "assets" | "failure" | "empty" }>({ kind: "assets" })
	const [selected, setSelected] = useState<string[]>([])
	const [attached, setAttached] = useState("")
	const failurePending = useRef(false)
	const load = (kind: "assets" | "failure" | "empty") => {
		failurePending.current = kind === "failure"
		setScenario({ kind })
	}
	const fetcher = useMemo<MediaLibraryFetcher>(() => {
		return async ({ query, type, collection, sort, signal }) => {
			await new Promise<void>((resolve, reject) => {
				const cancel = () => {
					clearTimeout(timer)
					reject(new DOMException("Request cancelled", "AbortError"))
				}
				const timer = setTimeout(() => {
					signal?.removeEventListener("abort", cancel)
					resolve()
				}, 700)
				if (signal?.aborted) cancel()
				else signal?.addEventListener("abort", cancel, { once: true })
			})
			if (failurePending.current) {
				failurePending.current = false
				throw new Error("Simulated service interruption")
			}
			const needle = query.trim().toLowerCase()
			const items = (scenario.kind === "empty" ? [] : ASSETS).filter((asset) =>
				(type === "all" || asset.type === type)
				&& (!collection || asset.collection === collection)
				&& `${asset.name} ${asset.collection} ${asset.tags?.join(" ")}`.toLowerCase().includes(needle),
			)
			items.sort((left, right) => {
				if (sort === "name") return left.name.localeCompare(right.name)
				if (sort === "size") return (right.size ?? 0) - (left.size ?? 0)
				if (sort === "usage") return (right.usageCount ?? 0) - (left.usageCount ?? 0)
				return new Date(right.uploadedAt!).getTime() - new Date(left.uploadedAt!).getTime()
			})
			return { items, total: items.length }
		}
	}, [scenario])

	return (
		<Stack gap="sm">
			<Stack gap="sm" direction="horizontal" wrap>
				<Button type="button" tone="neutral" appearance="outline" onClick={() => load("assets")}>
					Load sample assets
				</Button>
				<Button type="button" tone="neutral" appearance="outline" onClick={() => load("failure")}>
					Simulate failure
				</Button>
				<Button type="button" tone="neutral" appearance="outline" onClick={() => load("empty")}>
					Show empty library
				</Button>
			</Stack>
			<MediaLibrary
				fetcher={fetcher}
				collections={COLLECTIONS}
				allowUpload={false}
				strings={{ emptyDescription: "This sample library is empty. Load sample assets to continue." }}
				value={selected}
				onValueChange={setSelected}
				onConfirm={(items) => setAttached(`Attached ${items.length} ${items.length === 1 ? "asset" : "assets"}: ${items.map(item => item.name).join(", ")}.`)}
			/>
			<Text role="status" type="secondary">{attached || "Choose assets and use the selection to attach them."}</Text>
		</Stack>
	)
}
