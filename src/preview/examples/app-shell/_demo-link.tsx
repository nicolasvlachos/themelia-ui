import type { LayoutLinkRenderer } from "themelia-ui/layout/sidebar"

export function demoLink(onNavigate: (url: string) => void): LayoutLinkRenderer {
	return ({ href, children, active, disabled, external, ...rest }) => {
		void active
		void external
		if (disabled) return <span {...rest}>{children}</span>
		return <a {...rest} href={href} onClick={event => { event.preventDefault(); if (href) onNavigate(href) }}>{children}</a>
	}
}
