/**
 * MoneyInput — the canonical monetary editor: amount and currency as one value, so a form
 * can't submit one without the other (use `CurrencyInput` when they are stored apart). The
 * amount stays a string: floats lose cents, and parsing is the caller's decision.
 */
import { forwardRef, useCallback } from "react"

import { cx } from "@/lib/cx"

import { CurrencyInput, type CurrencyInputProps } from "./currency-input"

export interface MoneyValue {
	/** The amount, as typed. Never parsed here. */
	amount: string
	/** ISO 4217 code. */
	currency: string
}

export interface MoneyInputProps
	extends Omit<CurrencyInputProps, "value" | "defaultValue" | "onChange" | "currency" | "onCurrencyChange"> {
	value?: MoneyValue
	onValueChange?: (value: MoneyValue) => void
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
	{ value, onValueChange, currencies = ["USD", "EUR", "GBP"], className, ...props },
	ref,
) {
	const amount = value?.amount ?? ""
	const currency = value?.currency ?? (typeof currencies[0] === "string" ? currencies[0] : currencies[0]?.value) ?? ""

	const setAmount = useCallback(
		(next: string) => onValueChange?.({ amount: next, currency }),
		[currency, onValueChange],
	)

	const setCurrency = useCallback(
		(next: string) => onValueChange?.({ amount, currency: next }),
		[amount, onValueChange],
	)

	return (
		<CurrencyInput
			{...props}
			ref={ref}
			currencies={currencies}
			value={amount}
			onChange={(event) => setAmount(event.target.value)}
			currency={currency}
			onCurrencyChange={setCurrency}
			className={cx("money-input--component", className)}
		/>
	)
})
