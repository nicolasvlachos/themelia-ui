/**
 * SharedResourceCard: shows the resource assigned to a record and how to change it.
 *
 * The card owns the shape (panel, dialog, pending choice, awaited confirm); the picker is
 * the consumer's, since every assignment searches differently. Assigned body, most
 * specific first: `renderResourceContent`, `ResourceContentComponent`, `sections`, then a
 * "nothing configured" placeholder.
 */
import { EyeIcon, PackageOpenIcon } from "lucide-react"
import { useCallback, useMemo, type MouseEvent, type ReactNode } from "react"

import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import { Button } from "@/components/base/buttons"
import { ContentBlock } from "@/components/base/display"
import { Alert, Empty } from "@/components/base/feedback"
import { Stack } from "@/components/base/structure"
import { DisplayLabel, Text } from "@/components/base/typography"
import { ActionDialog } from "@/components/features/overlays"
import { cx } from "@/lib/cx"

import { useSharedResourceCard } from "./use-shared-resource-card"
import { defaultSharedResourceCardStrings } from "./resource-assignment.strings"
import type {
	SharedResourceCardContentProps, SharedResourceCardDialogContentProps,
	SharedResourceCardProps, SharedResourceSelectorProps,
} from "./resource-assignment.types"
import styles from "./resource-assignment.module.css"

/** The dialog body when not replaced: just the picker. */
export function DefaultDialogContent<
	TResource,
	TSuggestion,
	TSelectorProps extends object = Record<never, never>,
>({
	SelectorComponent,
	selectorProps,
	context,
}: SharedResourceCardDialogContentProps<TResource, TSuggestion, TSelectorProps>) {
	const props = {
		...((selectorProps ?? {}) as TSelectorProps),
		onSelect: context.setSelectedSuggestion,
		selected: context.selectedSuggestion,
		inModal: true,
		lockOnSelect: false,
		context: "dialog" as const,
	} as SharedResourceSelectorProps<TSuggestion, TSelectorProps>

	return <SelectorComponent {...props} />
}

/**
 * Restates the pending choice above the confirm, since the chosen row may have scrolled
 * out of sight. Falls back to a `label` field; pass `getSelectionLabel` to be exact.
 */
export function DefaultDialogSummary<TResource, TSuggestion>({
	context,
	strings,
	getSelectionLabel,
}: SharedResourceCardContentProps<TResource, TSuggestion> & {
	strings?: Partial<typeof defaultSharedResourceCardStrings>
	getSelectionLabel?: (selection: TSuggestion) => ReactNode
}) {
	const copy = { ...defaultSharedResourceCardStrings, ...strings }
	const selected = context.selectedSuggestion
	if (selected === null) return null

	const label =
		getSelectionLabel?.(selected) ??
		(typeof selected === "object" &&
		selected !== null &&
		"label" in selected &&
		typeof (selected as { label: unknown }).label === "string"
			? (selected as { label: string }).label
			: null)

	if (label === null || label === undefined || label === "") return null

	return (
		<div className={cx("default-dialog-summary--component", styles.summary)}>
			<DisplayLabel>{copy.currentlySelected}</DisplayLabel>
			<Text weight="medium" className={styles.summaryValue}>{label}</Text>
		</div>
	)
}

export function SharedResourceCard<
	TResource,
	TSuggestion,
	TSelectorProps extends object = Record<never, never>,
>({
	icon,
	title,
	description,
	className,
	contentClassName,
	alert,
	alertTone = "neutral",
	actions,
	headerAction,
	footerText,
	resource,
	selector,
	sections,
	sectionsClassName,
	viewAction,
	viewLink,
	ResourceContentComponent,
	EmptyContentComponent,
	renderResourceContent,
	renderEmptyContent,
	strings,
}: SharedResourceCardProps<TResource, TSuggestion, TSelectorProps>) {
	const copy = { ...defaultSharedResourceCardStrings, ...strings }

	const context = useSharedResourceCard<TResource, TSuggestion>({
		resource,
		mapInitialSelected: selector?.mapInitialSelected ?? (() => null),
		onConfirmSelection: selector?.onConfirmSelection ?? (() => undefined),
		isConfirmDisabled: selector?.isConfirmDisabled,
		onDialogOpen: selector?.onDialogOpen,
		onDialogClose: selector?.onDialogClose,
		onError: selector?.onError,
		open: selector?.open,
		defaultOpen: selector?.defaultOpen,
		onOpenChange: selector?.onOpenChange,
		value: selector?.value,
		defaultValue: selector?.defaultValue,
		onValueChange: selector?.onValueChange,
	})

	const canSelect = !!(selector && selector.SelectorComponent)
	const changeLabel =
		selector?.actionLabel ?? (context.hasResource ? copy.changeAction : copy.assignAction)
	const { openSelector } = context
	const openSelectorFromClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		if (event.defaultPrevented) return
		// Focus the trigger explicitly: the native dialog restores focus to the element active at opening.
		event.currentTarget.focus({ preventScroll: true })
		openSelector()
	}, [openSelector])

	/*
	 * Alone, the change action is a header button; with other actions it joins their menu.
	 * It is hidden while the default empty state shows, which renders the same button; a
	 * replaced empty body keeps it, since custom content may carry no trigger.
	 */
	const hasOtherActions = (actions?.length ?? 0) > 0
	const emptyStateOwnsAction =
		!context.hasResource && canSelect && !renderEmptyContent && !EmptyContentComponent
	const inlineChange = canSelect && !hasOtherActions && !emptyStateOwnsAction

	const menuActions = useMemo<ActionDefinition[]>(() => {
		const list = [...(actions ?? [])]
		if (canSelect && hasOtherActions) {
			list.unshift({ id: "change-resource", label: changeLabel, onClick: context.openSelector })
		}
		return list
	}, [actions, canSelect, changeLabel, context.openSelector, hasOtherActions])

	const headerEnd = (headerAction || inlineChange) && (
		<>
			{headerAction}
			{inlineChange && (
				<Button type="button" tone="neutral" buttonStyle="outline" onClick={openSelectorFromClick}>
					{changeLabel}
				</Button>
			)}
			{menuActions.length > 0 && <ActionMenu actions={menuActions} />}
		</>
	)

	/** The override ladder (see the file header). */
	const assignedBody = useMemo<ReactNode>(() => {
		if (renderResourceContent) return renderResourceContent(context)
		if (ResourceContentComponent) return <ResourceContentComponent context={context} />

		const visible = (sections ?? []).filter((section) => section.when?.(context) ?? true)
		if (visible.length > 0) {
			return (
				<div className={cx(styles.sections, sectionsClassName)}>
					{visible.map((section) => (
						<div key={section.id} className={section.className}>
							<section.Component context={context} />
						</div>
					))}
				</div>
			)
		}

		return <Text type="secondary">{copy.noResourceContent}</Text>
	}, [ResourceContentComponent, context, copy.noResourceContent, renderResourceContent, sections, sectionsClassName])

	const emptyBody = useMemo<ReactNode>(() => {
		if (renderEmptyContent) return renderEmptyContent(context)
		if (EmptyContentComponent) return <EmptyContentComponent context={context} />

		// Without a picker there is nothing to offer, so the empty state does not pretend.
		if (!canSelect) return <Text type="secondary">{copy.noResourceSelected}</Text>

		return (
			<Empty
				padding="sm"
				media={<PackageOpenIcon />}
				mediaVariant="icon-soft"
				title={copy.noResourceSelected}
				description={false}
				action={
					<Button type="button" tone="neutral" buttonStyle="outline" onClick={openSelectorFromClick}>
						{changeLabel}
					</Button>
				}
			/>
		)
	}, [EmptyContentComponent, canSelect, changeLabel, context, copy.noResourceSelected, openSelectorFromClick, renderEmptyContent])

	/* The view action is a Button rendered as an anchor: link semantics, card-action chrome. */
	const viewNode = context.hasResource
		? (viewAction ?? (viewLink ? (
				<Button render={<a href={viewLink.href} />} tone="neutral" buttonStyle="outline">
					<EyeIcon aria-hidden />
						{viewLink.label}
				</Button>
			) : null))
		: null

	return (
		<>
			<ContentBlock
				icon={icon}
				title={title}
				description={description}
				headerEnd={headerEnd}
				surface="bordered"
				data-slot="shared-resource-card"
				data-state={context.hasResource ? "assigned" : "empty"}
				className={cx("shared-resource-card--component", styles.card, className)}
			>
				{!!alert && <Alert tone={alertTone}>{alert}</Alert>}

				<div className={cx(styles.body, contentClassName)}>
					{context.hasResource ? assignedBody : emptyBody}
				</div>

				{!!viewNode && (
					<div className={cx(styles.viewAction, viewLink?.className)}>{viewNode}</div>
				)}

				{!!footerText && <Text size="xs" type="secondary">{footerText}</Text>}
			</ContentBlock>

			{canSelect && !!selector && (
				<ActionDialog
					open={context.isSelectorOpen}
					onOpenChange={(open) => {
						if (!open) context.closeSelector()
					}}
					title={selector.title}
					description={selector.description}
					width={selector.dialogWidth ?? "xl"}
					/*
					 * The generated footer is off; the body renders one whose confirm awaits the
					 * write and refuses an invalid choice.
					 */
					showCancel={false}
					showConfirm={false}
				>
					{selector.DialogContentComponent ? (
						<selector.DialogContentComponent
							SelectorComponent={selector.SelectorComponent}
							selectorProps={selector.selectorProps}
							context={context}
							{...(selector.dialogContentProps ?? {})}
						/>
					) : (
						<DefaultDialogContent<TResource, TSuggestion, TSelectorProps>
							SelectorComponent={selector.SelectorComponent}
							selectorProps={selector.selectorProps}
							context={context}
						/>
					)}

					{selector.DialogSummaryComponent ? (
						<selector.DialogSummaryComponent context={context} />
					) : (
						<DefaultDialogSummary
							context={context}
							strings={strings}
							getSelectionLabel={selector.getSelectionLabel}
						/>
					)}

					<Stack direction="horizontal" gap="md" justify="end" className={styles.dialogFooter}>
						<Button
							type="button"
							tone="neutral"
							buttonStyle="outline"
							onClick={context.closeSelector}
							disabled={context.isConfirming}
						>
							{selector.cancelText}
						</Button>
						<Button
							type="button"
							onClick={() => void context.confirmSelection()}
							disabled={!context.canConfirmSelection || context.isConfirming}
							loading={context.isConfirming}
						>
							{selector.confirmText}
						</Button>
					</Stack>
				</ActionDialog>
			)}
		</>
	)
}
