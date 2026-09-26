import type { ReactNode } from "react"

/** Status: the surface is the same for all; only the glyph and announcement politeness change. */
export type ToastStatus = "neutral" | "success" | "info" | "warning" | "error" | "loading"

export type ToastPosition =
	| "top-start"
	| "top-center"
	| "top-end"
	| "bottom-start"
	| "bottom-center"
	| "bottom-end"

export interface ToastAction {
	label: string
	onClick: () => void
}

export interface ToastOptions {
	id?: string
	description?: ReactNode
	/** Replaces the status glyph. */
	icon?: ReactNode
	/** Milliseconds before auto-dismissal. `Infinity` pins it open. */
	duration?: number
	action?: ToastAction
	cancel?: ToastAction
	/** Called after the toast leaves, whichever way it left. */
	onDismiss?: (id: string) => void
}

export interface ToastRecord extends Omit<ToastOptions, "id"> {
	id: string
	title: ReactNode
	status: ToastStatus
	/** Set while the exit transition runs, so the DOM node survives long enough to animate. */
	leaving?: boolean
}


interface ToastFn {
	(title: ReactNode, options?: ToastOptions): string
	neutral: (title: ReactNode, options?: ToastOptions) => string
	success: (title: ReactNode, options?: ToastOptions) => string
	info: (title: ReactNode, options?: ToastOptions) => string
	warning: (title: ReactNode, options?: ToastOptions) => string
	error: (title: ReactNode, options?: ToastOptions) => string
	loading: (title: ReactNode, options?: ToastOptions) => string
	dismiss: (id?: string) => void
	/** Shows a loading toast, then swaps it in place for the outcome. */
	promise: <T>(
		promise: Promise<T>,
		messages: {
			loading: ReactNode
			success: ReactNode | ((value: T) => ReactNode)
			error: ReactNode | ((error: unknown) => ReactNode)
		},
		options?: ToastOptions,
	) => Promise<T>
}

type Listener = () => void

/** One queue of toasts, its timers, and the `toast()` bound to it. */
export interface ToastStore {
	/* The `useSyncExternalStore` triple. */
	subscribe(listener: Listener): () => void
	getSnapshot(): ToastRecord[]
	getServerSnapshot(): ToastRecord[]

	/** Raise a toast on this store. `toast` is the ergonomic form of the same thing. */
	toast: ToastFn
	dismiss(id?: string): void
	/** Pause every running timer — pointer-enter and focus-within. */
	pauseAll(): void
	resumeAll(defaultDuration: number): void
	/** Give the Toaster's configured default to anything queued without one. */
	applyDefaultDuration(defaultDuration: number): void
}

/** The exit transition's length. Kept in sync with --duration-fast in theming/motion.css. */
const LEAVE_MS = 150

/**
 * A store with its own queue and timers, for a second, isolated Toaster (a host app and an
 * embedded widget). Most apps use the default `toastStore`.
 */
export function createToastStore(): ToastStore {
	const listeners = new Set<Listener>()
	const timers = new Map<string, number>()
	let toasts: ToastRecord[] = []
	let counter = 0

	function emit() {
		for (const listener of listeners) listener()
	}

	function clearTimer(id: string) {
		const timer = timers.get(id)
		if (timer !== undefined) {
			window.clearTimeout(timer)
			timers.delete(id)
		}
	}

	function schedule(id: string, duration: number) {
		clearTimer(id)
		if (!Number.isFinite(duration)) return
		timers.set(id, window.setTimeout(() => dismiss(id), duration))
	}

	function dismiss(id?: string) {
		const targets = id ? toasts.filter((record) => record.id === id) : toasts
		if (targets.length === 0) return

		for (const target of targets) {
			clearTimer(target.id)
		}
		toasts = toasts.map((record) =>
			targets.includes(record) ? { ...record, leaving: true } : record,
		)
		emit()

		window.setTimeout(() => {
			const removed = toasts.filter((record) => targets.some((t) => t.id === record.id))
			toasts = toasts.filter((record) => !targets.some((t) => t.id === record.id))
			emit()
			for (const record of removed) record.onDismiss?.(record.id)
		}, LEAVE_MS)
	}

	function push(status: ToastStatus, title: ReactNode, options: ToastOptions = {}): string {
		const id = options.id ?? `toast-${++counter}`
		const existing = toasts.find((record) => record.id === id)
		const record: ToastRecord = { ...options, id, title, status, leaving: false }

		// An id already on screen updates in place, so loading → success reads as one toast.
		toasts = existing
			? toasts.map((entry) => (entry.id === id ? record : entry))
			: [...toasts, record]
		emit()

		/*
		 * A loading toast has no default duration. Others get the Toaster's default, applied by
		 * the Toaster (the store cannot see the provider); until then any old timer is cleared.
		 */
		if (options.duration !== undefined) schedule(id, options.duration)
		else if (status !== "loading") schedule(id, Number.POSITIVE_INFINITY)

		return id
	}

	const base = (title: ReactNode, options?: ToastOptions) => push("neutral", title, options)

	const toast: ToastFn = Object.assign(base, {
		neutral: base,
		success: (title: ReactNode, options?: ToastOptions) => push("success", title, options),
		info: (title: ReactNode, options?: ToastOptions) => push("info", title, options),
		warning: (title: ReactNode, options?: ToastOptions) => push("warning", title, options),
		error: (title: ReactNode, options?: ToastOptions) => push("error", title, options),
		loading: (title: ReactNode, options?: ToastOptions) => push("loading", title, options),
		dismiss,
		promise: async <T,>(
			promise: Promise<T>,
			messages: {
				loading: ReactNode
				success: ReactNode | ((value: T) => ReactNode)
				error: ReactNode | ((error: unknown) => ReactNode)
			},
			options: ToastOptions = {},
		) => {
			const id = push("loading", messages.loading, { ...options, id: options.id })
			try {
				const value = await promise
				push("success", resolve(messages.success, value), { ...options, id })
				return value
			} catch (error) {
				push("error", resolve(messages.error, error), { ...options, id })
				throw error
			}
		},
	})

	return {
		subscribe(listener) {
			listeners.add(listener)
			return () => listeners.delete(listener)
		},
		getSnapshot: () => toasts,
		/** Server snapshot — no toast can have been queued before hydration. */
		getServerSnapshot: () => EMPTY,

		toast,
		dismiss,

		/** Stops every timer, so a toast cannot expire while being read or tabbed into. */
		pauseAll() {
			for (const id of [...timers.keys()]) clearTimer(id)
		},

		resumeAll(defaultDuration) {
			for (const record of toasts) {
				if (record.leaving) continue
				schedule(record.id, record.duration ?? defaultDuration)
			}
		},

		applyDefaultDuration(defaultDuration) {
			for (const record of toasts) {
				if (record.leaving || record.status === "loading") continue
				if (record.duration !== undefined) continue
				if (timers.has(record.id)) continue
				schedule(record.id, defaultDuration)
			}
		},
	}
}

// A stable array: `useSyncExternalStore` requires a cached server snapshot.
const EMPTY: ToastRecord[] = []

function resolve<T>(message: ReactNode | ((value: T) => ReactNode), value: T): ReactNode {
	return typeof message === "function" ? (message as (value: T) => ReactNode)(value) : message
}

/** The default store, which `toast("Saved")` writes to from anywhere (no hook or context). */
export const toastStore = createToastStore()

/** `toast()` bound to the default store. */
export const toast = toastStore.toast
export const dismiss: (id?: string) => void = toastStore.dismiss
export const pauseAll: () => void = toastStore.pauseAll
export const resumeAll: (defaultDuration: number) => void = toastStore.resumeAll
export const applyDefaultDuration: (defaultDuration: number) => void =
	toastStore.applyDefaultDuration
