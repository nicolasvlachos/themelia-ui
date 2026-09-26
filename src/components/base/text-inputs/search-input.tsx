/**
 * SearchInput — `Input` with a leading search icon and a clear control; the native search
 * clear is suppressed.
 */
import { SearchIcon } from "lucide-react"
import * as React from "react"

import { cx } from "@/lib/cx"
import type { StringsProp } from "@/lib/strings"

import { Input, type InputProps } from "./input"
import { defaultSearchInputStrings, type InputStrings } from "./input.strings"
import styles from "./text-inputs.module.css"

export interface SearchInputProps extends Omit<InputProps, "type" | "startIcon"> {
	/**
	 * Called when the reader clears the field — a notification only, because Input does the
	 * clearing itself. The clear control is always present once there is a value.
	 */
	onClear?: () => void
	/**
	 * Overrides this field's own copy. It is Input's strings object with one default
	 * narrowed: a search field's only copy is one word of Input's.
	 * @default { clear: "Clear search" }
	 */
	strings?: StringsProp<InputStrings>
	/** Say what is being searched, not just "Search". */
	placeholder?: string
}

/**
 * Input with a leading magnifier and a clear control, and the native search clear
 * suppressed. It only pre-wires those two; everything else is Input's API.
 */
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
