/** TextLink — an inline link; renders an anchor, or a router's link via `render`. */
import * as React from "react"

import { cvm, type VariantProps } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import styles from "./text-link.module.css"

const linkVariants = cvm(styles.root, {
	variants: {
		variant: {
			default: undefined,
			subtle: styles.subtle,
		},
	},
	defaultVariants: { variant: "default" },
})

export interface TextLinkProps
	extends React.ComponentProps<"a">,
		VariantProps<typeof linkVariants> {
	/** A router link element to render instead of an anchor. */
	render?: React.ReactElement<{ className?: string }>
}

export function TextLink({ className, variant, render, children, ...props }: TextLinkProps) {
	const resolved = linkVariants({ variant, className })

	if (render) {
		return React.cloneElement(render, {
			...props,
			className: [render.props.className, resolved].filter(Boolean).join(" "),
			"data-typography": "link",
			children,
		} as React.HTMLAttributes<HTMLElement>)
	}

	return (
		<a data-typography="link" className={cx("text-link--component", resolved)} {...props}>
			{children}
		</a>
	)
}
