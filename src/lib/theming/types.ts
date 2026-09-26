/**
 * The vocabulary theme synthesis works in. Part of the token contract, so build scripts
 * need not import a React feature; `features/theme-tweaker` re-exports them.
 */

export type ThemeMode = "light" | "dark"

export type ThemeVariableName = `--${string}`

/** A set of custom-property overrides, ready for a style attribute or a CSS string. */
export type ThemeOverrides = Partial<Record<ThemeVariableName, string>>
