/* The preview context and its public hook. The family's internal accessor stays with the parts. */
import { createContext, useContext } from "react"

import type { AsyncPreviewState } from "./async-preview.types"
import type { AsyncPreviewStrings } from "./async-preview.strings"

export interface PreviewContextValue {
	state: AsyncPreviewState<unknown, unknown, string>
	setOpen: (open: boolean) => void
	copy: AsyncPreviewStrings
	triggerId: string
}

export const PreviewContext = createContext<PreviewContextValue | null>(null)

export function useAsyncPreviewContext<
	TData,
	TContext = unknown,
	TType extends string = string,
>(): AsyncPreviewState<TData, TContext, TType> {
	const value = useContext(PreviewContext)
	if (!value) throw new Error("AsyncPreview parts must be used inside <AsyncPreview.Root />.")
	return value.state as AsyncPreviewState<TData, TContext, TType>
}
