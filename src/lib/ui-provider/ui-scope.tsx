import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { useContext, useMemo, type CSSProperties } from "react"

import { UIConfigContext, UINestedContext, UIScopeVarsContext, mergeUIConfig } from "./context"
import { configToAttributes, configToCssVars } from "./tokens"
import type { UIConfig } from "./types"
import { useIPhoneInputZoom } from "./use-iphone-input-zoom"

export interface UIScopeProps extends useRender.ComponentProps<"div"> {
	/**
	 * Its own overrides only, merged over the nearest enclosing scope or root; inherited
	 * values already cascade in.
	 */
	config?: UIConfig
	/**
	 * Removes the element from layout with `display: contents`; custom properties still
	 * inherit through it, because inheritance does not depend on the box. Set `false` when
	 * the scope should be a real box, such as a themed panel.
	 */
	transparent?: boolean
}

/**
 * `<UIScope>` — a region with its own tokens. Nests freely; writes the custom properties
 * its merged config names and never touches the document: a region governs its subtree,
 * and reaching past it is the root's job, and only when asked. `render` picks the element
 * — Base UI's contract, the same one Item and Stack use — e.g. `<UIScope render={<aside />}>`,
 * for places a `div` is invalid.
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
		() => ({ ...inheritedVars, ...configToCssVars(config ?? {}, resolved) }),
		[inheritedVars, config, resolved],
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
	 * Attributes from the resolved config, so each scope states the scheme and density in
	 * effect. The variables it restates above are inline and outrank the density preset, so
	 * stating an inherited density never undoes an inherited scale. An explicit `default`
	 * inside a denser or roomier region is written too, since it resets that region.
	 */
	const resets = config?.density === "default" && parent.density !== "default"
	const attributes = useMemo(
		() => ({ ...configToAttributes(resolved), ...(resets ? { "data-density": "default" } : null) }),
		[resolved, resets],
	)

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
