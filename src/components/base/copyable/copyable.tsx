import { CheckIcon, CopyIcon } from "lucide-react"
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"

import { Button, type ButtonProps } from "@/components/base/buttons"
import { toast } from "@/components/base/toaster"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultCopyableStrings, type CopyableStrings } from "./copyable.strings"
import { useCopyToClipboard } from "./use-copy-to-clipboard"
import styles from "./copyable.module.css"

export interface CopyableProps
	extends Omit<ComponentPropsWithoutRef<"span">, "children" | "onCopy" | "onError"> {
	/** What lands on the clipboard. */
	value: string
	/**
	 * Shown instead of the raw value, when it differs from what is copied. A rich node is
	 * rendered as-is.
	 */
	displayValue?: ReactNode
	/**
	 * Monospaced, tabular figures for the display content — for an id, a key or a hash, where
	 * one character matters.
	 */
	mono?: boolean
	/** Truncates the display content at the width the caller allots, keeping the button in view. */
	truncate?: boolean
	/**
	 * Sizes the trigger to the text rather than to a control's height. A control's height is
	 * right beside a field and wrong inside a list row where the value is a description under
	 * a title: there the button is twice the height of the line it belongs to, and the row's
	 * rhythm bends around it. Every behaviour is unchanged, and the target keeps its minimum
	 * hit area; what it gives up is the pointer target a standalone control is entitled to.
	 */
	compact?: boolean
	/**
	 * Overrides this control's own copy. The name changes between `copy` and `copied`, because
	 * the confirmation is the name for a screen reader.
	 */
	strings?: Partial<CopyableStrings>
	/** Suppresses both toasts. The copied state on the control is the confirmation then. */
	silent?: boolean
	/** Passed to the copy control, for a tone or a treatment that suits the surface. */
	buttonProps?: Omit<ButtonProps, "children" | "onClick" | "type">
	/** Called with the value once it is on the clipboard. */
	onCopy?: (value: string) => void
	/**
	 * Called when the clipboard refuses — an insecure origin, a denied permission. A copy that
	 * fails silently is worse than one that never offered.
	 */
	onError?: (error: unknown) => void
}

export const Copyable = forwardRef<HTMLSpanElement, CopyableProps>(function Copyable(
	{
		value,
		displayValue,
		mono = false,
		truncate = false,
		compact = false,
		strings,
		silent = false,
		className,
		buttonProps,
		onCopy,
		onError,
		...props
	},
	ref,
) {
	const copy = { ...defaultCopyableStrings, ...strings }

	/* The hook's default window: how long the check mark replaces the copy glyph. */
	const { copied, copy: writeCopy } = useCopyToClipboard({
		onCopy: (copiedValue) => {
			if (!silent) toast.success(copy.success)
			onCopy?.(copiedValue)
		},
		onError: (error) => {
			if (!silent) toast.error(copy.error)
			onError?.(error)
		},
	})

	const isSimpleText =
		typeof displayValue === "string" ||
		typeof displayValue === "number" ||
		typeof displayValue === "bigint"
	const hasRichDisplayValue = displayValue !== undefined && !isSimpleText

	const { className: buttonClassName, "aria-label": buttonAriaLabel, ...restButtonProps } =
		buttonProps ?? {}

	return (
		<span
			ref={ref}
			className={cx("copyable--component", styles.root, truncate && styles.truncateRoot, className)}
			{...props}
		>
			<span className={cx("copyable--content", styles.content)}>
				{hasRichDisplayValue ? (
					displayValue
				) : (
					<Text
						tag="span"
						size="inherit"
						truncate={truncate}
						className={cx(mono && styles.mono)}
					>
						{displayValue ?? value}
					</Text>
				)}
			</span>
			<Button
				{...restButtonProps}
				type="button"
				iconOnly
				tone="neutral"
				buttonStyle="ghost"
				aria-label={buttonAriaLabel ?? (copied ? copy.copied : copy.copy)}
				// Compact glyph, full-size target (styles/targets.css).
				data-hit-area={compact ? "" : undefined}
				onClick={() => void writeCopy(value)}
				className={cx(
					"copyable--trigger",
					styles.trigger,
					compact && styles.triggerCompact,
					buttonClassName,
				)}
			>
				{copied ? (
					<CheckIcon aria-hidden className={styles.confirmIcon} />
				) : (
					<CopyIcon aria-hidden />
				)}
			</Button>
		</span>
	)
})
