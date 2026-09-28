/** A colour for both modes: the half each element's `color-scheme` picks. */
export const pair = (light: string, dark: string) => `light-dark(${light}, ${dark})`

/**
 * No shadow, written as one. A popup lists `--shadow-lg` after its hairline, and `none` cannot
 * stand in a list: the whole declaration would drop, taking the hairline with it.
 */
export const NO_SHADOW = "0 0 transparent"
