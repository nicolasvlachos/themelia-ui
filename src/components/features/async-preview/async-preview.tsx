/**
 * AsyncPreview — the compound components over `useAsyncPreview`. Loading, error and empty
 * have defaults, so a caller usually writes only the body.
 */
import { isValidElement, useContext, useId, type ReactElement } from "react"

import { Empty, ErrorState } from "@/components/base/feedback"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { Spinner } from "@/components/base/spinner"
import { cx } from "@/lib/cx"

import { defaultAsyncPreviewStrings } from "./async-preview.strings"
import { useAsyncPreview } from "./use-async-preview"
import type {
	AsyncPreviewBodyProps, AsyncPreviewContentProps, AsyncPreviewRootProps,
	AsyncPreviewSlotProps, AsyncPreviewState, AsyncPreviewStateProps,
	AsyncPreviewTriggerProps,
} from "./async-preview.types"
import styles from "./async-preview.module.css"
import { PreviewContext, type PreviewContextValue } from "./async-preview-context"

function useInternal(): PreviewContextValue {
	const value = useContext(PreviewContext)
	if (!value) throw new Error("AsyncPreview parts must be used inside <AsyncPreview.Root />.")
	return value
}

export function AsyncPreviewRoot<TData, TContext = unknown, TType extends string = string>({
	children,
	strings,
	...options
}: AsyncPreviewRootProps<TData, TContext, TType>) {
	const triggerId = useId()
	const { setOpen, ...state } = useAsyncPreview<TData, TContext, TType>(options)
	const copy = { ...defaultAsyncPreviewStrings, ...strings }

	return (
		<PreviewContext.Provider
			value={{ state: state as AsyncPreviewState<unknown, unknown, string>, setOpen, copy, triggerId }}
		>
			<Popover open={state.open} onOpenChange={setOpen}>
				{children}
			</Popover>
		</PreviewContext.Provider>
	)
}

export function AsyncPreviewTrigger<TData, TContext = unknown, TType extends string = string>({
	children,
	prefetchOnHover = true,
	className,
}: AsyncPreviewTriggerProps<TData, TContext, TType>) {
	const { state, triggerId } = useInternal()

	const rendered = typeof children === "function"
		? children({ state: state as AsyncPreviewState<TData, TContext, TType> })
		: children

	return (
		<PopoverTrigger
			id={triggerId}
			className={cx("async-preview-trigger--component", !isValidElement(rendered) && styles.trigger, className)}
			render={
				isValidElement(rendered)
					? (rendered as ReactElement)
					: (
						<button type="button">
							{rendered}
						</button>
					)
			}
			/* Pointer-enter, not focus: tabbing through a table must not prefetch every row. */
			onPointerEnter={prefetchOnHover ? state.prefetch : undefined}
		/>
	)
}

export function AsyncPreviewContent({
	className, children, width, side, align,
}: AsyncPreviewContentProps) {
	const { triggerId } = useInternal()
	return (
		<PopoverContent
			aria-labelledby={triggerId}
			width={width ?? "auto"}
			side={side}
			align={align}
			className={cx("async-preview--component", styles.content, className)}
		>
			{children}
		</PopoverContent>
	)
}

/** The whole state, for a preview that renders its own four cases. */
export function AsyncPreviewState<TData, TContext = unknown, TType extends string = string>({
	children,
}: AsyncPreviewStateProps<TData, TContext, TType>) {
	const { state } = useInternal()
	return <>{children(state as AsyncPreviewState<TData, TContext, TType>)}</>
}

/** The success case, with the data narrowed to non-null. */
export function AsyncPreviewBody<TData, TContext = unknown, TType extends string = string>({
	children,
}: AsyncPreviewBodyProps<TData, TContext, TType>) {
	const { state } = useInternal()
	if (state.status !== "success" || state.data === null) return null
	return <>{children(state.data as TData, state as AsyncPreviewState<TData, TContext, TType>)}</>
}

/** A slot's own content, whether it was given a node or a function of the state. */
function slotChildren(
	children: AsyncPreviewSlotProps["children"],
	state: AsyncPreviewState<unknown, unknown, string>,
) {
	return typeof children === "function" ? children(state) : children
}

export function AsyncPreviewLoading({ className, children }: AsyncPreviewSlotProps) {
	const { state, copy } = useInternal()
	if (state.status !== "loading") return null

	return (
		<div className={cx("async-preview-loading--component", styles.state, className)}>
			{slotChildren(children, state) ?? (
				<Spinner
					// The fetcher's own slow-step label wins over the generic one.
					label={(state.loading && state.loading.label) || copy.loading}
				/>
			)}
		</div>
	)
}

export function AsyncPreviewError({ className, children }: AsyncPreviewSlotProps) {
	const { state, copy } = useInternal()
	if (state.status !== "error") return null

	return (
		<div className={cx("async-preview-error--component", styles.state, className)}>
			{slotChildren(children, state) ?? (
				<ErrorState className={styles.stateContent} title={copy.errorTitle} description={copy.errorDescription} onRetry={state.refresh} strings={{ retry: copy.retry }} />
			)}
		</div>
	)
}

export function AsyncPreviewEmpty({ className, children }: AsyncPreviewSlotProps) {
	const { state, copy } = useInternal()
	if (state.status !== "empty") return null

	return (
		<div className={cx("async-preview-empty--component", styles.state, className)}>
			{slotChildren(children, state) ?? (
				<Empty title={copy.emptyTitle} description={copy.emptyDescription} padding="sm" />
			)}
		</div>
	)
}
