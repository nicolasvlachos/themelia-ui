import { ChevronRightIcon, ListFilterIcon, XIcon } from "lucide-react"
import { useId, useLayoutEffect, useRef, useState } from "react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { LoadingState } from "@/components/base/feedback"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/base/item"
import {
	Overlay, OverlayBody, OverlayDescription, OverlayFooter, OverlayHeader, OverlayTitle, OverlayTrigger,
} from "@/components/base/overlay"
import { SheetContent } from "@/components/base/sheet"
import { Text } from "@/components/base/typography"
import { UIPortalHost } from "@/lib/ui-provider"

import { FilterEditor } from "./filter-editors"
import { FilterOperatorSelect } from "./filter-operator-select"
import { FilterValueDisplay } from "./filter-value-display"
import { getOperatorsForType } from "./filter-operators"
import { useFilters } from "./filter-store"
import { defaultFilterStrings } from "./filters.strings"
import type { FilterConfig } from "./filters.types"
import styles from "./filters.module.css"

/** Reuses the existing editors and their staged-value contract in a mobile sheet. */
export function FilterSheet({ filters, loadingFilters, showClearFilters = true }: {
	filters: FilterConfig[]
	loadingFilters?: Record<string, boolean>
	showClearFilters?: boolean
}) {
	const [open, setOpen] = useState(false)
	const [editingKey, setEditingKey] = useState<string | null>(null)
	const titleId = useId()
	const descriptionId = useId()
	const bodyRef = useRef<HTMLDivElement>(null)
	const lastEdited = useRef<string | null>(null)
	const {
		activeFilters, strings, isNavigating, getFilterValue, setFilterValue,
		getFilterOperator, setFilterOperator, clearFilters,
	} = useFilters()
	const editing = filters.find(filter => filter.key === editingKey)
	const appliedCount = activeFilters.filter(filter => filter.value.length > 0).length
	const title = strings.mobileFilters ?? defaultFilterStrings.mobileFilters!
	const summary = (strings.filterSummary ?? defaultFilterStrings.filterSummary!)(appliedCount)
	const resetEditor = () => setEditingKey(null)
	const changeOpen = (next: boolean) => {
		setOpen(next)
		if (!next) resetEditor()
	}

	useLayoutEffect(() => {
		if (!open || isNavigating) return
		const body = bodyRef.current
		if (editingKey) {
			lastEdited.current = editingKey
			const editor = body?.querySelector<HTMLElement>("[data-filter-editor]")
			const target = editor?.querySelector<HTMLElement>("input")
				?? editor?.querySelector<HTMLElement>("[cmdk-root]")
				?? editor?.querySelector<HTMLElement>("button")
			target?.focus()
		} else if (lastEdited.current) {
			const row = [...body?.querySelectorAll<HTMLElement>("[data-filter-key]") ?? []]
				.find(node => node.dataset.filterKey === lastEdited.current)
			row?.focus()
		}
	}, [open, editingKey, isNavigating])

	return (
		<Overlay open={open} onOpenChange={changeOpen}>
			<OverlayTrigger render={
				<Button tone="neutral" buttonStyle="outline" disabled={isNavigating} className="filter-sheet--trigger">
					<ListFilterIcon />
					{title}
					{appliedCount > 0 && <Badge tone="neutral">{appliedCount}</Badge>}
				</Button>
			} />
			<SheetContent
				side="block-end" size="lg" inset="5vw"
				aria-labelledby={titleId} aria-describedby={descriptionId}
				className={`filter-sheet--component ${styles.mobileSheet}`}
			>
				<UIPortalHost>
				<OverlayHeader>
					<OverlayTitle id={titleId}>{title}</OverlayTitle>
					<OverlayDescription id={descriptionId}>{summary}</OverlayDescription>
				</OverlayHeader>
				<OverlayBody className={styles.mobileBody}>
					{isNavigating && <LoadingState label={strings.applying} className={styles.applying} />}
					<div ref={bodyRef} inert={isNavigating || undefined} aria-busy={isNavigating || undefined}>
						{editing ? (
							<div data-filter-editor className={styles.mobileEditor}>
								<div className={styles.mobileOperator}>
									<Text size="xs" type="secondary">{strings.operator}</Text>
									<FilterOperatorSelect
										operator={getFilterOperator(editing.key)}
										operators={editing.operators?.length ? editing.operators : getOperatorsForType(editing.type, strings.operators)}
										onOperatorChange={operator => setFilterOperator(editing.key, operator)}
									/>
								</div>
								<FilterEditor
									key={editing.key} filter={editing} value={getFilterValue(editing.key)}
									onValueChange={value => setFilterValue(editing.key, value)}
									onBack={resetEditor} onClose={resetEditor} triggerSource="toolbar"
								/>
							</div>
						) : (
							<div className={styles.mobileFilters}>
								{filters.map(filter => (
									<div key={filter.key} className={styles.mobileFilterRow}>
										<Item
											data-filter-key={filter.key} className={styles.mobileFilter}
											render={<button type="button" disabled={isNavigating || loadingFilters?.[filter.key]} onClick={() => setEditingKey(filter.key)} />}
										>
											<ItemContent>
												<ItemTitle>{filter.label}</ItemTitle>
												<ItemDescription className={styles.mobileValue}>
													{getFilterValue(filter.key).length > 0 && <Text tag="span" size="inherit" type="inherit">
														{(filter.operators?.length ? filter.operators : getOperatorsForType(filter.type, strings.operators)).find(option => option.value === getFilterOperator(filter.key))?.label}
													</Text>}
													<FilterValueDisplay filter={filter} value={getFilterValue(filter.key)} />
												</ItemDescription>
											</ItemContent>
											<ChevronRightIcon aria-hidden />
										</Item>
										{getFilterValue(filter.key).length > 0 && (
											<Button iconOnly tone="neutral" buttonStyle="ghost" disabled={isNavigating}
												aria-label={(strings.clearFilter ?? defaultFilterStrings.clearFilter!)(filter.label)}
												onClick={event => {
													event.currentTarget.parentElement?.querySelector<HTMLElement>("[data-filter-key]")?.focus()
													setFilterValue(filter.key, [])
												}}><XIcon /></Button>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</OverlayBody>
				{!editing && (
					<OverlayFooter>
						{showClearFilters && activeFilters.length > 0 && (
							<Button tone="neutral" buttonStyle="ghost" disabled={isNavigating} onClick={clearFilters}>{strings.clearFilters}</Button>
						)}
						<Button onClick={() => changeOpen(false)}>{strings.done ?? defaultFilterStrings.done}</Button>
					</OverlayFooter>
				)}
				</UIPortalHost>
			</SheetContent>
		</Overlay>
	)
}
