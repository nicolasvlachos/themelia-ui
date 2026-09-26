/**
 * ActionOverlayOutlet — renders whichever action is currently open. Mount one near the app
 * shell; every surface that runs an action with a `modality` then shares its overlay.
 *
 * Modalities map onto `features/overlays`: alert → ConfirmDialog, drawer → ActionSheet,
 * form → ActionDialog. The action store owns the run, the loading state and closing.
 */
import { ActionDialog, ActionSheet, ConfirmDialog, type OverlayTone } from "@/components/features/overlays"
import type { SheetSide } from "@/components/base/sheet"
import { cx } from "@/lib/cx"

import { resolveActionMessage } from "./action-store"
import { defaultActionOverlayStrings } from "./actions.strings"
import { useActiveAction } from "./hooks"
import type {
	ActionDrawerDirection, ActionMessageContext, ActionOverlayOutletProps,
} from "./actions.types"

const OVERLAY_TONES = new Set<string>(["neutral", "destructive", "warning", "info", "success"])

/** The kit's sheet sides are logical; the action API's directions are physical. */
const SHEET_SIDE: Record<ActionDrawerDirection, SheetSide> = {
	left: "inline-start",
	right: "inline-end",
	top: "block-start",
	bottom: "block-end",
}

export function ActionOverlayOutlet({ strings }: ActionOverlayOutletProps = {}) {
	const active = useActiveAction()
	const copy = { ...defaultActionOverlayStrings, ...strings }

	if (!active) return null

	const modality = active.definition.modality
	if (!modality || modality === "none") return null

	const messageContext = {
		action: active.definition,
		actionId: active.id,
		scope: active.scope,
		payload: active.payload,
		values: active.values,
		metadata: active.metadata,
		status: active.status,
		errors: active.errors,
		result: active.result,
		error: active.error,
	} as ActionMessageContext

	const title = resolveActionMessage(modality.title, messageContext)
	const description = resolveActionMessage(modality.description, messageContext)
	const confirm = resolveActionMessage(modality.confirmLabel, messageContext) ?? copy.confirm
	const cancel = resolveActionMessage(modality.cancelLabel, messageContext) ?? copy.cancel
	const alertMessage = resolveActionMessage(modality.alertMessage, messageContext)

	const showCancel = modality.showCancel ?? true
	const showConfirm = modality.showConfirm ?? true

	/* `getFormProps` makes a <form> submit through the action, not its own handler. */
	const content = modality.render?.({
		action: active.definition,
		actionId: active.id,
		scope: active.scope,
		payload: active.payload,
		values: active.values,
		metadata: active.metadata,
		formId: modality.formId,
		status: active.status,
		isIdle: active.isIdle,
		isRunning: active.isRunning,
		isSuccess: active.isSuccess,
		isError: active.isError,
		result: active.result,
		error: active.error,
		errors: active.errors,
		close: active.close,
		submit: (values) => active.submit(values),
		getFormProps: (options) => ({
			id: modality.formId,
			onSubmit: async (event) => {
				event.preventDefault()
				const values = options?.resolveValues
					? await options.resolveValues(new FormData(event.currentTarget), event)
					: undefined
				await active.submit(values)
			},
		}),
	})

	const onOpenChange = (open: boolean) => {
		if (!open) active.close()
	}

	/* Shared by all three surfaces; the store, not the surface, decides whether a settled run closes. */
	const shared = {
		open: true,
		onOpenChange,
		title,
		description,
		alertMessage,
		children: content ?? undefined,
		showCancel,
		showConfirm,
		strings: { confirm, cancel },
		formId: modality.formId,
		loading: active.isRunning,
		onAsyncConfirm: async () => {
			await active.submit()
		},
		closeOnAsyncComplete: false,
		// An overlay carries five tones; "primary" and "secondary" colour only the confirm.
		tone: modality.tone && OVERLAY_TONES.has(modality.tone) ? (modality.tone as OverlayTone) : "neutral",
		confirmTone: modality.tone ?? "primary",
		confirmStyle: modality.confirmStyle ?? "solid",
		className: cx("action-overlay-outlet--component", modality.contentClassName),
	} as const

	if (modality.type === "alert") return <ConfirmDialog {...shared} showIcon={false} />

	if (modality.type === "drawer") {
		return (
			<ActionSheet
				{...shared}
				side={SHEET_SIDE[modality.drawerDirection ?? "right"]}
				showFooter={modality.showFooter ?? true}
			/>
		)
	}

	return <ActionDialog {...shared} />
}
