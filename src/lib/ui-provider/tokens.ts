import type { UIConfig } from "./types"

/**
 * Translates the token-bearing half of a config into CSS custom properties, returned as a
 * style object for the scope's own element so nesting merges through the cascade.
 *
 * The rule: a value that can be a token is CSS; a decision a component makes in JavaScript
 * stays in context. Nothing appears in both.
 */
export function configToCssVars(config: UIConfig): Record<string, string> {
	const vars: Record<string, string> = {}
	const set = (name: string, value: string | undefined) => {
		if (value !== undefined) vars[`--${name}`] = value
	}

	const { theme, typography, motion, overlay, scale } = config

	// A continuous value, so a variable rather than a preset attribute like density.
	if (scale !== undefined) set("scale", String(scale))

	if (theme) {
		set("radius", theme.radius)
		set("radius-sm", theme.radiusSm)
		for (const [token, value] of Object.entries(theme.colors ?? {})) set(token, value)
		for (const [token, value] of Object.entries(theme.palette ?? {})) set(token, value)
		for (const [token, value] of Object.entries(theme.vars ?? {})) set(token, value)
	}

	/* Zero means no filter at all: `blur(0)` would still build the layer. */
	const blur = overlay?.backdropBlur
	if (blur !== undefined && blur !== 0 && blur !== "0" && blur !== "") {
		set("overlay-backdrop-filter", `blur(${typeof blur === "number" ? `${blur}px` : blur})`)
	}

	if (typography) {
		// The type factor, separate from --scale so type and controls move independently.
		if (typography.scale !== undefined) set("text-scale", String(typography.scale))
		for (const [role, stack] of Object.entries(typography.fonts ?? {})) set(`font-${role}`, stack)
		for (const [step, size] of Object.entries(typography.sizes ?? {})) set(`text-${step}`, size)

		/*
		 * The default text step as a token, not a context read, so `Text` needs no hook and
		 * stays Server Component safe. `inherit` writes nothing: that is already the unset case.
		 * `xxs` has no step of its own and renders as `xs`, as the `Text` size class does.
		 */
		if (typography.defaultTextSize !== undefined && typography.defaultTextSize !== "inherit") {
			const step = typography.defaultTextSize === "xxs" ? "xs" : typography.defaultTextSize
			set("text-default", `var(--text-${step})`)
			set("text-default--line-height", `var(--text-${step}--line-height)`)
		}
	}

	if (motion) {
		for (const [step, value] of Object.entries(motion.durations ?? {})) set(`duration-${step}`, value)
		// `reduced: true` forces motion off; otherwise `prefers-reduced-motion` governs.
		if (motion.reduced === true) {
			set("duration-instant", "0ms")
			set("duration-fast", "0ms")
			set("duration-normal", "0ms")
		}
	}

	return vars
}

/**
 * Attributes the stylesheet keys off. Density is an attribute, not a variable, so the
 * preset values stay in styles/tokens/foundation.css and a bare `data-density` works too.
 */
export function configToAttributes(config: UIConfig): Record<string, string | undefined> {
	const attributes: Record<string, string | undefined> = {}

	if (config.density && config.density !== "default") {
		attributes["data-density"] = config.density
	}
	// `system` writes nothing so `prefers-color-scheme` governs.
	if (config.colorScheme === "light" || config.colorScheme === "dark") {
		attributes["data-theme"] = config.colorScheme
	}

	return attributes
}
