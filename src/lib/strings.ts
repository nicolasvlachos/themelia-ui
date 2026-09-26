/**
 * The type of a component's `strings` prop: a deeply partial override of its
 * `defaultXStrings` dictionary.
 *
 * A component with copy of its own exports `defaultXStrings` and takes
 * `strings?: StringsProp<XStrings>`, resolved with `resolveStrings` (a plain spread
 * suffices for flat copy). A value may be a function when the copy interpolates, so a
 * translation can reorder its parts:
 *
 * ```ts
 * export interface FileUploadStrings {
 *   tooLarge: (name: string, limit: string) => string
 * }
 * ```
 *
 * Callers override only the keys they change, at any depth:
 *
 * ```tsx
 * <Comments strings={{ composer: { placeholder: "Schreiben…" } }} />
 * ```
 *
 * Only plain objects recurse; a function, array or ReactNode replaces whole, matching
 * `resolveStrings`.
 */
export type StringsProp<T> = {
	[K in keyof T]?: T[K] extends (...args: never[]) => unknown
		? T[K]
		: T[K] extends readonly unknown[]
			? T[K]
			: T[K] extends object
				? StringsProp<T[K]>
				: T[K]
}

/*
 * Merges `overrides` into `defaults` key by key, so overriding one nested word keeps its
 * siblings (a spread would replace the whole group). Plain objects recurse; a function,
 * array or ReactNode replaces whole, since a caller overriding a formatter supplies all of it.
 */
type Plain = Record<string, unknown>

const isPlainObject = (value: unknown): value is Plain =>
	typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype

export function resolveStrings<T extends object>(defaults: T, overrides?: StringsProp<T>): T {
	if (!overrides) return defaults
	const out: Plain = { ...(defaults as Plain) }
	for (const [key, value] of Object.entries(overrides as Plain)) {
		if (value === undefined) continue
		const base = (defaults as Plain)[key]
		out[key] =
			isPlainObject(base) && isPlainObject(value)
				? resolveStrings(base as object, value as object)
				: value
	}
	return out as T
}
