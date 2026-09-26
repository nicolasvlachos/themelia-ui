/**
 * CurrencyInput — an amount and its currency in separate channels; "€1,234.50" in one
 * string needs a locale-dependent parse downstream.
 */
import { forwardRef, useCallback, useMemo, useState } from "react"
import { CURRENCY_SYMBOLS } from "./currency-symbols"

import { Select } from "@/components/base/choice-inputs"
import { cx } from "@/lib/cx"

import { DecimalInput, type DecimalInputProps } from "./decimal-input"
import { defaultCurrencyInputStrings, type CurrencyInputStrings } from "./forms-numeric.strings"
import styles from "./forms-numeric.module.css"

export interface CurrencyOption {
	value: string
	label: string
}


export interface CurrencyInputProps extends Omit<DecimalInputProps, "prefix"> {
	/** Controlled currency code, e.g. "EUR". */
	currency?: string
	defaultCurrency?: string
	onCurrencyChange?: (currency: string) => void
	/** Codes are looked up in CURRENCY_SYMBOLS; anything else takes a full option. */
	currencies?: (string | CurrencyOption)[]
	/** Which side the selector sits on. */
	currencyPosition?: "start" | "end"
	disableCurrencySelector?: boolean
	/** Overrides this field's own copy — the currency selector's name. */
	strings?: Partial<CurrencyInputStrings>
	invalid?: boolean
}

function normalizeCurrencies(currencies: (string | CurrencyOption)[]): CurrencyOption[] {
	return currencies.map((entry) => {
		if (typeof entry !== "string") return entry
		const symbol = CURRENCY_SYMBOLS[entry]
		return { value: entry, label: symbol ? `${symbol} ${entry}` : entry }
	})
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(function CurrencyInput(
	{
		currency,
		defaultCurrency,
		onCurrencyChange,
		currencies = ["USD", "EUR", "GBP"],
		currencyPosition = "start",
		disableCurrencySelector = false,
		strings,
		invalid,
		disabled,
		className,
		...props
	},
	ref,
) {
		const copy = { ...defaultCurrencyInputStrings, ...strings }
	const options = useMemo(() => normalizeCurrencies(currencies), [currencies])
	const isControlled = currency !== undefined
	const [internal, setInternal] = useState(defaultCurrency ?? options[0]?.value ?? "")
	const resolved = isControlled ? (currency ?? "") : internal

	const setCurrency = useCallback(
		(next: string | undefined) => {
			const value = next ?? ""
			if (!isControlled) setInternal(value)
			onCurrencyChange?.(value)
		},
		[isControlled, onCurrencyChange],
	)

	const selector = disableCurrencySelector ? null : (
		<div className={styles.currencyColumn}>
			<Select
				options={options}
				value={resolved || null}
				onValueChange={setCurrency}
				disabled={disabled}
				invalid={invalid}
				aria-label={copy.currency}
			/>
		</div>
	)

	return (
		<div className={cx("currency-input--component", styles.row, className)}>
			{currencyPosition === "start" && selector}
			<div className={styles.grow}>
				<DecimalInput
					{...props}
					ref={ref}
					disabled={disabled}
					/* Keep a parent's `aria-invalid` (e.g. from FormField) when `invalid` isn't passed; see text-inputs/input.tsx. */
					aria-invalid={invalid || props["aria-invalid"] || undefined}
					// Refunds and credits are negative; a price field sets min={0}.
					allowNegative={props.allowNegative ?? true}
				/>
			</div>
			{currencyPosition === "end" && selector}
		</div>
	)
})
