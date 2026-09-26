/** A working catalogue behind the Commerce demos, so edits to options change the variant grid. */
import { useCallback, useMemo, useState } from "react"

import type {
	ProductOptionEditDraft, ProductOptionGroup, ProductOptionValue, ProductVariantRow,
} from "@/components/features"

/** Every combination the current options describe, in option order. */
function combinations(options: ProductOptionGroup[]): { ids: Record<string, string>; labels: string[] }[] {
	const live = options.filter((option) => (option.usedForVariants ?? true) && option.values?.length)
	if (live.length === 0) return []

	return live.reduce<{ ids: Record<string, string>; labels: string[] }[]>(
		(rows, option) =>
			rows.flatMap((row) =>
				(option.values ?? []).map((value) => ({
					ids: { ...row.ids, [option.id]: value.id },
					labels: [...row.labels, String(value.label)],
				})),
			),
		[{ ids: {}, labels: [] }],
	)
}

let sequence = 0
const nextId = (prefix: string) => `${prefix}-${(sequence += 1)}`

export function useCatalogue(
	initialOptions: ProductOptionGroup[],
	initialVariants: ProductVariantRow[],
) {
	const [options, setOptions] = useState(initialOptions)
	const [variants, setVariants] = useState(initialVariants)
	const [editingOptionId, setEditingOptionId] = useState<string | null>(null)

	const patchOption = useCallback(
		(id: string, patch: (option: ProductOptionGroup) => ProductOptionGroup) =>
			setOptions((current) => current.map((option) => (option.id === id ? patch(option) : option))),
		[],
	)

	const createOption = useCallback(() => {
		const id = nextId("option")
		setOptions((current) => [
			...current,
			{ id, name: "New option", values: [], position: current.length },
		])
		/* Straight into the editor: an option with no name and no values is not a thing
		 * anyone wanted, it is the first half of adding one. */
		setEditingOptionId(id)
	}, [])

	const deleteOption = useCallback((option: ProductOptionGroup) => {
		setOptions((current) => current.filter((entry) => entry.id !== option.id))
		setVariants((current) =>
			current.map((variant) => {
				const { [option.id]: _dropped, ...ids } = variant.optionValueIds ?? {}
				const { [option.id]: _label, ...values } = variant.optionValues ?? {}
				return { ...variant, optionValueIds: ids, optionValues: values }
			}),
		)
	}, [])

	const addValue = useCallback(
		(option: ProductOptionGroup) =>
			patchOption(option.id, (entry) => ({
				...entry,
				values: [
					...(entry.values ?? []),
					{ id: nextId("value"), label: `Value ${(entry.values?.length ?? 0) + 1}` },
				],
			})),
		[patchOption],
	)

	const deleteValue = useCallback(
		(option: ProductOptionGroup, value: ProductOptionValue) =>
			patchOption(option.id, (entry) => ({
				...entry,
				values: (entry.values ?? []).filter((candidate) => candidate.id !== value.id),
			})),
		[patchOption],
	)

	const saveOption = useCallback(
		(option: ProductOptionGroup, draft: ProductOptionEditDraft) => {
			patchOption(option.id, (entry) => ({ ...entry, name: draft.name, values: draft.values }))
			setEditingOptionId(null)
		},
		[patchOption],
	)

	const generateVariants = useCallback(() => {
		setVariants((current) => {
			const bySignature = new Map(
				current.map((variant) => [
					options.map((option) => variant.optionValueIds?.[option.id] ?? "").join("|"),
					variant,
				]),
			)

			return combinations(options).map((row) => {
				const signature = options.map((option) => row.ids[option.id] ?? "").join("|")
				const existing = bySignature.get(signature)
				const labels = Object.fromEntries(
					Object.entries(row.ids).map(([optionId, valueId]) => [
						optionId,
						String(
							options
								.find((option) => option.id === optionId)
								?.values?.find((value) => value.id === valueId)?.label ?? "",
						),
					]),
				)

				/* An existing combination keeps its SKU, price and stock. Regenerating is
				 * meant to fill the gaps, not to wipe what the reader already typed. */
				return (
					existing ?? {
						id: nextId("variant"),
						name: row.labels.join(" · "),
						sku: "",
						price: "",
						inventory: "0",
						status: "Draft",
						statusTone: "neutral" as const,
						optionValueIds: row.ids,
						optionValues: labels,
					}
				)
			})
		})
	}, [options])

	const setVariantField = useCallback(
		(id: string, field: "sku" | "price" | "inventory", value: string) =>
			setVariants((current) =>
				current.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant)),
			),
		[],
	)

	const deleteVariants = useCallback(
		(ids: readonly string[]) =>
			setVariants((current) => current.filter((variant) => !ids.includes(variant.id))),
		[],
	)

	const reorderOptions = useCallback((next: ProductOptionGroup[]) => setOptions(next), [])

	const variantCount = useMemo(() => combinations(options).length, [options])

	return {
		options,
		variants,
		variantCount,
		editingOptionId,
		setEditingOptionId,
		createOption,
		deleteOption,
		addValue,
		deleteValue,
		saveOption,
		reorderOptions,
		generateVariants,
		setVariantField,
		deleteVariants,
	}
}
