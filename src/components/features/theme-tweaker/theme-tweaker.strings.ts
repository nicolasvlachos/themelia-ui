import {
	defaultUIConfigSettingsStrings, type UIConfigSettingsStrings,
} from "./ui-config-settings.strings"

export interface ThemeTweakerStrings {
	title: string
	description: string
	searchLabel: string
	searchPlaceholder: string
	searchHint: string
	searchResults: (count: number) => string
	allGroups: string
	groupNavigationLabel: string
	sharedScope: string
	/** For a section whose fields do not all share one scope. */
	mixedScope: string
	variableCount: (count: number) => string
	groupSectionLabel: (group: string, section: string) => string
	lightMode: string
	darkMode: string
	reset: string
	copy: string
	copyProvider: string
	export: string
	exportPending: string
	exportDialogTitle: string
	exportDialogDescription: string
	downloadCss: string
	downloadProvider: string
	close: string
	copiedStatus: string
	exportedStatus: string
	invalidTheme: string
	emptySearch: string
	/** The placeholder in a field with no override — what it falls through to. */
	inheritValue: string
	resetVariable: string
	chooseColor: (label: string) => string
	adjustVariable: (label: string) => string
	changedCount: (count: number) => string
	cssOutputLabel: string
	cssOutputDescription: string
	providerOutputLabel: string
	providerOutputDescription: string
	autoPalette: string
	autoPaletteDescription: string
	typeRecipeTitle: string
	typeRecipeDescription: string
	baseTypeSize: string
	typeRatio: string
	elevationRecipeTitle: string
	elevationRecipeDescription: string
	elevationIntensity: string
	previewTitle: string
	previewDescription: string
	previewItemTitle: string
	previewItemDescription: string
	previewFieldLabel: string
	previewFieldPlaceholder: string
	previewAction: string
	previewSuccess: string
	previewWarning: string
	previewContract: string
	providerSettings: UIConfigSettingsStrings
	groups: Record<
		"colors" | "states" | "typography" | "shape" | "structure" | "defaults", string
	>
	groupDescriptions: Record<
		"colors" | "states" | "typography" | "shape" | "structure" | "defaults", string
	>
	sections: Record<
		| "surfaces-content" | "brand-actions" | "charts" | "sidebar" | "semantic-feedback"
		| "inverse-surfaces" | "font-families" | "type-scale" | "radius" | "elevation"
		| "global-scales" | "actions-controls" | "rows-surfaces" | "media"
		| "application-shell" | "content-widths" | "adaptive-layout",
		string
	>
}

export const defaultThemeTweakerStrings: ThemeTweakerStrings = {
	title: "Theme tweaker",
	description:
		"Edit the public theme contract, calculate coherent recipes, and export complete CSS plus the display defaults that go with it.",
	searchLabel: "Search variables",
	searchPlaceholder: "Search by token, label, or purpose…",
	searchHint: "Search spans every group, not just the one you are in.",
	searchResults: (count) => `${count} ${count === 1 ? "result" : "results"}`,
	allGroups: "All groups",
	groupNavigationLabel: "Theme categories",
	sharedScope: "Shared",
	mixedScope: "Mixed scope",
	variableCount: (count) => `${count} ${count === 1 ? "variable" : "variables"}`,
	groupSectionLabel: (group, section) => `${group} · ${section}`,
	lightMode: "Light",
	darkMode: "Dark",
	reset: "Reset overrides",
	copy: "Copy CSS",
	copyProvider: "Copy config",
	export: "Export",
	exportPending: "Downloading…",
	exportDialogTitle: "Export theme",
	exportDialogDescription:
		"Review, copy, or download the complete CSS theme and the UIProvider configuration that matches it.",
	downloadCss: "Download CSS",
	downloadProvider: "Download config",
	close: "Close",
	copiedStatus: "Copied to the clipboard.",
	exportedStatus: "File downloaded.",
	invalidTheme: "Fix the invalid CSS override before copying or exporting.",
	emptySearch: "No public theme variables match this search.",
	inheritValue: "Inherits the kit's value",
	resetVariable: "Reset variable",
	chooseColor: (label) => `Choose ${label}`,
	adjustVariable: (label) => `Adjust ${label}`,
	changedCount: (count) => `${count} ${count === 1 ? "override" : "overrides"}`,
	cssOutputLabel: "Complete theme CSS",
	cssOutputDescription:
		"A standalone contract: every public variable, in both modes, resolved.",
	providerOutputLabel: "UIProvider config",
	providerOutputDescription: "Display defaults to pass to your application's provider.",
	autoPalette: "Derive supporting colours",
	autoPaletteDescription:
		"Keep muted, accent, borders, charts, links, and sidebar actions coherent with the primary colour.",
	typeRecipeTitle: "Calculated type scale",
	typeRecipeDescription:
		"Generate every font step and line height from one body anchor and one modular ratio.",
	baseTypeSize: "Base size",
	typeRatio: "Heading ratio",
	elevationRecipeTitle: "Calculated elevation",
	elevationRecipeDescription: "Generate the whole shadow ladder from one restrained intensity.",
	elevationIntensity: "Shadow intensity",
	previewTitle: "Semantic preview",
	previewDescription:
		"The same variables drive surfaces, typography, controls, rows, and states.",
	previewItemTitle: "Customer workspace",
	previewItemDescription: "A long description and an action, at the kit's own rhythm.",
	previewFieldLabel: "Workspace name",
	previewFieldPlaceholder: "Acme operations",
	previewAction: "Save changes",
	previewSuccess: "Healthy",
	previewWarning: "Review",
	previewContract: "CSS variables",
	providerSettings: defaultUIConfigSettingsStrings,
	groups: {
		colors: "Colours",
		states: "States",
		typography: "Typography",
		shape: "Shape & elevation",
		structure: "Structure",
		defaults: "Provider",
	},
	groupDescriptions: {
		colors: "Application surfaces, brand actions, charts, and sidebar colours.",
		states: "Semantic feedback and inverse-surface pairs.",
		typography: "Font families and the calculated type scale.",
		shape: "Corner radius and the elevation ladder.",
		structure: "Density, spacing, controls, rows, media, and shell geometry.",
		defaults: "Formatting and display defaults applied through UIProvider.",
	},
	sections: {
		"surfaces-content": "Surfaces & content",
		"brand-actions": "Brand & actions",
		charts: "Charts",
		sidebar: "Sidebar",
		"semantic-feedback": "Semantic feedback",
		"inverse-surfaces": "Inverse surfaces",
		"font-families": "Font families",
		"type-scale": "Type scale",
		radius: "Radius",
		elevation: "Elevation",
		"global-scales": "Global scales",
		"actions-controls": "Actions & controls",
		"rows-surfaces": "Rows & surfaces",
		media: "Media",
		"application-shell": "Application shell",
		"content-widths": "Content widths",
		"adaptive-layout": "Adaptive layout",
	},
}

export { defaultUIConfigSettingsStrings, type UIConfigSettingsStrings }
