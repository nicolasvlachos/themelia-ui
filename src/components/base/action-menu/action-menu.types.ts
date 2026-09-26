import type { ComponentType, ReactNode } from "react"

import type { ButtonStyle, ButtonTone } from "@/components/base/buttons"

/** A Lucide icon, any component taking a className, or an already-rendered node. */
export type ActionIcon = ComponentType<{ className?: string }> | ReactNode

export type ActionMenuLabelVisibility = "visible" | "responsive" | "hidden"

/** One command, in the shape `ActionMenu`, `ActionButtons` and a card's `actions` all take. */
export interface ActionDefinition {
	/** Stable key. Falls back to a string `label`, then the index. */
	id?: string
	/**
	 * What the entry says. The only part of the row that gives way: a long label truncates
	 * instead of pushing the shortcut or trailing content off.
	 */
	label: ReactNode
	icon?: ActionIcon
	/**
	 * `checkbox` renders a toggle driven by `checked` / `onCheckedChange`.
	 * @default "item"
	 */
	type?: "item" | "checkbox"
	/**
	 * Renders the entry as a link. A native `<a href>` by default, which is a full page
	 * navigation — pass `renderLink` to route it through the app's router instead.
	 */
	href?: string
	target?: string
	rel?: string
	external?: boolean
	onClick?: () => void
	/** Second line under the label. */
	description?: ReactNode
	/** Trailing content — a keyboard shortcut, rendered in the shortcut treatment. */
	shortcut?: ReactNode
	/** Trailing content beside the shortcut — a badge, a count. */
	trailing?: ReactNode
	checked?: boolean
	onCheckedChange?: (checked: boolean) => void
	/**
	 * Starts a new group, ruling off above this entry. A string also captions it; `true`
	 * rules off without a heading (e.g. to set apart a sign-out or delete).
	 */
	group?: string | true
	/** Semantic intent. `destructive` also moves the entry last and separates it. */
	tone?: ButtonTone
	/** Treatment when the action renders as a button. `link` is a ghost that underlines. */
	buttonStyle?: ButtonStyle | "link"
	/**
	 * `false` omits the action entirely.
	 * @default true
	 */
	visible?: boolean
	disabled?: boolean
	/** Overrides the menu's `closeOnSelect` for this entry. */
	closeOnSelect?: boolean
	className?: string
	/** Replaces the rendered entry — a framework `<Link>`, for instance. */
	render?: ReactNode
}

/** Where an action renders when a set is split between buttons and a menu. */
export type ActionPlacement = "auto" | "inline" | "menu"

/** A flag, or a question asked of the subject the action is bound to. */
export type ActionPredicate<TContext> = boolean | ((context: TContext) => boolean)

/**
 * An action bound to a subject — a table row, a board card, an activity, a record. An
 * `ActionDefinition` whose handler and predicates take the subject; table, board and
 * activity actions extend it, and `resolveContextActions` resolves them.
 */
export interface ContextAction<TContext> extends Omit<ActionDefinition, "onClick" | "visible" | "disabled"> {
	/** Receives the subject the set was resolved against. */
	onClick?: (context: TContext) => void
	/**
	 * `false`, or a predicate returning false, omits the action for that subject.
	 * @default true
	 */
	visible?: ActionPredicate<TContext>
	/**
	 * Worked out per subject, so a locked row shows the action greyed rather than missing.
	 * @default false
	 */
	disabled?: ActionPredicate<TContext>
	/**
	 * Forces this entry to one side when the set is split between buttons and a menu:
	 * `inline` stays a button whatever `max` is, `menu` always overflows, and `auto` fills
	 * the buttons in order up to `max`.
	 * @default "auto"
	 */
	placement?: ActionPlacement
}

/** A fixed list, or one computed per subject. */
export type ContextActionSource<TContext> =
	| readonly ContextAction<TContext>[]
	| ((context: TContext) => readonly ContextAction<TContext>[])

/** A resolved entry: a plain `ActionDefinition` that still knows where it wants to go. */
export type ResolvedAction = ActionDefinition & { placement?: ActionPlacement }

declare module "@/lib/ui-provider" {
	interface ComponentDefaults {
		actionMenu: {
			align: "start" | "center" | "end"
			closeOnSelect: boolean
			labelVisibility: ActionMenuLabelVisibility
		}
	}
}
