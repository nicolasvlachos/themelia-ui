import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { defaultActivitiesStrings } from "./activities.strings"
import { useActivityFeed } from "./use-activity-feed"

describe("useActivityFeed", () => {
	it("reports each expanded activity id once when merged rows share an id", () => {
		const onExpandedIdsChange = vi.fn()
		const { result } = renderHook(() =>
			useActivityFeed({
				activities: [
					{ id: "42", event: "created", source: "audit-a" },
					{ id: "42", event: "updated", source: "audit-b" },
				],
				strings: defaultActivitiesStrings,
				onExpandedIdsChange,
			}),
		)

		act(() => result.current.expandAll())

		expect(onExpandedIdsChange).toHaveBeenLastCalledWith(["42"])
	})
})
