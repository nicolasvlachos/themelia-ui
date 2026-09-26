import type { CSSProperties, ElementType, ReactNode } from "react"

/**
 * `<Scope>` — a token boundary without the config machinery. Derived tokens re-compute
 * only at a scope boundary (styles/SCOPES.md), so a factor set on a plain `div` changes
 * nothing; this renders `data-ui-scope`. Use `<UIProvider>` when JavaScript config changes too.
 *
 *   <Scope vars={{ "--density-scale": 0.8 }}>
 *     <Toolbar />
 *   </Scope>
 */
export function Scope({
	vars,
	as: Tag = "div",
	transparent = true,
	className,
	style,
	children,
}: {
	/** Custom properties to set. Keys include the leading `--`. */
	vars: Record<string, string | number>
	as?: ElementType
	/** Removes the wrapper from layout. Custom properties still inherit through it. */
	transparent?: boolean
	className?: string
	style?: CSSProperties
	children: ReactNode
}) {
	return (
		<Tag
			data-ui-scope=""
			className={className}
			style={{
				...(transparent ? { display: "contents" as const } : null),
				...vars,
				...style,
			}}
		>
			{children}
		</Tag>
	)
}
