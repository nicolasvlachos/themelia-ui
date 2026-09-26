import { cloneElement, type ReactElement, type ReactNode } from "react"

/*
 * Three-argument `cloneElement` replaces children even with `undefined`, emptying
 * `<Button render={<a href="/x">Go</a>} />`. Without children, return the element as is.
 */
export function renderWithChildren(element: ReactElement, children: ReactNode): ReactElement {
	if (children === undefined || children === null) return element
	return cloneElement(element, undefined, children)
}
