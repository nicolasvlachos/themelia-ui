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
	/** Value written to the clipboard. */
	value: string
	/** Display content, when it differs from the copied value. */
	displayValue?: ReactNode
	/** Monospace the display content. For ids, keys, and hashes. */
	mono?: boolean
	/** Truncates the display content at the width the caller allots. */
	truncate?: boolean
	/**
	 * Sizes the trigger to the text rather than a control's height, for values inside a list
	 * row. The target keeps its minimum hit area.
	 */
	compact?: boolean
	/** Overrides this control's own copy. */
	strings?: Partial<CopyableStrings>
	/** Suppresses the toasts. The copied state on the control is the confirmation then. */
	silent?: boolean
	buttonProps?: Omit<ButtonProps, "children" | "onClick" | "type">
	onCopy?: (value: string) => void
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
