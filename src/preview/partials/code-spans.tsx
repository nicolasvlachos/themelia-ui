import { Fragment, type ReactNode } from "react"

/**
 * Renders `backticked` spans in a description as code, for `Example` and `PropTable`.
 * Only strings are parsed; a node is left alone.
 */
export function withCodeSpans(description: ReactNode): ReactNode {
	if (typeof description !== "string") return description
	if (!description.includes("`")) return description

	/* Odd segments are the backticked spans: split() alternates text and match. */
	return description.split(/`([^`]+)`/g).map((part, index) =>
		index % 2 === 1 ? (
			<code key={index}>{part}</code>
		) : (
			<Fragment key={index}>{part}</Fragment>
		),
	)
}
