import { useCallback, useId, useMemo, useState } from "react"

export interface UseFieldValueOptions {
	/** Controlled value. Its presence is what makes the field controlled. */
	controlledValue?: string
	defaultValue?: string
	maxLength?: number
	showCharacterCount?: boolean
	/** A caller-supplied id wins; otherwise one is generated. */
	providedId?: string
	idPrefix?: string
}

export interface UseFieldValueResult {
	id: string
	value: string
	isControlled: boolean
	characterCount: number
	hasCharacterLimit: boolean
	/** True when a count should be rendered — a limit is set and the caller asked. */
	showCount: boolean
	hasValue: boolean
	/** Writes the internal value when uncontrolled. Returns false if the limit blocked it. */
	updateValue: (next: string) => boolean
	clearValue: () => void
	wouldExceedLimit: (next: string) => boolean
}

/**
 * Value bookkeeping shared by the text controls (Input, Textarea): controlled or not, a
 * generated id, the character count and the limit — one branch, so fields agree.
 */
export function useFieldValue({
	controlledValue,
	defaultValue,
	maxLength,
	showCharacterCount,
	providedId,
	idPrefix = "field",
}: UseFieldValueOptions): UseFieldValueResult {
	const generatedId = useId()
	const id = providedId ?? `${idPrefix}-${generatedId}`

	const isControlled = controlledValue !== undefined
	const [internal, setInternal] = useState(String(defaultValue ?? ""))
	const value = isControlled ? String(controlledValue ?? "") : internal

	const hasCharacterLimit = typeof maxLength === "number" && maxLength > 0
	const characterCount = value.length

	const wouldExceedLimit = useCallback(
		(next: string) => hasCharacterLimit && next.length > (maxLength as number),
		[hasCharacterLimit, maxLength],
	)

	const updateValue = useCallback(
		(next: string) => {
			if (wouldExceedLimit(next)) return false
			if (!isControlled) setInternal(next)
			return true
		},
		[isControlled, wouldExceedLimit],
	)

	const clearValue = useCallback(() => {
		if (!isControlled) setInternal("")
	}, [isControlled])

	return useMemo(
		() => ({
			id,
			value,
			isControlled,
			characterCount,
			hasCharacterLimit,
			showCount: !!showCharacterCount && hasCharacterLimit,
			hasValue: value.length > 0,
			updateValue,
			clearValue,
			wouldExceedLimit,
		}),
		[
			id, value, isControlled, characterCount, hasCharacterLimit, showCharacterCount,
			updateValue, clearValue, wouldExceedLimit,
		],
	)
}
