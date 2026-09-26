/**
 * `cvm` — class variance for CSS Modules: `class-variance-authority`'s signature, mapping
 * variants onto module class names.
 *
 *     const button = cvm(styles.root, {
 *       variants: {
 *         variant: { default: styles.variantDefault, outline: styles.variantOutline },
 *         size: { default: styles.sizeDefault, sm: styles.sizeSm },
 *       },
 *       defaultVariants: { variant: "default", size: "default" },
 *     })
 *
 *     button({ variant: "outline", className })
 *
 * No `tailwind-merge` equivalent: consumer overrides win through the cascade layers in
 * styles/index.css.
 */
import { clsx, type ClassValue } from "clsx"

type VariantShape = Record<string, Record<string, string | undefined>>

/** The prop type a component exposes: one optional key per variant group. */
export type VariantProps<T> = T extends (props: infer P) => string
	? Omit<NonNullable<P>, "className">
	: never

type Options<V extends VariantShape> = {
	variants?: V
	defaultVariants?: { [K in keyof V]?: keyof V[K] }
	compoundVariants?: Array<
		{ [K in keyof V]?: keyof V[K] | Array<keyof V[K]> } & { className: string | undefined }
	>
}

/**
 * A boolean variant is declared with `"true"` / `"false"` keys but passed as a real
 * boolean, so the prop type accepts both and lookup coerces. Matches `cva`.
 */
type VariantValue<G> = keyof G | (("true" | "false") extends keyof G ? boolean : never)

type Props<V extends VariantShape> = {
	[K in keyof V]?: VariantValue<V[K]> | null | undefined
} & {
	className?: ClassValue
}

export function cvm<V extends VariantShape>(base: string | undefined, options: Options<V> = {}) {
	const { variants, defaultVariants, compoundVariants } = options

	return (props?: Props<V>): string => {
		const { className, ...selected } = props ?? ({} as Props<V>)

		/** Resolve one group to the caller's value, else the default. */
		const valueOf = (group: keyof V) => {
			const given = (selected as Record<keyof V, unknown>)[group]
			// `null` explicitly opts out of a group; `undefined` falls back to the default.
			if (given === null) return undefined
			const resolved = given ?? defaultVariants?.[group]
			// Boolean variants are keyed by the strings "true"/"false".
			if (typeof resolved === "boolean") {
				return String(resolved) as keyof V[typeof group]
			}
			return resolved as keyof V[typeof group] | undefined
		}

		const applied: Array<string | undefined> = []

		if (variants) {
			for (const group of Object.keys(variants) as Array<keyof V>) {
				const value = valueOf(group)
				if (value === undefined) continue
				applied.push(variants[group]?.[value as string])
			}
		}

		if (compoundVariants) {
			for (const rule of compoundVariants) {
				// Not destructured: `Omit`ing "className" would also strip it from `keyof V`.
				const conditions = rule as { [K in keyof V]?: keyof V[K] | Array<keyof V[K]> }
				const groups = (Object.keys(rule) as Array<keyof V | "className">).filter(
					(key): key is keyof V => key !== "className",
				)
				const matches = groups.every((group) => {
					const expected = conditions[group]
					const actual = valueOf(group)
					return Array.isArray(expected)
						? expected.includes(actual as never)
						: expected === actual
				})
				if (matches) applied.push(rule.className)
			}
		}

		return clsx(base, applied, className)
	}
}
