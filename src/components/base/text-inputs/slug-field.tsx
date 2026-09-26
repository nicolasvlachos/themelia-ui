/**
 * SlugField — a read-only mirror of another field, slugified; it always follows. For a
 * hand-written slug use a plain Input.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import { Input, type InputProps } from "./input"
import { slugify, type SlugifyOptions } from "./slugify"
import styles from "./text-inputs.module.css"

export interface SlugFieldProps
	extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "readOnly" | "type" | "prefix">,
		SlugifyOptions {
	/**
	 * The source text; the field shows its slugified form. Controlled — the slug is derived,
	 * never held.
	 */
	value: string | number | null | undefined
	/**
	 * Replaces the built-in derivation entirely. The default lower-cases, strips accents,
	 * keeps letters and numbers in any script, and collapses every other run to a single
	 * separator.
	 */
	transform?: (value: string | number | null | undefined) => string
	/**
	 * Rendered before the slug, inside the field — a domain or a path prefix. Not part of the
	 * value.
	 */
	prefix?: React.ReactNode
}

export const SlugField = React.forwardRef<HTMLInputElement, SlugFieldProps>(function SlugField(
	{ value, transform, separator = "-", lowercase = true, trim = true, prefix, className, ...props },
	ref,
) {
	const slug = React.useMemo(
		() => transform?.(value) ?? slugify(value, { separator, lowercase, trim }),
		[lowercase, separator, transform, trim, value],
	)

	const input = (
		<Input
			ref={ref}
			{...props}
			type="text"
			value={slug}
			readOnly
			className={cx(!prefix && "slug-field--component", className)}
		/>
	)

	if (!prefix) return input

	return (
		<div data-field-shell="" className="slug-field--component">
			{/* Muted like every field addon: it frames the value. */}
			<span data-slot="slug-field-prefix" className={styles.affordanceText}>{prefix}</span>
			{input}
		</div>
	)
})
