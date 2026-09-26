import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { useContext, useMemo, type CSSProperties } from "react"

import { UIConfigContext, UINestedContext, UIScopeVarsContext, mergeUIConfig } from "./context"
import { configToAttributes, configToCssVars } from "./tokens"
import type { UIConfig } from "./types"
import { useIPhoneInputZoom } from "./use-iphone-input-zoom"

export interface UIScopeProps extends useRender.ComponentProps<"div"> {
	/** Merged over the nearest enclosing scope or root. */
	config?: UIConfig
	/**
	 * Removes the element from layout with `display: contents`; custom properties still
	 * inherit. Set `false` when the scope should be a real box, such as a themed panel.
	 */
	transparent?: boolean
}

/**
 * `<UIScope>` — a region with its own tokens. Nests freely; writes the custom properties
 * its merged config names and never touches the document. `render` picks the element, e.g.
 * `<UIScope render={<aside />}>`, for places a `div` is invalid.
 */
export function UIScope({
	config,
	transparent = true,
	render,
	className,
	style,
	...props
}: UIScopeProps) {
	const parent = useContext(UIConfigContext)
	const inheritedVars = useContext(UIScopeVarsContext)
	const resolved = useMemo(() => mergeUIConfig(parent, config), [parent, config])
	const preventIPhoneZoom = useIPhoneInputZoom(resolved.forms?.preventIPhoneZoom)

	/* What enclosing scopes wrote, then this scope's own, so the CSS merges as the config does. */
	const vars = useMemo(
		() => ({ ...inheritedVars, ...configToCssVars(config ?? {}) }),
		[inheritedVars, config],
	)

	const scopedStyle = useMemo<CSSProperties>(
		() => ({
			...(transparent ? { display: "contents" as const } : null),
			...vars,
			...style,
		}),
		[vars, transparent, style],
	)

	/*
	 * Attributes from the resolved config, not only this scope's overrides: derived tokens
	 * re-derive at every `[data-ui-scope]`, so a scope that sets only density must still
	 * restate the inherited theme or it re-derives as light (styles/SCOPES.md).
	 */
	const attributes = useMemo(() => configToAttributes(resolved), [resolved])

	const element = useRender({
		defaultTagName: "div",
		props: mergeProps<"div">(
			/* Data attributes are not in React's typed HTML props, hence the cast. */
			{ className, style: scopedStyle, ...attributes, "data-ui-scope": "", "data-iphone-input-zoom": String(preventIPhoneZoom) } as Record<string, unknown>,
			props,
		),
		render,
	})

	return (
		<UIConfigContext.Provider value={resolved}>
			<UIScopeVarsContext.Provider value={vars}>
				<UINestedContext.Provider value={true}>{element}</UINestedContext.Provider>
			</UIScopeVarsContext.Provider>
		</UIConfigContext.Provider>
	)
}
