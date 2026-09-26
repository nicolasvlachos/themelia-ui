/**
 * The one frame behind ActionDialog, ActionSheet and ConfirmDialog: visibility, async
 * confirm, header, notice, body and footer. Each public component supplies only its
 * surface part, surface props and defaults.
 */
import {
	isValidElement, useId,
	type ComponentType, type CSSProperties, type ReactNode, type RefObject,
} from "react"

import {
	Overlay, OverlayBody, OverlayDescription, OverlayFooter, OverlayHeader, OverlayTitle, OverlayTrigger,
	type OverlayDismissal,
} from "@/components/base/overlay"
import { cx } from "@/lib/cx"

import { OverlayFooterActions, OverlayHiddenHeader, OverlayNotice, OverlayTitleRow } from "./overlay-parts"
import type { OverlayActionStrings } from "./overlays.strings"
import type { OverlayActionProps, OverlayBaseProps, OverlayEmphasisProps } from "./overlays.types"
import { useOverlayActions } from "./use-overlay-actions"
import { useOverlayVisibility } from "./use-overlay-visibility"

/* The content part a public component renders into; header, body and footer are shared. */
export interface ActionOverlayParts {
	Content: ComponentType<Record<string, unknown> & {
		className?: string
		style?: CSSProperties
		children?: ReactNode
		"aria-labelledby"?: string
		"aria-describedby"?: string
	}>
}

export interface ActionOverlayFrameProps
	extends OverlayBaseProps,
		OverlayActionProps,
		OverlayEmphasisProps {
	trigger?: ReactNode
	parts: ActionOverlayParts
	/** The public component's name, for its `--component` hook. */
	hook: string
	/** Surface-specific props for the content — a side, a size, a dismissal policy. */
	contentProps?: (state: { busy: boolean }) => Record<string, unknown>
	/** A sheet keeps its body even when empty: it is what fills the edge. */
	alwaysRenderBody?: boolean
	/** A sheet can drop its footer entirely. */
	showFooter?: boolean
	/** Whether `closeOnEscape`, `closeOnBackdropClick` and the close button apply. */
	dismissible?: boolean
	/** The strings a component words its footer with when the caller gives none. */
	defaultStrings?: OverlayActionStrings
	/** Default for `showIcon`. */
	showIconByDefault?: boolean
	initialFocusRef?: RefObject<HTMLElement | null>
}

export function ActionOverlayFrame({
	open,
	onOpenChange,
	onClose,
	children,
	title,
	description,
	hideHeader = false,
	showCloseButton = true,
	initialFocusRef,
	closeOnEscape = true,
	closeOnBackdropClick = true,
	surfaceStyle,
	className,
	contentClassName,
	strings,
	trigger,

	showCancel = true,
	showConfirm = true,
	onCancel,
	onConfirm,
	onAsyncConfirm,
	onError,
	closeOnAsyncComplete = true,
	confirmTone = "primary",
	confirmStyle = "solid",
	loading = false,
	formId,
	footer,

	emphasis = false,
	tone = "neutral",
	showIcon,
	alertMessage,

	parts,
	hook,
	contentProps,
	alwaysRenderBody = false,
	showFooter = true,
	dismissible = true,
	defaultStrings,
	showIconByDefault = false,
}: ActionOverlayFrameProps) {
	const { Content } = parts
	const generatedId = useId()
	const titleId = title ? `${generatedId}-title` : undefined
	const descriptionId = description ? `${generatedId}-description` : undefined
	const visibility = useOverlayVisibility({ open, onOpenChange, onClose })
	const actions = useOverlayActions({
		close: visibility.hide,
		open: visibility.open,
		onConfirm,
		onAsyncConfirm,
		closeOnAsyncComplete,
		confirmTone,
		loading,
		formId,
		onCancel,
		onError,
		strings,
		...(defaultStrings ? { defaults: defaultStrings } : null),
		emphasis,
		tone,
	})

	/* No Escape or backdrop dismissal while an async confirm runs: the outcome stays visible. */
	const dismissal: OverlayDismissal = {
		escape: closeOnEscape && !actions.busy,
		backdrop: closeOnBackdropClick && !actions.busy,
	}
	const hasFooter = showFooter && (footer !== undefined || showCancel || showConfirm)
	const hasBody = alwaysRenderBody || children != null || !!alertMessage
	const glyph = showIcon ?? showIconByDefault

	return (
		<Overlay {...visibility.overlayProps}>
			{isValidElement(trigger) && <OverlayTrigger render={trigger} />}
			<Content
				aria-labelledby={titleId}
				aria-describedby={descriptionId}
				{...(dismissible
					? { showCloseButton: showCloseButton && !actions.busy, initialFocusRef, dismissal }
					: null)}
				{...contentProps?.({ busy: actions.busy })}
				className={cx(`${hook}--component`, className)}
				style={surfaceStyle}
			>
				{hideHeader ? (
					<OverlayHiddenHeader
						title={title}
						description={description}
						titleId={titleId}
						descriptionId={descriptionId}
						Title={OverlayTitle}
						Description={OverlayDescription}
					/>
				) : (
					(!!title || !!description) && (
						<OverlayHeader>
							{!!title && (
								<OverlayTitle id={titleId}>
									<OverlayTitleRow tone={tone} showIcon={glyph}>
										{title}
									</OverlayTitleRow>
								</OverlayTitle>
							)}
							{!!description && <OverlayDescription id={descriptionId}>{description}</OverlayDescription>}
						</OverlayHeader>
					)
				)}

				{hasBody && (
					<OverlayBody className={contentClassName}>
						{!!alertMessage && <OverlayNotice tone={tone}>{alertMessage}</OverlayNotice>}
						{children}
					</OverlayBody>
				)}

				{hasFooter && (
					<OverlayFooter>
						{footer ?? (
							<OverlayFooterActions
								copy={actions.copy}
								showCancel={showCancel}
								showConfirm={showConfirm}
								confirmTone={actions.confirmTone}
								confirmStyle={confirmStyle}
								busy={actions.busy}
								formId={formId}
								onCancel={actions.cancel}
								onConfirm={actions.confirm}
							/>
						)}
					</OverlayFooter>
				)}
			</Content>
		</Overlay>
	)
}
