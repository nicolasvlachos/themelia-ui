/**
 * Ready-made themes, each a different style rather than a different colour: Soft, Sharp,
 * Dense and Editorial. Pass a theme's `config` to `UIProvider` for the page or to a nested one
 * for a region, and switch themes by switching which config you pass. A theme of your own is
 * the same shape.
 */
import { dense } from "./dense"
import { editorial } from "./editorial"
import { sharp } from "./sharp"
import { soft } from "./soft"

export const themes = { soft, sharp, dense, editorial }

export type ThemeName = keyof typeof themes

export type { ThemePreset } from "./types"
