/**
 * GlobalSearch: the command palette's panel. It does not search: `query` is controlled and
 * `results` are given; debounce, endpoint and ranking belong to the app. It owns the four
 * regions, grouping, and an arrow-key highlight.
 *
 * Exactly one of idle / loading / empty / results shows, in that order. Idle holds and
 * empty waits until the query reaches `MIN_QUERY_LENGTH`.
 */
import { useEffect, useMemo, useRef } from "react"

import { TextButton } from "@/components/base/buttons"
import { Text } from "@/components/base/typography"
import { LoadingState } from "@/components/base/feedback"
import { ScrollArea, VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { GlobalSearchEmptyState } from "./global-search-empty-state"
import { GlobalSearchFooter } from "./global-search-footer"
import { GlobalSearchIdleState } from "./global-search-idle-state"
import { GlobalSearchInput } from "./global-search-input"
import { GlobalSearchResultRow } from "./global-search-result-row"
import { GlobalSearchTabs } from "./global-search-tabs"
import { defaultGlobalSearchStrings } from "./global-search.strings"
import type { GlobalSearchProps, GlobalSearchTab } from "./global-search.types"
import { useGlobalSearch } from "./use-global-search"
import styles from "./global-search.module.css"

/** Below this a query matches everything, so the palette stays idle. */
const MIN_QUERY_LENGTH = 2
const NO_RESULTS: never[] = []

export function GlobalSearch<TGroup extends string = string>({
	results = [],
	query,
	onQueryChange,
	onResultSelect,
	onClose,
	loading = false,
	idleSections,
	groupLabels,
	autoFocus = false,
	strings,
	slots,
	tabs,
	className,
}: GlobalSearchProps<TGroup>) {
	const copy = { ...defaultGlobalSearchStrings, ...strings }

	const trimmed = query.trim()
	const isIdle = !loading && trimmed.length < MIN_QUERY_LENGTH
	const hasResults = !loading && !isIdle && results.length > 0
	const search = useGlobalSearch<TGroup>({ results: hasResults ? results : NO_RESULTS, query, onResultSelect, onClose })
	const isEmpty = !loading && !isIdle && search.flat.length === 0
	const scrollRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const activeResult = search.flat[search.activeIndex]
	const { activeTab, setActiveTab } = search

	useEffect(() => {
		const scroll = scrollRef.current
		const row = scroll?.querySelector<HTMLElement>('[data-search-active="true"]')
		if (!scroll || !row) return
		const bounds = scroll.getBoundingClientRect()
		const target = row.getBoundingClientRect()
		// Move only the result region; scrollIntoView would also move the containing page.
		if (target.top < bounds.top) scroll.scrollTop += target.top - bounds.top
		else if (target.bottom > bounds.bottom) scroll.scrollTop += target.bottom - bounds.bottom
	}, [activeResult?.id])

	/* One tab per group that actually returned something, in first-seen order. */
	const resolvedTabs = useMemo<readonly GlobalSearchTab<TGroup>[]>(() => {
		if (tabs) return tabs
		return [
			{ value: "all", label: copy.tabAll },
			...(Object.keys(search.grouped) as TGroup[]).map((key) => ({
				value: key,
				label: groupLabels?.[key] ?? key,
			})),
		]
	}, [copy.tabAll, groupLabels, search.grouped, tabs])

	useEffect(() => {
		if (!loading && activeTab !== "all" && !resolvedTabs.some(tab => tab.value === activeTab)) {
			setActiveTab("all")
		}
	}, [loading, resolvedTabs, activeTab, setActiveTab])

	return (
		<div
			data-slot="global-search"
			className={cx("global-search--component", styles.root, className)}
		>
			{slots?.input ?? (
				<GlobalSearchInput
					ref={inputRef}
					value={query}
					onValueChange={onQueryChange}
					onKeyDown={search.onKeyDown}
					placeholder={copy.placeholder}
					clearLabel={copy.clear}
					loading={loading}
					autoFocus={autoFocus}
				/>
			)}

			{hasResults &&
				(slots?.tabs ?? (
					<GlobalSearchTabs<TGroup>
						value={search.activeTab}
						onValueChange={search.setActiveTab}
						tabs={resolvedTabs}
						counts={search.tabCounts}
					/>
				))}

			<ScrollArea ref={scrollRef} tabIndex={-1} className={styles.scroll} aria-busy={loading}>
				{isIdle &&
					(slots?.idle ??
						(idleSections && idleSections.length > 0 ? (
							<GlobalSearchIdleState sections={idleSections} />
						) : null))}

				{loading &&
					(slots?.loading ?? (
						<LoadingState label={copy.loading} className={styles.loading} />
					))}

				{isEmpty &&
					(slots?.empty ?? (
						<GlobalSearchEmptyState title={copy.emptyTitle(query)} hint={copy.emptyHint} />
					))}

				{hasResults && (
					<div className={styles.results}>
						{Object.entries(search.visibleGrouped).map(([groupKey, items]) => (
							<div key={groupKey} className={styles.group}>
								<div className={styles.groupHeader}>
									{/* A section label in the menu-label role, quieter than the result titles. */}
									<Text tag="span" size="xs" type="secondary" weight="medium">
										{groupLabels?.[groupKey as TGroup] ?? groupKey}
									</Text>
									{/* Only on "All": in a group's own tab it would jump to the current tab. */}
									{search.activeTab === "all" && items.length > 0 && (
										<TextButton
											data-hit-area
											onClick={() => {
												search.setActiveTab(groupKey as TGroup)
												inputRef.current?.focus()
											}}
										>
											{copy.seeAll}{" "}<VisuallyHidden>{groupLabels?.[groupKey as TGroup] ?? groupKey}</VisuallyHidden>
										</TextButton>
									)}
								</div>

								<ul className={styles.list}>
									{items.map((item) => {
										const isActive = search.flat[search.activeIndex]?.id === item.id
										const select = () => onResultSelect?.(item)

										return (
											<li key={item.id} data-search-active={isActive}>
												{slots?.renderResult?.(item, { isActive, query, onSelect: select }) ?? (
													<GlobalSearchResultRow<TGroup>
														result={item}
														active={isActive}
														query={query}
														onSelect={select}
														/* The pointer moves the keyboard highlight, so Enter opens the row under the cursor. */
														onMouseEnter={() => search.setActiveById(item.id)}
														onFocus={() => search.setActiveById(item.id)}
													/>
												)}
											</li>
										)
									})}
								</ul>
							</div>
						))}
					</div>
				)}
			</ScrollArea>

			<VisuallyHidden role="status" aria-live="polite" aria-atomic="true">
				{activeResult && <Text tag="span">{search.activeIndex + 1} / {search.flat.length}: {activeResult.title}</Text>}
			</VisuallyHidden>

			{slots?.footer ?? (
				<GlobalSearchFooter
					navigateLabel={copy.footerNavigate}
					openLabel={copy.footerOpen}
					closeLabel={copy.footerClose}
					escKey={copy.escKey}
					trailing={
						hasResults ? (
							<Text tag="span" size="xs" type="secondary">
								{copy.resultsCount(search.flat.length)}
							</Text>
						) : undefined
					}
				/>
			)}
		</div>
	)
}
