/*
 * Strings that vary are functions (plurals are TypeScript conditionals a translator
 * overrides), so there is no template dialect or parser.
 */
export interface MediaLibraryStrings {
	title: string
	description: string

	tabs: { library: string; upload: string }
	views: { grid: string; table: string; list?: string }
	selectVisible?: string
	deselectVisible?: string
	refreshError?: string
	table?: { name: string; collection: string; size: string; uploaded: string; usage: string; actions: string }

	searchPlaceholder: string
	clearSearch: string
	clearFilters: string

	types: { all: string; image: string; video: string; file: string }
	sorts: { newest: string; name: string; size: string; usage: string }

	collectionAll: string
	collectionLabel: string
	sortLabel: string
	typeLabel: string
	viewLabel: string
	activeSearchLabel: string

	loading: string
	error: string
	/** Optional so existing complete translations keep working; defaults to "Try again". */
	retry?: string
	emptyTitle: string
	emptyDescription: string
	emptyFilteredTitle: string
	emptyFilteredDescription: string

	selectedCount: (count: number) => string
	showingCount: (shown: number, total: number) => string

	select: string
	deselect: string
	assetAction?: (action: string, name: string) => string
	details: string
	close: string
	confirm: string
	cancel: string
	clearSelection: string
	/** The picker's footer, which changes with the tab it is under. */
	footer: {
		pickOne: string
		pickMany: string
		noFiles: string
		stagedSummary: (count: number, size: string) => string
		uploadStaged: (count: number) => string
	}

	detail: {
		altLabel: string
		altPlaceholder: string
		collectionLabel: string
		tagsLabel: string
		tagsPlaceholder: string
		publicLabel: string
		publicDescription: string
		save: string
		saving: string
		delete: string
		deleting: string
		saved?: string
		unsaved?: string
		saveFailed?: string
		deleteFailed?: string
		reset?: string
		dimensions: string
		size: string
		uploaded: string
		type: string
	}

	upload: {
		dropTitle: string
		dropDescription: string
		browse: string
		staged: (count: number) => string
		start: string
		uploading: string
		cancel: string
		clear: string
		remove: string
		failed: string
		emptyTitle: string
		emptyDescription: string
		optionsTitle: string
	}

	gallery: {
		title: string
		description: string
		add: string
		remove: string
		primary: string
		makePrimary: string
		moveEarlier: string
		moveLater: string
		emptyTitle: string
		emptyDescription: string
		limitReached: (max: number) => string
	}
}

export const defaultMediaLibraryStrings = {
	title: "Media library",
	description: "Browse, upload, and pick assets.",

	tabs: { library: "Library", upload: "Upload" },
	views: { grid: "Grid view", table: "Table view", list: "List view" },
	selectVisible: "Select visible",
	deselectVisible: "Deselect visible",
	refreshError: "Could not refresh assets. Showing the previous results.",
	table: { name: "Name", collection: "Collection", size: "Size", uploaded: "Uploaded", usage: "Usage", actions: "Actions" },

	searchPlaceholder: "Search assets…",
	clearSearch: "Clear search",
	clearFilters: "Clear filters",

	types: { all: "All types", image: "Images", video: "Video", file: "Files" },
	sorts: { newest: "Newest", name: "Name", size: "Size", usage: "Most used" },

	collectionAll: "All collections",
	collectionLabel: "Collection",
	sortLabel: "Sort",
	typeLabel: "Type",
	viewLabel: "Layout",
	activeSearchLabel: "Searching",

	loading: "Loading assets…",
	error: "Could not load assets.",
	retry: "Try again",
	emptyTitle: "Nothing here yet",
	emptyDescription: "Upload an asset to get started.",
	emptyFilteredTitle: "No assets match",
	emptyFilteredDescription: "Try a different search, type, or collection.",

	selectedCount: (count) => `${count} selected`,
	showingCount: (shown, total) => `${shown} of ${total}`,

	select: "Select",
	deselect: "Deselect",
	assetAction: (action, name) => `${action}: ${name}`,
	details: "Details",
	close: "Close",
	confirm: "Use selected",
	cancel: "Cancel",
	clearSelection: "Clear selection",
	footer: {
		pickOne: "Choose one asset.",
		pickMany: "Choose one or more assets.",
		noFiles: "No files staged.",
		stagedSummary: (count, size) =>
			`${count} ${count === 1 ? "file" : "files"} staged · ${size}`,
		uploadStaged: (count) => (count <= 1 ? "Upload" : `Upload ${count} files`),
	},

	detail: {
		altLabel: "Alt text",
		altPlaceholder: "Describe the image for screen readers",
		collectionLabel: "Collection",
		tagsLabel: "Tags",
		tagsPlaceholder: "Add a tag and press Enter",
		publicLabel: "Public",
		publicDescription: "Anyone with the link can view this asset.",
		save: "Save changes",
		saving: "Saving…",
		delete: "Delete",
		deleting: "Deleting…",
		saved: "Changes saved",
		unsaved: "Unsaved changes",
		saveFailed: "Could not save changes. Your edits are still here. Try again.",
		deleteFailed: "Could not delete this asset. Try again.",
		reset: "Reset changes",
		dimensions: "Dimensions",
		size: "Size",
		uploaded: "Uploaded",
		type: "Type",
	},

	upload: {
		dropTitle: "Drop files here",
		dropDescription: "or browse from your device",
		browse: "Browse files",
		staged: (count) => `${count} file${count === 1 ? "" : "s"} ready`,
		start: "Upload",
		uploading: "Uploading…",
		cancel: "Cancel upload",
		clear: "Clear",
		remove: "Remove",
		failed: "Upload failed",
		emptyTitle: "No files chosen",
		emptyDescription: "Drop files above, or browse from your device.",
		optionsTitle: "Applied to every file",
	},

	gallery: {
		title: "Media",
		description: "Attached assets, in display order.",
		add: "Add media",
		remove: "Remove",
		primary: "Cover",
		makePrimary: "Make cover",
		moveEarlier: "Move earlier",
		moveLater: "Move later",
		emptyTitle: "No media attached",
		emptyDescription: "Add an asset to show it here.",
		limitReached: (max) => `${max} is the maximum.`,
	},
} satisfies MediaLibraryStrings
