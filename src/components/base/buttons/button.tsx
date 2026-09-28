/**
 * Button — the kit's action primitive. `tone` (colour intent) and `appearance` (fill) are
 * independent axes: the tone reaches the stylesheet as `data-tone`, through the shared tone
 * rule, and button-tones.module.css applies each appearance to it. Defaults resolve through
 * the provider, so a scope can restyle every button in it.
 */
import * as React from "react"

import { Slot } from "@/components/base/slot"
import { textClassName } from "@/components/base/typography"
import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import { useDefaults } from "@/lib/ui-provider"

import styles from "./button.module.css"
import toneStyles from "./button-tones.module.css"
import type { ButtonAppearance, ButtonTone } from "./button.types"

/* An explicit map keeps the camel-cased module lookups type-checked. */
const APPEARANCE_CLASS: Record<ButtonAppearance, string> = {
	solid: toneStyles.appearanceSolid,
	outline: toneStyles.appearanceOutline,
	ghost: toneStyles.appearanceGhost,
}

const BUTTON_DEFAULTS = {
	tone: "primary" as ButtonTone,
	appearance: "solid" as ButtonAppearance,
}

const shapeVariants = cvm(styles.root, {
	variants: {
		iconOnly: { true: styles.iconOnly, false: undefined },
		fullWidth: { true: styles.fullWidth, false: undefined },
	},
})

export interface ButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
	/**
	 * Semantic colour intent. Resolves through the provider when omitted, so `UIProvider`
	 * defaults can change it.
	 * @default "primary"
	 */
	tone?: ButtonTone
	/**
	 * Fill treatment, independent of `tone`. `UIProvider` defaults can change it.
	 * @default "solid"
	 */
	appearance?: ButtonAppearance
	/** Square button sized to its height. The label becomes the accessible name. */
	iconOnly?: boolean
	/** Stretches the button to its container's width. */
	fullWidth?: boolean
	/**
	 * Shows a spinner and blocks interaction. The label keeps its space so the button does
	 * not resize mid-action.
	 */
	loading?: boolean
	/**
	 * The element this button becomes — an anchor, a router link, a label. `children` stay
	 * the content and keep the button's label wrapper, so a link still sizes like a button.
	 * `render` is how every kit component changes its element, the contract Base UI's parts
	 * already take.
	 *
	 *   <Button render={<a href="/settings" />}>Settings</Button>
	 */
	render?: React.ReactElement
	children?: React.ReactNode
}

/**
 * The kit's action primitive. No `size` prop by design: geometry follows the provider's density
 * and scale, so a denser region is a scope.
 */
export function Button({
	tone,
	appearance,
	iconOnly = false,
	fullWidth = false,
	loading = false,
	render,
	className,
	disabled,
	children,
	onClick,
	...props
}: ButtonProps) {
	const label = <span className={loading ? styles.loadingLabel : styles.label}>{children}</span>
	/*
	 * The label goes inside the caller's element. With no `children`, the element keeps its
	 * own content: three-argument `cloneElement` would replace it with an empty label.
	 */
	const polymorphicChildren = render
		? children === undefined || children === null
			? render
			: React.cloneElement(render, undefined, label)
		: label

	const defaults = useDefaults("button", BUTTON_DEFAULTS)
	const resolvedTone = tone ?? defaults.tone
	const resolvedAppearance = appearance ?? defaults.appearance

	const polymorphic = render !== undefined
	const inline = (props as Record<string, unknown>)["data-slot"] === "text-button"
	const Comp = polymorphic ? Slot : "button"

	/*
	 * Loading blocks via `aria-disabled` and the click guard, not native `disabled`, which
	 * would blur the focused button. The guard also catches a form's implicit submit. A
	 * disabled polymorphic button takes the same route, since an anchor cannot be disabled.
	 */
	const blocked = loading || (polymorphic && !!disabled)
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (blocked) {
			event.preventDefault()
			return
		}
		onClick?.(event)
	}

	return (
		<Comp
			data-slot="button"
			data-tone={resolvedTone}
			data-appearance={resolvedAppearance}
			data-loading={loading ? "" : undefined}
			type={polymorphic ? undefined : "button"}
			disabled={polymorphic ? undefined : disabled}
			aria-disabled={blocked || props["aria-disabled"] || undefined}
			aria-busy={loading || undefined}
			onClick={handleClick}
			className={cx(
				"button--component",
				shapeVariants({ iconOnly, fullWidth }),
				APPEARANCE_CLASS[resolvedAppearance],
				/* A text button is prose: it takes the surrounding size. */
				inline
					? textClassName({ size: "inherit", weight: "medium" })
					: textClassName({ size: "sm", weight: "medium", lineHeight: "none" }),
				className,
			)}
			{...props}
		>
			{/* The spinner is a ::after on the root, so `loading` works in both paths. */}
			{polymorphicChildren}
		</Comp>
	)
}
