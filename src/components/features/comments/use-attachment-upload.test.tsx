import { StrictMode, type PropsWithChildren } from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useAttachmentUpload } from "./use-attachment-upload"

function StrictWrapper({ children }: PropsWithChildren) {
	return <StrictMode>{children}</StrictMode>
}

describe("useAttachmentUpload", () => {
	it("starts one upload per staged file in Strict Mode", async () => {
		const onUpload = vi.fn(async ({ file }: { file: File }) => ({
			id: "server-id",
			name: file.name,
			url: "/uploaded",
		}))
		const { result } = renderHook(() => useAttachmentUpload({ onUpload }), {
			wrapper: StrictWrapper,
		})

		act(() => {
			result.current.addFiles([new File(["body"], "invoice.pdf", { type: "application/pdf" })])
		})

		await waitFor(() => expect(result.current.uploadedAttachments).toHaveLength(1))
		expect(onUpload).toHaveBeenCalledTimes(1)
	})
})
