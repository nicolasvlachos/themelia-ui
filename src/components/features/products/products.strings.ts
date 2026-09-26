/**
 * Products copy: one strings object per surface, since the cards are used independently.
 */

export interface ProductReadinessCardStrings {
	title: string
	description: string
	scoreLabel: string
	progressLabel: string
	createLabel: string
	editLabel: string
	deleteLabel: string
	actionLabel: string
	actionsLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductReadinessCardStrings: ProductReadinessCardStrings = {
	title: "Readiness",
	description: "What is still needed before this can go live.",
	scoreLabel: "Complete",
	progressLabel: "Readiness",
	createLabel: "Add a check",
	editLabel: "Edit",
	deleteLabel: "Delete",
	actionLabel: "Resolve",
	actionsLabel: "Check actions",
	emptyTitle: "Nothing outstanding",
	emptyDescription: "Every readiness check has passed.",
}

export interface ProductStructureCardStrings {
	title: string
	description: string
	createLabel: string
	editLabel: string
	deleteLabel: string
	actionsLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductStructureCardStrings: ProductStructureCardStrings = {
	title: "Structure",
	description: "How this product is put together.",
	createLabel: "Add a metric",
	editLabel: "Edit",
	deleteLabel: "Delete",
	actionsLabel: "Metric actions",
	emptyTitle: "No metrics yet",
	emptyDescription: "Add one to summarise how this product is structured.",
}

export interface ProductOperationsCardStrings {
	title: string
	description: string
	createLabel: string
	editLabel: string
	deleteLabel: string
	actionLabel: string
	actionsLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductOperationsCardStrings: ProductOperationsCardStrings = {
	title: "Operations",
	description: "How this product is delivered and supported.",
	createLabel: "Add an entry",
	editLabel: "Edit",
	deleteLabel: "Delete",
	actionLabel: "Open",
	actionsLabel: "Entry actions",
	emptyTitle: "Nothing configured",
	emptyDescription: "Add an operational detail to show it here.",
}

export interface ProductDetailsCardStrings {
	title: string
	description: string
	editLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductDetailsCardStrings: ProductDetailsCardStrings = {
	title: "Details",
	description: "The facts that identify this product.",
	editLabel: "Edit details",
	emptyTitle: "No details yet",
	emptyDescription: "Add the facts that identify this product.",
}

export interface ProductContractOverviewStrings {
	title: string
	description: string
	termsTitle: string
	rulesTitle: string
	openLabel: string
	editLabel: string
	createRuleLabel: string
	editRuleLabel: string
	deleteRuleLabel: string
	ruleActionsLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductContractOverviewStrings: ProductContractOverviewStrings = {
	title: "Contract",
	description: "The commercial terms this product is sold under.",
	termsTitle: "Terms",
	rulesTitle: "Rules",
	openLabel: "Open contract",
	editLabel: "Edit",
	createRuleLabel: "Add a rule",
	editRuleLabel: "Edit",
	deleteRuleLabel: "Delete",
	ruleActionsLabel: "Rule actions",
	emptyTitle: "No rules yet",
	emptyDescription: "Add a rule to govern how this product is sold.",
}

export interface ProductPoliciesCardStrings {
	title: string
	description: string
	createLabel: string
	editLabel: string
	deleteLabel: string
	actionsLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductPoliciesCardStrings: ProductPoliciesCardStrings = {
	title: "Policies",
	description: "Cancellation, refunds, and everything else the customer agrees to.",
	createLabel: "Add a policy",
	editLabel: "Edit",
	deleteLabel: "Delete",
	actionsLabel: "Policy actions",
	emptyTitle: "No policies yet",
	emptyDescription: "Add one to say what the customer is agreeing to.",
}

export interface ProductOptionsSummaryStrings {
	title: string
	description: string
	manageLabel: string
	createLabel: string
	editLabel: string
	deleteLabel: string
	actionLabel: string
	actionsLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductOptionsSummaryStrings: ProductOptionsSummaryStrings = {
	title: "Options",
	description: "What a customer chooses between.",
	manageLabel: "Manage options",
	createLabel: "Add an option",
	editLabel: "Edit",
	deleteLabel: "Delete",
	actionLabel: "Open",
	actionsLabel: "Option actions",
	emptyTitle: "No options yet",
	emptyDescription: "Add one — size, colour, duration — to generate variants from it.",
}

export interface ProductOptionsMatrixStrings {
	title: string
	description: string
	createLabel: string
	editLabel: string
	deleteLabel: string
	actionsLabel: string
	nameLabel: string
	namePlaceholder: string
	valuesLabel: string
	valuePlaceholder: string
	addValueLabel: string
	removeValueLabel: string
	usedForVariantsLabel: string
	usedForVariantsDescription: string
	saveLabel: string
	cancelLabel: string
	doneLabel: string
	noValues: string
	confirmDeleteTitle: string
	confirmDeleteDescription: (name: string) => string
	confirmDeleteConfirm: string
	confirmDeleteCancel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductOptionsMatrixStrings: ProductOptionsMatrixStrings = {
	/* Not "Options": the summary card is called that, and a product page shows both. */
	title: "Options and values",
	description: "Each option's values combine into the variants below.",
	createLabel: "Add an option",
	editLabel: "Edit",
	deleteLabel: "Delete",
	actionsLabel: "Option actions",
	nameLabel: "Option name",
	namePlaceholder: "Size",
	valuesLabel: "Values",
	valuePlaceholder: "Large",
	addValueLabel: "Add a value",
	removeValueLabel: "Remove",
	usedForVariantsLabel: "Generates variants",
	usedForVariantsDescription: "Combine this option's values with the others.",
	saveLabel: "Save",
	cancelLabel: "Cancel",
	doneLabel: "Done",
	noValues: "No values yet.",
	confirmDeleteTitle: "Delete this option?",
	confirmDeleteDescription: (name) =>
		`Every variant generated from “${name}” goes with it. This cannot be undone.`,
	confirmDeleteConfirm: "Delete option",
	confirmDeleteCancel: "Keep it",
	emptyTitle: "No options yet",
	emptyDescription: "Add one — size, colour, duration — to generate variants from it.",
}

export interface ProductVariantActionMenuStrings {
	menuLabel: string
	openLabel: string
	editLabel: string
	duplicateLabel: string
	deleteLabel: string
}

export const defaultProductVariantActionMenuStrings: ProductVariantActionMenuStrings = {
	menuLabel: "Variant actions",
	openLabel: "Open",
	editLabel: "Edit",
	duplicateLabel: "Duplicate",
	deleteLabel: "Delete",
}

export interface ProductVariantsTableStrings {
	title: string
	description: string
	createLabel: string
	columns: {
		variant: string
		sku: string
		price: string
		inventory: string
		channels: string
		status: string
		updated: string
		/** Names the trailing menu column for screen readers; it shows no caption. */
		actions: string
	}
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductVariantsTableStrings: ProductVariantsTableStrings = {
	title: "Variants",
	description: "Every combination this product is sold as.",
	createLabel: "Add a variant",
	columns: {
		actions: "Actions",
		variant: "Variant",
		sku: "SKU",
		price: "Price",
		inventory: "Stock",
		channels: "Channels",
		status: "Status",
		updated: "Updated",
	},
	emptyTitle: "No variants yet",
	emptyDescription: "Add an option above, then generate the variants from it.",
}

export interface ProductVariantBulkTableStrings extends ProductVariantsTableStrings {
	generateLabel: string
	selectAllLabel: string
	selectRowLabel: (name: string) => string
	selectedCount: (count: number, total: number) => string
	clearSelection: string
	bulkEditLabel: string
	bulkDeleteLabel: string
	groupLabel: (option: string, value: string) => string
	ungrouped: string
	groupCount: (count: number) => string
	selectGroupLabel: (group: string) => string
	expandGroup: string
	collapseGroup: string
	setImageLabel: (name: string) => string
}

export const defaultProductVariantBulkTableStrings: ProductVariantBulkTableStrings = {
	...defaultProductVariantsTableStrings,
	generateLabel: "Generate variants",
	selectAllLabel: "Select every variant",
	selectRowLabel: (name) => `Select ${name}`,
	selectedCount: (count, total) => `${count} of ${total} selected`,
	clearSelection: "Clear selection",
	bulkEditLabel: "Edit selected",
	bulkDeleteLabel: "Delete selected",
	groupLabel: (option, value) => `${option}: ${value}`,
	ungrouped: "Everything else",
	groupCount: (count) => `${count} ${count === 1 ? "variant" : "variants"}`,
	selectGroupLabel: (group) => `Select every variant in ${group}`,
	expandGroup: "Show these variants",
	collapseGroup: "Hide these variants",
	setImageLabel: (name) => `Choose a picture for ${name}`,
}

export interface ProductVariantsManagerStrings {
	title: string
	groupByLabel: string
	groupByNone: string
}

export const defaultProductVariantsManagerStrings: ProductVariantsManagerStrings = {
	title: "Variants",
	groupByLabel: "Group by",
	groupByNone: "Nothing",
}

export interface ProductOverviewStrings {
	title: string
	description: string
}

export const defaultProductOverviewStrings: ProductOverviewStrings = {
	title: "Overview",
	description: "How this product is doing.",
}

export interface ProductQuotePreviewCardStrings {
	title: string
	description: string
	recalculateLabel: string
	emptyTitle: string
	emptyDescription: string
}

export const defaultProductQuotePreviewCardStrings: ProductQuotePreviewCardStrings = {
	title: "Quote preview",
	description: "What a customer sees before they book.",
	recalculateLabel: "Recalculate",
	emptyTitle: "Nothing to price yet",
	emptyDescription: "Add a rate or a policy to see the quote build up.",
}

/** The stand-in for a value a product does not have. */
export const PRODUCT_EMPTY_VALUE = "—"

export interface ProductOptionActionMenuStrings {
	viewLabel: string
	editLabel: string
	deleteLabel: string
	actionsLabel: string
}

export const defaultProductOptionActionMenuStrings: ProductOptionActionMenuStrings = {
	viewLabel: "Open option",
	editLabel: "Edit option",
	deleteLabel: "Delete option",
	actionsLabel: "Option actions",
}

export interface ProductVariantDetailsStrings {
	title: string
	description: string
	backLabel: string
	factsTitle: string
	selectedOptionsTitle: string
	relatedOptionsTitle: string
	viewOptionLabel: string
	emptyTitle: string
	emptyDescription: string
	metadata: {
		price: string
		inventory: string
		sku: string
		channels: string
		updated: string
	}
}

export const defaultProductVariantDetailsStrings: ProductVariantDetailsStrings = {
	title: "Variant",
	description: "Options, pricing, and fulfilment for one sellable variant.",
	backLabel: "Back",
	factsTitle: "Variant facts",
	selectedOptionsTitle: "Selected options",
	relatedOptionsTitle: "Option groups",
	viewOptionLabel: "Open option",
	emptyTitle: "No variant selected",
	emptyDescription: "Choose one from the table to see what it is made of.",
	metadata: {
		price: "Price",
		inventory: "Available",
		sku: "SKU",
		channels: "Channels",
		updated: "Updated",
	},
}

export interface ProductVariantEditorStrings {
	title: string
	description: string
	identityTitle: string
	commercialTitle: string
	optionsTitle: string
	saveLabel: string
	savingLabel: string
	cancelLabel: string
	deleteLabel: string
	statusPlaceholder: string
	optionPlaceholder: string
	fields: {
		name: string
		description: string
		sku: string
		price: string
		inventory: string
		status: string
		channels: string
	}
	placeholders: {
		name: string
		description: string
		sku: string
		price: string
		inventory: string
		status: string
		channels: string
	}
}

export const defaultProductVariantEditorStrings: ProductVariantEditorStrings = {
	title: "Edit variant",
	description: "Identity, pricing, inventory, and the option values this variant stands for.",
	identityTitle: "Identity",
	commercialTitle: "Commercial setup",
	optionsTitle: "Options",
	saveLabel: "Save variant",
	savingLabel: "Saving",
	cancelLabel: "Cancel",
	deleteLabel: "Delete variant",
	statusPlaceholder: "Select status",
	optionPlaceholder: "Select value",
	fields: {
		name: "Name",
		description: "Description",
		sku: "SKU",
		price: "Price",
		inventory: "Inventory",
		status: "Status",
		channels: "Channels",
	},
	placeholders: {
		name: "750 ml bottle",
		description: "Standard retail pack",
		sku: "BAL-750-CL",
		price: "€24.00",
		inventory: "82",
		status: "Active",
		channels: "Online store, POS",
	},
}
