/**
 * useOverlayVisibility: one overlay's open state, controlled or not, so a component that
 * supports both its own trigger and external openers keeps one source of truth.
 */
import {
	useCallback, useMemo, useState,
	type Dispatch, type SetStateAction,
} from "react"
import { useLatest } from "@/hooks/use-latest"

export type OverlayOpenSetter = Dispatch<SetStateAction<boolean>>

/** Spreadable straight onto any overlay in the kit. */
export interface OverlayVisibilityProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export interface UseOverlayVisibilityOptions {
	defaultOpen?: boolean
	/** Supplying this makes it controlled; the hook then only reports. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Fires only on the transitions, unlike `onOpenChange` which fires on both. */
	onOpen?: () => void
	onClose?: () => void
}

export interface UseOverlayVisibilityReturn {
	open: boolean
	setOpen: OverlayOpenSetter
	show: () => void
	hide: () => void
	toggle: () => void
	/** `{...visibility.overlayProps}` on the overlay. */
	overlayProps: OverlayVisibilityProps
}

function resolve(next: SetStateAction<boolean>, current: boolean): boolean {
	return typeof next === "function" ? (next as (open: boolean) => boolean)(current) : next
}

export function useOverlayVisibility({
	defaultOpen = false,
	open: controlledOpen,
	onOpenChange,
	onOpen,
	onClose,
}: UseOverlayVisibilityOptions = {}): UseOverlayVisibilityReturn {
	const [uncontrolled, setUncontrolled] = useState(defaultOpen)
	const isControlled = controlledOpen !== undefined
	const open = isControlled ? controlledOpen : uncontrolled

	/* The setter reads the current value from a ref, so captured copies of `setOpen` never go stale. */
	const openRef = useLatest(open)

	const setOpen = useCallback<OverlayOpenSetter>(
		(next) => {
			const value = resolve(next, openRef.current)
			if (value === openRef.current) return

			if (!isControlled) setUncontrolled(value)
			onOpenChange?.(value)
			if (value) onOpen?.()
			else onClose?.()
		},
		[isControlled, onOpenChange, onOpen, onClose, openRef],
	)

	const show = useCallback(() => setOpen(true), [setOpen])
	const hide = useCallback(() => setOpen(false), [setOpen])
	const toggle = useCallback(() => setOpen((current) => !current), [setOpen])

	const overlayProps = useMemo<OverlayVisibilityProps>(
		() => ({ open, onOpenChange: setOpen }),
		[open, setOpen],
	)

	return { open, setOpen, show, hide, toggle, overlayProps }
}

export type OverlayVisibilityGroupState<TKey extends string = string> = Record<TKey, boolean>

export interface UseOverlayVisibilityGroupOptions<TKey extends string = string> {
	defaultOpen?: Partial<Record<TKey, boolean>>
	open?: Partial<Record<TKey, boolean>>
	onOpenChange?: (key: TKey, open: boolean, state: OverlayVisibilityGroupState<TKey>) => void
	/** Closes the others when one opens, e.g. for dialogs driven from one menu. */
	closeOthersOnOpen?: boolean
}

export type UseOverlayVisibilityGroupReturn<TKey extends string = string> = Record<
	TKey,
	UseOverlayVisibilityReturn
>

/** Several overlays keyed by name from one hook, coordinated by `closeOthersOnOpen`. */
export function useOverlayVisibilityGroup<TKey extends string>(
	keys: readonly TKey[],
	{
		defaultOpen,
		open: controlledOpen,
		onOpenChange,
		closeOthersOnOpen = false,
	}: UseOverlayVisibilityGroupOptions<TKey> = {},
): UseOverlayVisibilityGroupReturn<TKey> {
	const normalise = useCallback(
		(state?: Partial<Record<TKey, boolean>>) =>
			Object.fromEntries(keys.map((key) => [key, Boolean(state?.[key])])) as OverlayVisibilityGroupState<TKey>,
		[keys],
	)

	const [uncontrolled, setUncontrolled] = useState(() => normalise(defaultOpen))
	const isControlled = controlledOpen !== undefined
	const state = isControlled ? normalise(controlledOpen) : uncontrolled

	const stateRef = useLatest(state)

	const setKey = useCallback(
		(key: TKey, next: SetStateAction<boolean>) => {
			const current = stateRef.current
			const value = resolve(next, current[key])
			if (value === current[key]) return

			const nextState = closeOthersOnOpen && value
				? (Object.fromEntries(keys.map((k) => [k, k === key])) as OverlayVisibilityGroupState<TKey>)
				: { ...current, [key]: value }

			if (!isControlled) setUncontrolled(nextState)
			onOpenChange?.(key, value, nextState)
		},
		[closeOthersOnOpen, isControlled, keys, onOpenChange, stateRef],
	)

	return useMemo(
		() =>
			Object.fromEntries(
				keys.map((key) => {
					const setOpen: OverlayOpenSetter = (next) => setKey(key, next)
					return [
						key,
						{
							open: state[key],
							setOpen,
							show: () => setKey(key, true),
							hide: () => setKey(key, false),
							toggle: () => setKey(key, (current) => !current),
							overlayProps: { open: state[key], onOpenChange: setOpen },
						} satisfies UseOverlayVisibilityReturn,
					]
				}),
			) as UseOverlayVisibilityGroupReturn<TKey>,
		[keys, setKey, state],
	)
}
