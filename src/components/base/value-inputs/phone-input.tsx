/**
 * PhoneInput — a dial-code picker and a national number, kept apart so the prefix is always
 * known and the number always national.
 */
import { forwardRef, useCallback, useMemo, useState, type FocusEvent } from "react"

import { Select } from "@/components/base/choice-inputs"
import { Input, type InputProps } from "@/components/base/text-inputs"
import { cx } from "@/lib/cx"

import {
	COUNTRY_PREFIX_MAP, DEFAULT_COUNTRY_PREFIXES, normalizeCountryPrefix,
	type CountryPrefixInput, type CountryPrefixOption,
} from "./country-prefixes"
import { defaultPhoneInputStrings, type PhoneInputStrings } from "./value-inputs.strings"
import styles from "./value-inputs.module.css"

export interface PhoneInputProps extends Omit<InputProps, "type" | "prefix"> {
	/** Applies the invalid treatment to both the picker and the number field. */
	invalid?: boolean
	/** Controlled dial code, e.g. "+1", or an ISO code that is resolved to one. */
	prefix?: string
	defaultPrefix?: string
	onPrefixChange?: (prefix: string) => void
	/** The list offered. ISO codes are looked up; unknown countries take a full object. */
	prefixes?: CountryPrefixInput[]
	/** Hides the picker, for a form that captures the country elsewhere. */
	disablePrefixSelector?: boolean
	/** Overrides this field's own copy — the dial-code lane. */
	strings?: Partial<PhoneInputStrings>
	/** Tidies the number when the field loses focus. */
	normalizeOnBlur?: boolean
	/** Shows the country name beside the dial code in the list. */
	showCountryName?: boolean
}

// Dial codes whose national numbers keep the leading zero (Italy: +39 06…).
const KEEPS_TRUNK_ZERO = new Set(["+39", "+378", "+379"])

/**
 * Strips what a national number should not contain, including a typed copy of the selected
 * prefix and the trunk zero (Dutch 06… is +31 6…). An extension is kept.
 */
function normalizeNumber(value: string, prefix: string | undefined, prefixShown: boolean): string {
	const extension = /\s*(?:ext\.?|extension|x|#)\s*(\d+)\s*$/i.exec(value)
	const main = extension ? value.slice(0, extension.index) : value
	let normalized = main
		.trim()
		.replace(/\s+/g, " ")
		.replace(/[^\d ()+-]/g, "")

	if (prefix && normalized.startsWith(prefix)) {
		normalized = normalized.slice(prefix.length).replace(/^[\s-]+/, "")
	}
	// Only with the picker shown; otherwise the number is the whole number and its zero stays.
	if (prefix && prefixShown && !KEEPS_TRUNK_ZERO.has(prefix) && normalized.startsWith("0")) {
		normalized = normalized.slice(1)
	}

	return extension ? `${normalized} ext. ${extension[1]}` : normalized
}

/** The listed country an ISO code names; the caller's own options first, then the built-in map. */
function findByIso(iso: string, options: CountryPrefixOption[]): CountryPrefixOption | undefined {
	const code = iso.toUpperCase()
	return options.find((option) => option.iso.toUpperCase() === code) ?? COUNTRY_PREFIX_MAP[code]
}

function toDialCode(prefix: string | undefined, options: CountryPrefixOption[]): string {
	if (!prefix) return options[0]?.value ?? ""
	if (prefix.startsWith("+")) return prefix
	return findByIso(prefix, options)?.value ?? prefix
}

/** The ISO code a prefix names, when it names one; a bare dial code can mean several countries. */
function toIso(prefix: string | undefined, options: CountryPrefixOption[]): string | undefined {
	if (!prefix) return options[0]?.iso
	return prefix.startsWith("+") ? undefined : findByIso(prefix, options)?.iso
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
	{
		prefix,
		defaultPrefix,
		onPrefixChange,
		prefixes = DEFAULT_COUNTRY_PREFIXES,
		disablePrefixSelector = false,
		strings,
		normalizeOnBlur = true,
		showCountryName = true,
		value,
		onChange,
		onBlur,
		disabled,
		readOnly,
		invalid,
		className,
		...props
	},
	ref,
) {
	const copy = { ...defaultPhoneInputStrings, ...strings }
	const options = useMemo(
		() => prefixes.map(normalizeCountryPrefix).filter((option): option is CountryPrefixOption => option !== null),
		[prefixes],
	)

	const isControlled = prefix !== undefined
	const [internalPrefix, setInternalPrefix] = useState(() => toDialCode(defaultPrefix, options))
	const resolvedPrefix = isControlled ? toDialCode(prefix, options) : internalPrefix
	/* The country picked last, so a shared dial code (+1: US and Canada) keeps the one chosen. */
	const [pickedIso, setPickedIso] = useState(() => toIso(defaultPrefix, options))

	const setCountry = useCallback(
		(iso: string | undefined) => {
			const dialCode = (iso ? options.find((option) => option.iso === iso)?.value : undefined) ?? ""
			setPickedIso(iso)
			if (!isControlled) setInternalPrefix(dialCode)
			onPrefixChange?.(dialCode)
		},
		[isControlled, onPrefixChange, options],
	)

	/*
	 * Options are keyed by ISO code (+1 is both the US and Canada), labelled by dial code.
	 * The country name is the description, so the narrow trigger shows just "+31".
	 */
	const selectOptions = useMemo(
		() =>
			options.map((option) => ({
				value: option.iso,
				label: option.value,
				description: showCountryName ? option.label : undefined,
			})),
		[options, showCountryName],
	)

	const selectedIso = useMemo(() => {
		const named = isControlled ? toIso(prefix, options) : undefined
		const matches = options.filter((option) => option.value === resolvedPrefix)
		return (
			matches.find((option) => option.iso === named)
			?? matches.find((option) => option.iso === pickedIso)
			?? matches[0]
		)?.iso
	}, [isControlled, options, pickedIso, prefix, resolvedPrefix])

	const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
		if (normalizeOnBlur && !disabled && !readOnly) {
			const normalized = normalizeNumber(event.target.value, resolvedPrefix, !disablePrefixSelector)
			if (normalized !== event.target.value) {
				event.target.value = normalized
				onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>)
			}
		}
		onBlur?.(event)
	}

	return (
		<div className={cx("phone-input--component", styles.phoneRoot, className)}>
			{!disablePrefixSelector && (
				<div className={styles.phonePrefix}>
					<Select
						options={selectOptions}
						value={selectedIso ?? null}
						onValueChange={setCountry}
						placeholder={copy.prefixPlaceholder}
						disabled={disabled || readOnly}
						invalid={invalid}
						aria-label={copy.prefix}
					/>
				</div>
			)}
			<Input
				{...props}
				ref={ref}
				type="tel"
				inputMode="tel"
				value={value}
				onChange={onChange}
				onBlur={handleBlur}
				disabled={disabled}
				readOnly={readOnly}
				/* Keeps a caller's (or FormField's) `aria-invalid`, as Input does. */
				aria-invalid={invalid || props["aria-invalid"] || undefined}
				className={styles.phoneNumber}
			/>
		</div>
	)
})
