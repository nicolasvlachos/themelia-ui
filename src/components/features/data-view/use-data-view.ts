/**
 * useDataView — the rows, after the filters. If a matcher throws, the unfiltered rows are
 * returned with `failed` set (and `onError` called), rather than a misleading empty list.
 */
import { useEffect, useMemo, useRef } from "react"

import { applyDataViewFilters } from "./data-view-filtering"
import type { UseDataViewOptions, UseDataViewResult } from "./data-view.types"
import { useLatest } from "@/hooks/use-latest"

export function useDataView<TData extends object>({
	data,
	filtering,
}: UseDataViewOptions<TData>): UseDataViewResult<TData> {
	const onErrorRef = useLatest(filtering?.onError)

	const activeFilters = filtering?.activeFilters
	const filters = filtering?.filters
	const filterRows = filtering?.filterRows
	const getFilterValue = filtering?.getFilterValue

	const result = useMemo<UseDataViewResult<TData>>(() => {
		if (!activeFilters || !filters) return { rows: data, error: null, failed: false }

		try {
			return {
				rows: filterRows
					? filterRows({ data, activeFilters, filters })
					: applyDataViewFilters(data, activeFilters, filters, getFilterValue),
				error: null,
				failed: false,
			}
		} catch (error) {
			return { rows: data, error, failed: true }
		}
	}, [activeFilters, data, filterRows, filters, getFilterValue])

	/* Reported once per failure: the memo's identity changes only with its inputs. */
	const reported = useRef<UseDataViewResult<TData> | null>(null)

	useEffect(() => {
		if (!result.failed) {
			reported.current = null
			return
		}
		if (reported.current === result) return
		reported.current = result
		onErrorRef.current?.(result.error, { phase: "apply" })
	}, [result, onErrorRef])

	return result
}
