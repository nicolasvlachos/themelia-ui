/**
 * DataTable copy, nested per surface (toolbar, header, body, pager, selection bar).
 */
export interface DataTableStrings {
	/** Names the full-screen control in each of its two states. */
	fullscreenEnter: string
	fullscreenExit: string
	emptyMessage: string
	/** Names the table-owned control group. */
	toolbarLabel?: string
	actions: {
		triggerLabel: string
		menuLabel: string
	}
	filter: {
		searchPlaceholder: string
	}
	columnVisibility: {
		title: string
		triggerLabel: string
		/** Turns a column id into a readable name when its header is not a string. */
		formatLabel: (columnId: string, currentLabel?: string | null) => string
	}
	toolbar: {
		scrollLeft: string
		scrollRight: string
		enterFullscreen: string
		exitFullscreen: string
	}
	pagination: {
		label: string
		previous: string
		next: string
		page: (page: number) => string
		morePages: string
		/** The result-count line beside the pager. */
		summary: (from: number, to: number, total: number) => string
	}
	selection: {
		summary: (selected: number, total: number) => string
		row: (index: number) => string
		selectAll: string
		clear: string
	}
	accessibility: {
		scrollRegion: string
		/** Names the full-screen table, which is a modal region. */
		fullscreenRegion: string
	}
}

/** `created_at` → "Created At". Only used when a header is not a plain string. */
function titleCase(value: string): string {
	const formatted = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
	if (!formatted) return "Column"
	return formatted.replace(/\b\w/g, (character) => character.toUpperCase())
}

export const defaultDataTableStrings: DataTableStrings = {
	fullscreenEnter: "Enter full screen",
	fullscreenExit: "Exit full screen",
	emptyMessage: "No results found.",
	toolbarLabel: "Table controls",
	actions: {
		triggerLabel: "Actions",
		menuLabel: "Row actions",
	},
	filter: {
		searchPlaceholder: "Filter…",
	},
	columnVisibility: {
		title: "Columns",
		triggerLabel: "Toggle columns",
		formatLabel: (columnId, currentLabel) =>
			currentLabel && currentLabel.trim().length > 0 ? currentLabel : titleCase(columnId),
	},
	toolbar: {
		scrollLeft: "Scroll left",
		scrollRight: "Scroll right",
		enterFullscreen: "Enter full screen",
		exitFullscreen: "Exit full screen",
	},
	pagination: {
		label: "Pagination",
		previous: "Previous page",
		next: "Next page",
		page: (page) => `Page ${page}`,
		morePages: "More pages",
		summary: (from, to, total) => `${from}–${to} of ${total}`,
	},
	selection: {
		summary: (selected, total) =>
			`${selected} of ${total} row${total === 1 ? "" : "s"} selected.`,
		row: (index) => `Select row ${index + 1}`,
		selectAll: "Select all rows",
		clear: "Clear selection",
	},
	accessibility: {
		scrollRegion: "Table scroll area",
		fullscreenRegion: "Table, full screen",
	},
}

/** Default accessible name for the table-owned controls. */
export const defaultDataTableToolbarLabel = "Table controls"

export type DataTableStringsOverride = {
	[K in keyof DataTableStrings]?: DataTableStrings[K] extends object
		? Partial<DataTableStrings[K]>
		: DataTableStrings[K]
}

/** Merges one level deep, matching the shape. */
export function mergeDataTableStrings(
	overrides?: DataTableStringsOverride,
): DataTableStrings {
	if (!overrides) return defaultDataTableStrings

	return {
		emptyMessage: overrides.emptyMessage ?? defaultDataTableStrings.emptyMessage,
		toolbarLabel: overrides.toolbarLabel ?? defaultDataTableStrings.toolbarLabel,
		fullscreenEnter: overrides.fullscreenEnter ?? defaultDataTableStrings.fullscreenEnter,
		fullscreenExit: overrides.fullscreenExit ?? defaultDataTableStrings.fullscreenExit,
		actions: { ...defaultDataTableStrings.actions, ...overrides.actions },
		filter: { ...defaultDataTableStrings.filter, ...overrides.filter },
		columnVisibility: {
			...defaultDataTableStrings.columnVisibility,
			...overrides.columnVisibility,
		},
		toolbar: { ...defaultDataTableStrings.toolbar, ...overrides.toolbar },
		pagination: { ...defaultDataTableStrings.pagination, ...overrides.pagination },
		selection: { ...defaultDataTableStrings.selection, ...overrides.selection },
		accessibility: {
			...defaultDataTableStrings.accessibility,
			...overrides.accessibility,
		},
	}
}
