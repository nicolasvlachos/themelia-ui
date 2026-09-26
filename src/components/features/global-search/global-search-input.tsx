/**
 * The search row at the top of the palette: the kit's `Input` supplies the magnifier
 * (`startIcon`), clear control (`clearable`) and spinner (`loading`).
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, type KeyboardEvent } from "react"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import styles from "./global-search.module.css"

export interface GlobalSearchInputProps {
	value: string
	onValueChange: (value: string) => void
	onKeyDown?: (event: KeyboardEvent) => void
	placeholder?: string
	/** Accessible name for the clear control. */
	clearLabel?: string
	loading?: boolean
	autoFocus?: boolean
	className?: string
}

export const GlobalSearchInput = forwardRef<HTMLInputElement, GlobalSearchInputProps>(
	function GlobalSearchInput(
		{ value, onValueChange, onKeyDown, placeholder, clearLabel, loading = false, autoFocus = false, className },
		ref,
	) {
		const inner = useRef<HTMLInputElement>(null)
		useImperativeHandle(ref, () => inner.current as HTMLInputElement)

		/* Focused in an effect: the enclosing dialog moves focus to itself after the `autoFocus` attribute fires. */
		useEffect(() => {
			if (autoFocus) inner.current?.focus()
		}, [autoFocus])

		return (
			<div className={cx("global-search-input--component", styles.inputRow, className)}>
				<Input
					ref={inner}
					type="text"
					value={value}
					onChange={(event) => onValueChange(event.target.value)}
					onKeyDown={onKeyDown}
					placeholder={placeholder}
					aria-label={placeholder}
					autoComplete="off"
					spellCheck={false}
					startIcon={SearchIcon}
					clearable={!loading}
					onClear={() => onValueChange("")}
					loading={loading}
					strings={clearLabel ? { clear: clearLabel } : undefined}
					className={styles.input}
				/>
			</div>
		)
	},
)
