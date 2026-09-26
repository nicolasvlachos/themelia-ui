/**
 * SharedResourceCard: the "assign a thing to this record" panel.
 *
 * `TResource` is what is persisted; `TSuggestion` is what the picker offers (usually a
 * lighter search result). The card owns presentation, the pending selection and the
 * confirming state, but no data: picker, persistence and `resource` are the consumer's.
 * `null` is the only empty state.
 */
import type { ComponentType, ReactNode } from "react"

import type { ActionDefinition } from "@/components/base/action-menu"
import type { AlertTone } from "@/components/base/feedback"
import type { OverlayWidth } from "@/components/features/overlays"

import type { SharedResourceCardStrings } from "./resource-assignment.strings"

/** What the consumer's picker receives. */
export type SharedResourceSelectorProps<
	TSuggestion,
	TSelectorProps extends object = Record<never, never>,
> = {
	onSelect: (resource: TSuggestion | null) => void
	/** The pending choice. Not persisted until confirmed. */
	selected: TSuggestion | null
	/** Whether it is rendered inside the dialog, for a picker that adapts. */
	inModal: boolean
	lockOnSelect?: boolean
	context?: "dialog" | "sheet"
} & TSelectorProps

/** The state every seam receives. */
export interface SharedResourceCardContext<TResource, TSuggestion> {
	resource: TResource | null
	/** Derived from `resource !== null`. Never independently controlled. */
	hasResource: boolean
	isSelectorOpen: boolean
	isConfirming: boolean
	selectedSuggestion: TSuggestion | null
	setSelectedSuggestion: (resource: TSuggestion | null) => void
	openSelector: () => void
	closeSelector: () => void
	confirmSelection: () => Promise<void>
	canConfirmSelection: boolean
}

export interface SharedResourceCardContentProps<TResource, TSuggestion> {
	context: SharedResourceCardContext<TResource, TSuggestion>
}

/** One block of the assigned resource's body, shown when its predicate says so. */
export interface SharedResourceCardSection<TResource, TSuggestion> {
	id: string
	when?: (context: SharedResourceCardContext<TResource, TSuggestion>) => boolean
	className?: string
	Component: ComponentType<SharedResourceCardContentProps<TResource, TSuggestion>>
}

export interface SharedResourceCardDialogContentProps<
	TResource,
	TSuggestion,
	TSelectorProps extends object = Record<never, never>,
> {
	SelectorComponent: ComponentType<SharedResourceSelectorProps<TSuggestion, TSelectorProps>>
	selectorProps?: TSelectorProps
	context: SharedResourceCardContext<TResource, TSuggestion>
}

export interface SharedResourceCardSelectorConfig<
	TResource,
	TSuggestion,
	TSelectorProps extends object = Record<never, never>,
> {
	title: string
	description?: string
	confirmText: string
	cancelText: string
	/** Names the change action. Alone it is a header button; with other actions it joins the overflow menu. */
	actionLabel?: string
	/** Turns the persisted resource into a starting choice for the picker. */
	mapInitialSelected: (resource: TResource | null) => TSuggestion | null
	/** How the pending choice reads in the summary. */
	getSelectionLabel?: (selection: TSuggestion) => ReactNode
	/** Persists it. The card awaits a returned promise and shows the confirming state. */
	onConfirmSelection: (selection: TSuggestion) => void | Promise<void>
	SelectorComponent: ComponentType<SharedResourceSelectorProps<TSuggestion, TSelectorProps>>
	selectorProps?: TSelectorProps
	DialogContentComponent?: ComponentType<
		SharedResourceCardDialogContentProps<TResource, TSuggestion, TSelectorProps> &
			Record<string, unknown>
	>
	dialogContentProps?: Record<string, unknown>
	DialogSummaryComponent?: ComponentType<SharedResourceCardContentProps<TResource, TSuggestion>>
	/** Refuses a pending choice: an inactive venue, a full room. */
	isConfirmDisabled?: (selection: TSuggestion | null) => boolean
	/** Fires once per closed-to-open cycle, with the choice the dialog opened on. */
	onDialogOpen?: (selection: TSuggestion | null) => void
	onDialogClose?: () => void
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	/** Controlled pending choice. Authoritative on every open. */
	value?: TSuggestion | null
	/** Uncontrolled starting choice. Authoritative on the first open only. */
	defaultValue?: TSuggestion | null
	onValueChange?: (selection: TSuggestion | null) => void
	onError?: (error: unknown, selection: TSuggestion) => void
	dialogWidth?: OverlayWidth
}

export interface SharedResourceCardProps<
	TResource,
	TSuggestion,
	TSelectorProps extends object = Record<never, never>,
> {
	icon?: ReactNode
	title: ReactNode
	description?: ReactNode
	className?: string
	contentClassName?: string
	alert?: ReactNode
	alertTone?: Extract<AlertTone, "neutral" | "destructive" | "warning">
	/** Extra overflow actions. The change action joins them when they exist. */
	actions?: ActionDefinition[]
	headerAction?: ReactNode
	footerText?: ReactNode
	/** The persisted assignment. `null` is the only empty state. */
	resource: TResource | null
	selector?: SharedResourceCardSelectorConfig<TResource, TSuggestion, TSelectorProps>
	/** Declarative body blocks, used when no content override is given. */
	sections?: SharedResourceCardSection<TResource, TSuggestion>[]
	sectionsClassName?: string
	/**
	 * Router-neutral "open the resource" slot, shown only when one is assigned.
	 * Takes precedence over `viewLink`.
	 */
	viewAction?: ReactNode
	/** The native-anchor convenience, for an app with no router in the way. */
	viewLink?: { href: string; label: ReactNode; className?: string }
	ResourceContentComponent?: ComponentType<SharedResourceCardContentProps<TResource, TSuggestion>>
	EmptyContentComponent?: ComponentType<SharedResourceCardContentProps<TResource, TSuggestion>>
	renderResourceContent?: (context: SharedResourceCardContext<TResource, TSuggestion>) => ReactNode
	renderEmptyContent?: (context: SharedResourceCardContext<TResource, TSuggestion>) => ReactNode
	strings?: Partial<SharedResourceCardStrings>
}
