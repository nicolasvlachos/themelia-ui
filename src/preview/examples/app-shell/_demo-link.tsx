import type { AppSidebarProps } from "themelia-ui/layout/sidebar"

type LinkRenderer = NonNullable<AppSidebarProps["renderLink"]>

export function demoLink(onNavigate: (url: string) => void): LinkRenderer {
	return ({ href, children, active, disabled, external, ...rest }) => {
		void active
		void external
		if (disabled) return <span {...rest}>{children}</span>
		return <a {...rest} href={href} onClick={event => { event.preventDefault(); if (href) onNavigate(href) }}>{children}</a>
	}
}
