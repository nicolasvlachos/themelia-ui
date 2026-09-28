import type { Density, ResolvedUIConfig, TextSize, UIConfig } from "./types"

/**
 * The lengths a density preset sets, in rem: what `scale` multiplies. The same values as
 * styles/theme/density.css, which sets them for a bare `data-density`.
 */
const DENSITY_LENGTHS: Record<Density, Record<string, number>> = {
	compact: { padding: 0.75, "padding-sm": 0.375, gap: 0.75, "gap-sm": 0.375, "control-height": 2, "control-height-sm": 1.75 },
	default: { padding: 1, "padding-sm": 0.5, gap: 1, "gap-sm": 0.5, "control-height": 2.125, "control-height-sm": 1.875 },
	comfortable: { padding: 1.25, "padding-sm": 0.625, gap: 1.25, "gap-sm": 0.625, "control-height": 2.25, "control-height-sm": 2 },
}

/** The two icon sizes, in rem, which `scale` moves with the geometry. */
const ICON_LENGTHS: Record<string, number> = { "icon-size": 1, "icon-size-sm": 0.75 }

/** The line box Text pairs with each step, for the provider's default text size. */
const LINE_BOX: Record<Exclude<TextSize, "inherit">, string> = {
	xs: "calc(1 / 0.75)",
	pxs: "calc(1.125 / 0.8125)",
	sm: "calc(1.25 / 0.875)",
	base: "1.5",
	lg: "calc(1.75 / 1.125)",
	xl: "calc(1.75 / 1.25)",
}

/**
 * Translates the token-bearing half of a config into CSS custom properties, returned as a
 * style object for the scope's own element so nesting merges through the cascade.
 *
 * The rule: a value that can be a token is CSS; a decision a component makes in JavaScript
 * stays in context. Nothing appears in both.
 *
 * `scale` is computed here rather than in CSS: it writes the spacing, control and icon
 * lengths themselves, from the density in effect (`resolved`, when a scope inherits one), and
 * the type factor. CSS never multiplies a factor except Text's own `--text-scale`. A scope
 * that changes density under a scaled ancestor writes its lengths at the inherited scale,
 * since the ancestor's lengths reach it inline and would outrank the preset.
 */
export function configToCssVars(config: UIConfig, resolved?: ResolvedUIConfig): Record<string, string> {
	const vars: Record<string, string> = {}
	const set = (name: string, value: string | undefined) => {
		if (value !== undefined) vars[`--${name}`] = value
	}

	const { theme, typography, motion, overlay } = config
	const inheritedScale = config.density !== undefined && resolved && resolved.scale !== 1 ? resolved.scale : undefined
	const scale = config.scale ?? inheritedScale

	if (scale !== undefined) {
		const density = resolved?.density ?? config.density ?? "default"
		for (const [name, rem] of Object.entries({ ...DENSITY_LENGTHS[density], ...ICON_LENGTHS })) {
			set(name, `round(${Number((rem * scale).toFixed(4))}rem, 1px)`)
		}
	}

	/* An explicit type factor wins; otherwise type follows the scope's master scale. */
	const textScale = typography?.scale ?? (scale !== undefined ? (resolved?.typography.scale ?? scale) : undefined)
	if (textScale !== undefined) set("text-scale", String(textScale))

	if (theme) {
		set("radius", theme.radius)
		set("radius-sm", theme.radiusSm)
		for (const [token, value] of Object.entries(theme.colors ?? {})) set(token, value)
		for (const [token, value] of Object.entries(theme.vars ?? {})) set(token, value)
	}

	/* Zero means no filter at all: `blur(0)` would still build the layer. */
	const blur = overlay?.backdropBlur
	if (blur !== undefined && blur !== 0 && blur !== "0" && blur !== "") {
		set("overlay-backdrop-filter", `blur(${typeof blur === "number" ? `${blur}px` : blur})`)
	}

	if (typography) {
		for (const [role, stack] of Object.entries(typography.fonts ?? {})) set(`font-${role}`, stack)
		for (const [step, size] of Object.entries(typography.sizes ?? {})) set(`text-${step}`, size)

		/*
		 * The default text step as a token, not a context read, so `Text` needs no hook and
		 * stays Server Component safe. `inherit` writes nothing: that is already the unset case.
		 */
		if (typography.defaultTextSize !== undefined && typography.defaultTextSize !== "inherit") {
			const step = typography.defaultTextSize
			set("text-default", `var(--text-${step})`)
			set("text-default--line-height", LINE_BOX[step])
		}
	}

	if (motion) {
		for (const [step, value] of Object.entries(motion.durations ?? {})) {
			set(step === "normal" ? "duration" : `duration-${step}`, value)
		}
		// `reduced: true` forces motion off; otherwise `prefers-reduced-motion` governs.
		if (motion.reduced === true) {
			set("duration-fast", "0ms")
			set("duration", "0ms")
		}
	}

	return vars
}

/**
 * Attributes the stylesheet keys off. Density is an attribute, not a variable, so the
 * preset values stay in styles/theme/density.css and a bare `data-density` works too.
 * `default` writes nothing, so the theme's own lengths, a consumer's `:root` overrides
 * included, apply; a scope resetting a denser region writes it itself (UIScope).
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
