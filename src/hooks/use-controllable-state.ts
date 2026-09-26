import { useCallback, useState } from "react"

export interface UseControllableStateOptions<T> {
	/** The controlled value. `undefined` means the caller is not controlling this. */
	value?: T
	/** Starting value when uncontrolled. */
	defaultValue: T
	/** Notified on every change, controlled or not. */
	onChange?: (value: T) => void
}

/**
 * One value that may or may not be owned by the caller. Controlled-ness is decided on the
 * first render and never re-read: flipping mid-life is a caller bug React warns about.
 * `onChange` fires on every change, controlled or not.
 */
export function useControllableState<T>({
	value,
	defaultValue,
	onChange,
}: UseControllableStateOptions<T>): [T, (next: T) => void] {
	/* Captured once and never written: a lazy `useState`, not a ref read during render. */
	const [isControlled] = useState(() => value !== undefined)
	const [internal, setInternal] = useState<T>(defaultValue)

	const resolved = isControlled ? (value as T) : internal

	const setValue = useCallback(
		(next: T) => {
			/* Skip the local write while controlled, but always notify, or it becomes read-only. */
			if (!isControlled) setInternal(next)
			onChange?.(next)
		},
		[isControlled, onChange],
	)

	return [resolved, setValue]
}
