/**
 * Button — the kit's action primitive. `tone` (colour intent) and `buttonStyle` (fill) are
 * independent axes; the tone × style matrix lives in button-tones.module.css.
 * Defaults resolve through the provider, so a scope can restyle every button in it.
 */
import * as React from "react"

import { Slot } from "@/components/base/slot"
import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"
import { useDefaults } from "@/lib/ui-provider"

import styles from "./button.module.css"
import toneStyles from "./button-tones.module.css"
import type { ButtonStyle, ButtonTone } from "./button.types"

/* Explicit maps keep the camel-cased module lookups type-checked. */
const TONE_CLASS: Record<ButtonTone, string> = {
	neutral: toneStyles.toneNeutral,
	primary: toneStyles.tonePrimary,
	secondary: toneStyles.toneSecondary,
	info: toneStyles.toneInfo,
	success: toneStyles.toneSuccess,
	warning: toneStyles.toneWarning,
	destructive: toneStyles.toneDestructive,
}

const STYLE_CLASS: Record<ButtonStyle, string> = {
	solid: toneStyles.styleSolid,
	outline: toneStyles.styleOutline,
	ghost: toneStyles.styleGhost,
}

const BUTTON_DEFAULTS = {
	tone: "primary" as ButtonTone,
	buttonStyle: "solid" as ButtonStyle,
}

const shapeVariants = cvm(styles.root, {
	variants: {
		iconOnly: { true: styles.iconOnly, false: undefined },
		fullWidth: { true: styles.fullWidth, false: undefined },
	},
})

export interface ButtonProps extends Omit<React.ComponentProps<"button">, "children"> {
	/** Semantic colour intent. */
	tone?: ButtonTone
	/** Fill treatment. */
	buttonStyle?: ButtonStyle
	/** Square button sized to its height. The label becomes the accessible name. */
	iconOnly?: boolean
	fullWidth?: boolean
	/**
	 * Shows a spinner and blocks interaction. The label keeps its space so the button does
	 * not resize mid-action.
	 */
	loading?: boolean
	/**
	 * The element this button becomes — an anchor, a router link, a label (docs/adr/0005).
	 * `children` stay the content and keep the button's label wrapper.
	 *
	 *   <Button render={<a href="/settings" />}>Settings</Button>
	 */
	render?: React.ReactElement
	children?: React.ReactNode
}

/**
 * No `size` prop by design: geometry follows the scale factors, so a denser region is a
 * scope (styles/FACTORS.md).
 */
export function Button({
	tone,
	buttonStyle,
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
	const resolvedStyle = buttonStyle ?? defaults.buttonStyle

	const polymorphic = render !== undefined
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
			data-style={resolvedStyle}
			data-loading={loading ? "" : undefined}
			type={polymorphic ? undefined : "button"}
			disabled={polymorphic ? undefined : disabled}
			aria-disabled={blocked || props["aria-disabled"] || undefined}
			aria-busy={loading || undefined}
			onClick={handleClick}
			className={cx(
				"button--component",
				shapeVariants({ iconOnly, fullWidth }),
				TONE_CLASS[resolvedTone],
				STYLE_CLASS[resolvedStyle],
				className,
			)}
			{...props}
		>
			{/* The spinner is a ::after on the root, so `loading` works in both paths. */}
			{polymorphicChildren}
		</Comp>
	)
}
