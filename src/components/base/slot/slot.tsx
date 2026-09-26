import { mergeProps } from "@base-ui/react/merge-props"
import * as React from "react"

type AnyProps = Record<string, unknown>

type SlotProps = {
	children: React.ReactElement
} & AnyProps

/**
 * Minimal Slot: merges its props onto the single child element and composes refs. The
 * child's props win, except that classes join, both handlers run (the child's first) and
 * styles merge (the child's over the slot's). Returns null unless given exactly one element.
 * Internal mechanism behind `render` (docs/adr/0005), not a consumer API.
 */
export const Slot = React.forwardRef<unknown, SlotProps>(({ children, ...props }, forwardedRef) => {
	if (!React.isValidElement(children)) {
		return null
	}

	const { ref: childRef, ...childProps } = children.props as AnyProps & { ref?: React.Ref<unknown> }

	const ref = (node: unknown) => {
		if (typeof forwardedRef === "function") forwardedRef(node)
		else if (forwardedRef && typeof forwardedRef === "object") {
			;(forwardedRef as React.MutableRefObject<unknown>).current = node
		}

		if (typeof childRef === "function") childRef(node)
		else if (childRef && typeof childRef === "object") {
			;(childRef as React.MutableRefObject<unknown>).current = node
		}
	}

	// Base UI injects this control prop into render props; it must never reach a DOM element.
	const { nativeButton: _nativeButton, ...slotProps } = props
	void _nativeButton

	// `cloneElement` is strict about `ref` typing when the child element type is unknown.
	return React.cloneElement(children, {
		...mergeProps<"div">(slotProps, childProps),
		ref,
	} as Partial<unknown> & React.Attributes)
})

Slot.displayName = "Slot"
