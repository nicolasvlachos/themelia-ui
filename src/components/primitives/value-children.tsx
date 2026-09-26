import type { ReactNode } from "react"

export function renderValueChildren(children: ReactNode, emptyLabel: ReactNode) {
	if (children === null || children === undefined || children === "") return emptyLabel
	return children
}
