/**
 * Actions bound to a subject (table row, board card, activity, page header), resolved and
 * split into buttons and overflow — one implementation for every renderer.
 */
import type {
	ActionPlacement, ContextAction, ContextActionSource, ResolvedAction,
} from "./action-menu.types"

export interface ResolveContextActionsOptions {
	/** Called after an action's own handler, with its id, for surfaces reporting all actions through one callback. */
	onAction?: (id: string) => void
	/** Drops `href` instead of rendering a link — for tables, where `href` is data the handler routes with. */
	stripHref?: boolean
}

/** Runs the predicates against `context` and binds each handler to it. */
export function resolveContextActions<TContext>(
	source: ContextActionSource<TContext> | undefined,
	context: TContext,
	options: ResolveContextActionsOptions = {},
): ResolvedAction[] {
	const list = typeof source === "function" ? source(context) : (source ?? [])
	const ask = (value: boolean | ((subject: TContext) => boolean) | undefined, fallback: boolean) =>
		typeof value === "function" ? value(context) : (value ?? fallback)

	return list.flatMap((action: ContextAction<TContext>, index): ResolvedAction[] => {
		if (!ask(action.visible, true)) return []
		const { onClick, visible: _visible, disabled, href, ...rest } = action
		void _visible
		const id = action.id ?? (typeof action.label === "string" ? action.label : String(index))
		return [
			{
				...rest,
				id,
				href: options.stripHref ? undefined : href,
				disabled: ask(disabled, false),
				onClick:
					onClick || options.onAction
						? () => {
								onClick?.(context)
								options.onAction?.(id)
							}
						: undefined,
			},
		]
	})
}

/**
 * Splits a set into buttons and overflow: `inline` entries are always buttons, `menu`
 * entries always overflow, the rest fill up to `max` in order. No `max`: all are buttons.
 */
export function splitActions<TAction extends { placement?: ActionPlacement }>(
	actions: readonly TAction[],
	max?: number,
): { inline: TAction[]; overflow: TAction[] } {
	const pinned = actions.filter((action) => action.placement === "inline")
	const forced = actions.filter((action) => action.placement === "menu")
	const undecided = actions.filter((action) => action.placement !== "inline" && action.placement !== "menu")
	const room = max === undefined ? undecided.length : Math.max(0, max - pinned.length)
	return {
		inline: [...pinned, ...undecided.slice(0, room)],
		overflow: [...undecided.slice(room), ...forced],
	}
}
