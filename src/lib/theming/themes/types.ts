import type { UIConfig } from "@/lib/ui-provider"

/**
 * A ready-made theme: the name a picker shows, one line on what it is for, and the provider
 * config it sets. The config reaches past colour: radii, shadows and border weight (`theme`),
 * spacing (`density`), type (`typography`), motion, and how components draw themselves
 * (`defaults`). Pass `config` to `UIProvider`, or spread it under settings of your own.
 */
export interface ThemePreset {
	label: string
	description: string
	config: UIConfig
}
