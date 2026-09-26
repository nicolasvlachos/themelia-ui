/**
 * useSharedResourceCard: the assignment state machine.
 *
 * The pending choice on each open comes from, in order: a controlled `value`; on the first
 * open only, an explicit `defaultValue`; otherwise `mapInitialSelected(resource)`, so
 * "Change" opens on the current assignment. `closeSelector` is refused while confirming.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import type { SharedResourceCardContext } from "./resource-assignment.types"

export interface UseSharedResourceCardOptions<TResource, TSuggestion> {
	resource: TResource | null
	mapInitialSelected: (resource: TResource | null) => TSuggestion | null
	onConfirmSelection: (selection: TSuggestion) => void | Promise<void>
	isConfirmDisabled?: (selection: TSuggestion | null) => boolean
	onDialogOpen?: (selection: TSuggestion | null) => void
	onDialogClose?: () => void
	onError?: (error: unknown, selection: TSuggestion) => void
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	value?: TSuggestion | null
	defaultValue?: TSuggestion | null
	onValueChange?: (selection: TSuggestion | null) => void
}

export type UseSharedResourceCardResult<TResource, TSuggestion> = SharedResourceCardContext<
	TResource,
	TSuggestion
>

export function useSharedResourceCard<TResource, TSuggestion>({
	resource,
	mapInitialSelected,
	onConfirmSelection,
	isConfirmDisabled,
	onDialogOpen,
	onDialogClose,
	onError,
	open,
	defaultOpen = false,
	onOpenChange,
	value,
	defaultValue,
	onValueChange,
}: UseSharedResourceCardOptions<TResource, TSuggestion>): UseSharedResourceCardResult<
	TResource,
	TSuggestion
> {
	const [internalOpen, setInternalOpen] = useState(defaultOpen)
	const [internalSelected, setInternalSelected] = useState<TSuggestion | null>(defaultValue ?? null)
	const [isConfirming, setIsConfirming] = useState(false)
	const confirmingRef = useRef(false)
	const selectionCycle = useRef(0)

	const isOpenControlled = open !== undefined
	const isValueControlled = value !== undefined
	const isSelectorOpen = isOpenControlled ? open : internalOpen
	const selectedSuggestion = isValueControlled ? value : internalSelected

	/** One initialisation per closed-to-open cycle, not one per render while open. */
	const initialisedThisCycle = useRef(false)
	const hasEverOpened = useRef(false)
	/** Whether a `defaultValue` was passed; `null` is a real one. */
	const hasExplicitDefault = useRef(defaultValue !== undefined)

	const setSelectorOpen = useCallback(
		(next: boolean) => {
			if (!isOpenControlled) setInternalOpen(next)
			onOpenChange?.(next)
		},
		[isOpenControlled, onOpenChange],
	)

	const setSelectedSuggestion = useCallback(
		(selection: TSuggestion | null) => {
			if (!isValueControlled) setInternalSelected(selection)
			onValueChange?.(selection)
		},
		[isValueControlled, onValueChange],
	)

	const openSelector = useCallback(() => setSelectorOpen(true), [setSelectorOpen])

	useEffect(() => {
		if (!isSelectorOpen) {
			initialisedThisCycle.current = false
			return
		}
		if (initialisedThisCycle.current) return
		initialisedThisCycle.current = true
		selectionCycle.current += 1

		// Source order: see the file header.
		const firstOpen = !hasEverOpened.current
		let initial: TSuggestion | null
		if (isValueControlled) {
			initial = value
		} else if (firstOpen && hasExplicitDefault.current) {
			initial = internalSelected
		} else {
			initial = mapInitialSelected(resource)
			setSelectedSuggestion(initial)
		}

		hasEverOpened.current = true
		onDialogOpen?.(initial)
	}, [
		internalSelected, isSelectorOpen, isValueControlled, mapInitialSelected, onDialogOpen,
		resource, setSelectedSuggestion, value,
	])

	const closeSelector = useCallback(() => {
		// The write is in flight; dismissing would leave its outcome unknown.
		if (isConfirming) return
		setSelectorOpen(false)
		setSelectedSuggestion(null)
		onDialogClose?.()
	}, [isConfirming, onDialogClose, setSelectedSuggestion, setSelectorOpen])

	const canConfirmSelection = useMemo(() => {
		if (selectedSuggestion === null) return false
		if (!isConfirmDisabled) return true
		return !isConfirmDisabled(selectedSuggestion)
	}, [isConfirmDisabled, selectedSuggestion])

	const confirmSelection = useCallback(async () => {
		if (confirmingRef.current || !canConfirmSelection || selectedSuggestion === null) return

		confirmingRef.current = true
		setIsConfirming(true)
		const startedInCycle = selectionCycle.current
		try {
			await onConfirmSelection(selectedSuggestion)
			// Only on success; a rejection keeps the dialog open with the choice intact.
			if (selectionCycle.current === startedInCycle) {
				setSelectorOpen(false)
				setSelectedSuggestion(null)
				onDialogClose?.()
			}
		} catch (error) {
			onError?.(error, selectedSuggestion)
		} finally {
			confirmingRef.current = false
			setIsConfirming(false)
		}
	}, [
		canConfirmSelection, onConfirmSelection, onDialogClose, onError,
		selectedSuggestion, setSelectedSuggestion, setSelectorOpen,
	])

	return useMemo(
		() => ({
			resource,
			hasResource: resource !== null,
			isSelectorOpen,
			isConfirming,
			selectedSuggestion,
			setSelectedSuggestion,
			openSelector,
			closeSelector,
			confirmSelection,
			canConfirmSelection,
		}),
		[
			canConfirmSelection, closeSelector, confirmSelection, isConfirming, isSelectorOpen,
			openSelector, resource, selectedSuggestion, setSelectedSuggestion,
		],
	)
}
