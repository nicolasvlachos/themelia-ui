/**
 * SearchInput — `Input` with a leading search icon and a clear control; the native search
 * clear is suppressed.
 */
import { SearchIcon } from "lucide-react"
import * as React from "react"

import { cx } from "@/lib/cx"

import { Input, type InputProps } from "./input"
import { defaultSearchInputStrings } from "./input.strings"
import styles from "./text-inputs.module.css"

export interface SearchInputProps extends Omit<InputProps, "type" | "startIcon"> {
	/** Called when the reader clears the field. The clear control is always offered. */
	onClear?: () => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
	function SearchInput({ onClear, className, strings, ...props }, ref) {
		return (
			<Input
				ref={ref}
				type="search"
				className={cx("search-input--component", styles.search, className)}
				startIcon={<SearchIcon aria-hidden />}
				/* Always clearable: Input clears itself; onClear is only a notification. */
				clearable
				onClear={onClear}
				strings={{ ...defaultSearchInputStrings, ...strings }}
				{...props}
			/>
		)
	},
)
