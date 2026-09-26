import {
	CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon,
} from "lucide-react"
import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { createPortal } from "react-dom"

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

const STATUS_CLASS: Record<ToastStatus, string | undefined> = {
	neutral: undefined,
	success: styles.statusSuccess,
	info: styles.statusInfo,
	warning: styles.statusWarning,
	error: styles.statusError,
	loading: undefined,
}

export interface ToasterProps {
	position?: ToastPosition
	/** Default lifetime in ms. A toast with its own `duration` still wins. */
	duration?: number
	/** Maximum toasts on screen. Older ones are dropped from the render, not the store. */
	visibleToasts?: number
	closeButton?: boolean
	/** Overrides this region's own copy — its name, and each toast's dismiss. */
	strings?: Partial<ToasterStrings>
	className?: string
	/**
	 * The queue this Toaster renders. Defaults to the singleton `toast()` writes to; pass a
	 * `createToastStore()` instance for independent Toasters (a host app and an embedded widget).
	 */
	store?: ToastStore
	/**
	 * Where the toast region renders. Defaults to the nearest `UIPortalHost`, else
	 * `document.body`, so scoped density and theme apply.
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
			className={cx("toast--component", styles.toast, STATUS_CLASS[record.status])}
			data-status={record.status}
			data-toast-id={record.id}
			data-leaving={record.leaving || undefined}
			/* An error interrupts; everything else is announced by the polite region. */
			role={record.status === "error" ? "alert" : undefined}
			aria-atomic="true"
		>
			{icon != null && <span className={styles.icon}>{icon}</span>}

			<div className={cx("toast--content", styles.content)}>
				<div className={styles.title}>{record.title}</div>
				{record.description != null && (
					<div className={styles.description}>{record.description}</div>
				)}
			</div>

			{(record.action || record.cancel) && (
				<div className={styles.actions}>
					{record.cancel && (
						<button
							type="button"
							className={styles.cancel}
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
							className={styles.action}
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
