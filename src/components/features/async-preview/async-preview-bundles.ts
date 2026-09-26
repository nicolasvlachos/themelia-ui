/* The dotted namespace and the generic factory, kept apart from the parts for fast refresh. */
import {
	AsyncPreviewBody,
	AsyncPreviewContent,
	AsyncPreviewEmpty,
	AsyncPreviewError,
	AsyncPreviewLoading,
	AsyncPreviewRoot,
	AsyncPreviewState,
	AsyncPreviewTrigger,
} from "./async-preview"

export const AsyncPreview = {
	Root: AsyncPreviewRoot,
	Trigger: AsyncPreviewTrigger,
	Content: AsyncPreviewContent,
	Body: AsyncPreviewBody,
	State: AsyncPreviewState,
	Loading: AsyncPreviewLoading,
	Error: AsyncPreviewError,
	Empty: AsyncPreviewEmpty,
}

/** Binds the generics once, for a record shape used in more than one place. */
export function createAsyncPreview<TData, TContext = unknown, TType extends string = string>() {
	return {
		Root: AsyncPreviewRoot<TData, TContext, TType>,
		Trigger: AsyncPreviewTrigger<TData, TContext, TType>,
		Content: AsyncPreviewContent,
		Body: AsyncPreviewBody<TData, TContext, TType>,
		State: AsyncPreviewState<TData, TContext, TType>,
		Loading: AsyncPreviewLoading,
		Error: AsyncPreviewError,
		Empty: AsyncPreviewEmpty,
	}
}
