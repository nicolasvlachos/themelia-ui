import { isValidElement, type ComponentType, type ReactNode } from "react"

import type { ChoiceOption } from "../choice.types"

/** A plain string is wrapped in the typography component; a node is left exactly as passed. */
export function isSimpleText(value: ReactNode): value is string | number | bigint {
	return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
}

/** Accepts a component or an already-rendered node, so callers can pass `PlusIcon` or `<PlusIcon />`. */
export function renderChoiceIcon(icon: ChoiceOption["icon"]): ReactNode {
	if (!icon) return null
	if (isValidElement(icon)) return icon
	if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
		const Icon = icon as ComponentType<{ "aria-hidden"?: boolean }>
		return <Icon aria-hidden />
	}
	return icon as ReactNode
}
