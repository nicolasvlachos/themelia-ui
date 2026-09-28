import {
	CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { Text, textClassName } from "@/components/base/typography"
import type { SemanticTone } from "@/lib/component-vocabulary"
import { cx } from "@/lib/cx"
import { useDefaults, useUIPortalContainer, type UIPortalContainer } from "@/lib/ui-provider"

import {
	toastStore,
	type ToastPosition, type ToastRecord, type ToastStatus, type ToastStore,
} from "./toast-store"
import { defaultToasterStrings, type ToasterStrings } from "./toaster.strings"
import styles from "./toaster.module.css"
import { useHydrated } from "@/hooks/use-hydrated"

const STATUS_ICON: Record<Exclude<ToastStatus, "neutral">, ReactNode> = {
	success: <CircleCheckIcon aria-hidden />,
	info: <InfoIcon aria-hidden />,
	warning: <TriangleAlertIcon aria-hidden />,
	error: <OctagonXIcon aria-hidden />,
	loading: <Loader2Icon aria-hidden className={styles.spinner} />,
}

/* Each status that has a colour, as the shared tone; the glyph reads it through the tone rule. */
const STATUS_TONE: Record<ToastStatus, Extract<SemanticTone, "success" | "info" | "warning" | "destructive"> | undefined> = {
	neutral: undefined,
	success: "success",
	info: "info",
	warning: "warning",
	error: "destructive",
	loading: undefined,
}

/* The pill's buttons carry the small step, medium. */
const BUTTON_TYPE = textClassName({ size: "xs", weight: "medium" })

export interface ToasterProps {
	/**
	 * One of six: top or bottom, crossed with start, center, or end. Bottom stacks grow
	 * upward so the newest is nearest the edge. `UIProvider` defaults can change it.
	 * @default "bottom-end"
	 */
	position?: ToastPosition
	/**
	 * Default lifetime in ms. A toast with its own `duration` still wins. `UIProvider`
	 * defaults can change it.
	 * @default 4000
	 */
	duration?: number
	/**
	 * Maximum toasts on screen — a cap on the render, not the store: older ones are dropped
	 * from the render, and a capped toast still runs its timer and `onDismiss`. `UIProvider`
	 * defaults can change it.
	 * @default 3
	 */
	visibleToasts?: number
	/**
	 * Shows each toast's dismiss control. `UIProvider` defaults can change it.
	 * @default true
	 */
	closeButton?: boolean
	/** Overrides this region's own copy — its name, and each toast's dismiss. */
	strings?: Partial<ToasterStrings>
	className?: string
	/**
	 * The queue this Toaster renders, dismisses and pauses. Defaults to the singleton
	 * `toast()` writes to; pass a `createToastStore()` instance to isolate it — a host app and
	 * an embedded widget.
	 */
	store?: ToastStore
	/**
	 * Where the toast region renders. Defaults to the nearest `UIPortalHost`, else
	 * `document.body` — so toasts raised inside a scoped region are drawn with that region's
	 * density and theme.
	 */
	container?: UIPortalContainer
}

/**
 * Mount once, near the application root. The store lives at module scope so `toast()` works
 * from anywhere; this component is only the view.
 */
export function Toaster({
	position,
	duration,
	visibleToasts,
	closeButton,
	strings,
	className,
	container,
	store = toastStore,
}: ToasterProps) {
	const copy = { ...defaultToasterStrings, ...strings }
	const defaults = useDefaults("toast", {
		position: "bottom-end" as ToastPosition,
		duration: 4000,
		visibleToasts: 3,
		closeButton: true,
	})
	const resolvedPosition = position ?? defaults.position
	const resolvedDuration = duration ?? defaults.duration
	const resolvedVisible = visibleToasts ?? defaults.visibleToasts
	const resolvedCloseButton = closeButton ?? defaults.closeButton

	const toasts = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot,
	)

	const hydrated = useHydrated()
	const portalContainer = useUIPortalContainer(container)

	// The store cannot read the provider, so the Toaster applies the default duration.
	useEffect(() => {
		store.applyDefaultDuration(resolvedDuration)
	}, [store, toasts, resolvedDuration])

	// Timers pause while the region is hovered or holds focus, and resume only when neither.
	const regionRef = useRef<HTMLDivElement>(null)
	const hovered = useRef(false)
	const returnFocus = useRef<HTMLElement | null>(null)
	const sync = useCallback(
		(focusInside: boolean) => {
			if (hovered.current || focusInside) store.pauseAll()
			else store.resumeAll(resolvedDuration)
		},
		[store, resolvedDuration],
	)
	const focusIsInside = () => !!regionRef.current?.contains(document.activeElement)

	// A dismissal from inside the region returns focus to where it was before entering.
	const dismissFrom = useCallback(
		(id: string) => {
			const restore = regionRef.current?.contains(document.activeElement) ? returnFocus.current : null
			store.dismiss(id)
			if (restore?.isConnected) restore.focus()
		},
		[store],
	)

	if (!hydrated) return null

	const [vertical, horizontal] = resolvedPosition.split("-") as ["top" | "bottom", "start" | "center" | "end"]

	// Trims the oldest from the render only, so capped-out toasts still time out and fire onDismiss.
	const visible = toasts.slice(-resolvedVisible)

	/*
	 * Always mounted, and itself the polite live region: a live region inserted together with
	 * its text is not reliably announced. Errors use `role="alert"`.
	 */
	return createPortal(
		<div
			ref={regionRef}
			role="region"
			aria-label={copy.label}
			aria-live="polite"
			aria-relevant="additions text"
			className={cx(
				"toaster--component",
				styles.viewport,
				styles[vertical],
				styles[horizontal],
				className,
			)}
			onMouseEnter={() => {
				hovered.current = true
				sync(focusIsInside())
			}}
			onMouseLeave={() => {
				hovered.current = false
				sync(focusIsInside())
			}}
			onFocus={(event) => {
				const from = event.relatedTarget
				if (from instanceof HTMLElement && !event.currentTarget.contains(from)) returnFocus.current = from
				sync(true)
			}}
			onBlur={(event) => {
				const to = event.relatedTarget
				sync(to instanceof Node && event.currentTarget.contains(to))
			}}
			onKeyDown={(event) => {
				if (event.key !== "Escape") return
				const id = (event.target as HTMLElement).closest<HTMLElement>("[data-toast-id]")?.dataset.toastId
				if (!id) return
				event.stopPropagation()
				dismissFrom(id)
			}}
		>
			{visible.map((record) => (
				<Toast
					key={record.id}
					record={record}
					closeButton={resolvedCloseButton}
					strings={copy}
					onDismiss={dismissFrom}
				/>
			))}
		</div>,
		portalContainer ?? document.body,
	)
}

function Toast({
	record,
	closeButton,
	strings: copy,
	/* The owning store's dismiss, not the singleton's — a second Toaster dismisses its own. */
	onDismiss,
}: {
	record: ToastRecord
	closeButton: boolean
	strings: ToasterStrings
	onDismiss: (id: string) => void
}) {
	const icon = record.icon ?? (record.status === "neutral" ? null : STATUS_ICON[record.status])

	return (
		<div
			className={cx("toast--component", styles.toast)}
			data-status={record.status}
			data-tone={STATUS_TONE[record.status]}
			data-toast-id={record.id}
			data-leaving={record.leaving || undefined}
			/* An error interrupts; everything else is announced by the polite region. */
			role={record.status === "error" ? "alert" : undefined}
			aria-atomic="true"
		>
			{icon != null && <span className={styles.icon}>{icon}</span>}

			<div className={cx("toast--content", styles.content)}>
				<Text tag="div" size="sm" weight="medium">
					{record.title}
				</Text>
				{record.description != null && (
					<Text tag="div" size="xs" type="secondary" className={styles.description}>
						{record.description}
					</Text>
				)}
			</div>

			{(record.action || record.cancel) && (
				<div className={styles.actions}>
					{record.cancel && (
						<button
							type="button"
							className={cx(styles.cancel, BUTTON_TYPE)}
							onClick={() => {
								record.cancel?.onClick()
								onDismiss(record.id)
							}}
						>
							{record.cancel.label}
						</button>
					)}
					{record.action && (
						<button
							type="button"
							className={cx(styles.action, BUTTON_TYPE)}
							onClick={() => {
								record.action?.onClick()
								onDismiss(record.id)
							}}
						>
							{record.action.label}
						</button>
					)}
				</div>
			)}

			{closeButton && (
				<button
					type="button"
					className={styles.close}
					aria-label={copy.dismiss}
					onClick={() => onDismiss(record.id)}
				>
					<XIcon aria-hidden />
				</button>
			)}
		</div>
	)
}
