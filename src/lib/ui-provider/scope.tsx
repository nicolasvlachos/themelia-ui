import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import type { CSSProperties } from "react"

export interface ScopeProps extends useRender.ComponentProps<"div"> {
	/** Custom properties to set. Keys include the leading `--`. */
	vars: Record<string, string | number>
	/** Removes the element from layout with `display: contents`; custom properties still inherit. */
	transparent?: boolean
}

/**
 * `<Scope>` — a token boundary without the config machinery. Overriding a factor needs a
 * scope boundary, not just any element: derived tokens are declared at `:root`,
 * `[data-ui-scope]`, `[data-density]`, `[data-theme]`, `.light` and `.dark`, so a plain
 * `div` that sets `--density-scale` sets a variable nothing reads. Scope renders
 * `data-ui-scope`, which puts the element on that list. Use it when the change is purely
 * tokens, and `<UIProvider>` when JavaScript config changes too. `render` picks the element,
 * e.g. `render={<section />}`.
 *
 *   <Scope vars={{ "--density-scale": 0.8 }}>
 *     <Toolbar />
 *   </Scope>
 */
export function Scope({ vars, transparent = true, render, className, style, ...props }: ScopeProps) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps<"div">(
			/* Custom properties are not in React's typed style, nor data attributes in its props. */
			{
				className,
				style: { ...(transparent ? { display: "contents" } : null), ...vars, ...style } as CSSProperties,
				"data-ui-scope": "",
			} as Record<string, unknown>,
			props,
		),
		render,
	})
}
