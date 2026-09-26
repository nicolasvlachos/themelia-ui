import type { SemanticTone } from "@/lib/component-vocabulary"

/** Fill treatment. Structural, independent of the tone's colour. */
export type ButtonStyle = "solid" | "outline" | "ghost"

export type ButtonTone = SemanticTone

declare module "@/lib/ui-provider" {
	interface ComponentDefaults {
		/** Registered here, not in the provider's core type, so adding a family never edits `lib/`. */
		button: {
			tone: ButtonTone
			buttonStyle: ButtonStyle
		}
	}
}
