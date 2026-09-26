import { MoreVerticalIcon } from "lucide-react"
import { Fragment, isValidElement, useMemo, type ComponentProps, type ComponentType, type ReactElement, type ReactNode } from "react"

import { Button, type ButtonStyle } from "@/components/base/buttons"
import {
	DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
	DropdownMenuItem, DropdownMenuLabel, DropdownMenuLinkItem, DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"
import { useDefaults } from "@/lib/ui-provider"

import styles from "./action-menu.module.css"
import { splitActions } from "./context-actions"
import { defaultActionMenuStrings, type ActionMenuStrings } from "./action-menu.strings"
import type {
	ActionDefinition, ActionIcon, ActionLinkRenderer, ActionMenuLabelVisibility, ResolvedAction } from "./action-menu.types"

export interface ActionMenuProps {
	/** Commands to offer. Destructive entries move last unless `preserveOrder` is set. */
	actions: readonly ActionDefinition[]
	/** Trigger text. Omit for an icon-only trigger — `strings.trigger` names it then. */
	label?: string
	/** Trigger glyph. Defaults to the vertical ellipsis. */
	icon?: ActionIcon
	/** Overrides this menu's own copy. */
	strings?: Partial<ActionMenuStrings>
	buttonProps?: Omit<ComponentProps<typeof Button>, "children">
	align?: "start" | "center" | "end"
	side?: "top" | "right" | "bottom" | "left"
	contentClassName?: string
	/**
	 * Fixed surface width, any CSS length, or `"trigger"` to match the trigger. Left
	 * unset the menu sizes to its widest row.
	 */
	width?: string | number | "trigger"
	minWidth?: string | number
	/** Ceiling for the content-sized default: a reading measure, so one long label doesn't widen every row. */
	maxWidth?: string | number
	closeOnSelect?: boolean
	labelVisibility?: ActionMenuLabelVisibility
	/** Keeps the incoming order instead of moving destructive entries last. */
	preserveOrder?: boolean
	/** Routes `href` actions through the app's router, keeping this framework-agnostic. */
	renderLink?: ActionLinkRenderer
	/**
	 * Replaces the trigger entirely — an account block, a sidebar row, a tab. For different
	 * words on a plain button, use `label` and `icon`.
	 */
	renderTrigger?: ComponentProps<typeof DropdownMenuTrigger>["render"]
}

export interface ActionButtonsProps {
	/** The same definitions, side by side rather than collapsed into a menu. */
	actions: readonly ActionDefinition[]
	/**
	 * How many render as buttons before the rest collapse into an overflow menu built from
	 * the same array. Unset, every definition is a button.
	 */
	max?: number
	/** Overrides this toolbar's own copy — the overflow trigger's name. */
	strings?: Partial<ActionMenuStrings>
	className?: string
	renderLink?: ActionLinkRenderer
}

function isDestructive(action: ActionDefinition) {
	return action.tone === "destructive"
}

function actionKey(action: ActionDefinition, index: number) {
	return action.id ?? (typeof action.label === "string" ? action.label : `action-${index}`)
}

/** Destructive commands move last (unless `preserveOrder`), which is why this takes definitions. */
function resolveActions(actions: readonly ActionDefinition[], preserveOrder: boolean) {
	const visible = actions.filter((action) => action.visible !== false)
	if (preserveOrder) return visible
	return [...visible.filter((a) => !isDestructive(a)), ...visible.filter(isDestructive)]
}

function renderIcon(icon: ActionIcon | undefined): ReactNode {
	if (!icon) return null
	if (isValidElement(icon)) return icon
	if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
		const Icon = icon as ComponentType<{ "aria-hidden"?: boolean }>
		return <Icon aria-hidden />
	}
	return icon as ReactNode
}

/** The row's parts, passed as slots so the menu owns the layout for defined and hand-written rows alike. */
function rowSlots(action: ActionDefinition) {
	return {
		icon: renderIcon(action.icon),
		description: action.description,
		shortcut: action.shortcut,
		trailing: action.trailing,
	}
}

function renderMenuAction(
	action: ActionDefinition,
	index: number,
	closeOnSelect: boolean,
	renderLink?: ActionLinkRenderer,
	/* True when another row in the menu has an icon and this one does not. */
	inset = false,
) {
	const key = actionKey(action, index)
	const closeOnClick = action.closeOnSelect ?? closeOnSelect
	if (action.render) return <div key={key} className="action-menu--item">{action.render}</div>

	const slots = rowSlots(action)
	const content = typeof action.label === "string" ? (
		<Text tag="span" size="inherit" truncate className="action-menu--item-label">
			{action.label}
		</Text>
	) : (
		action.label
	)
	const className = cx("action-menu--item", action.className)
	const variant = isDestructive(action) ? "destructive" : "default"

	if (action.type === "checkbox") {
		return (
			<DropdownMenuCheckboxItem
				key={key}
				checked={!!action.checked}
				disabled={action.disabled}
				closeOnClick={closeOnClick}
				onCheckedChange={action.onCheckedChange}
				className={className}
				icon={slots.icon}
				description={slots.description}
				inset={inset}
			>
				{content}
			</DropdownMenuCheckboxItem>
		)
	}

	if (action.href && !action.disabled) {
		const href = action.href
		return (
			<DropdownMenuLinkItem
				key={key}
				href={href}
				variant={variant}
				closeOnClick={closeOnClick}
				onClick={action.onClick}
				{...slots}
				inset={inset}
				/*
				 * With a link renderer, pass an element, not the function form: renderers often drop
				 * unknown props, losing role="menuitem"; an element lets the menu merge its props after.
				 */
				render={
					renderLink
						? renderLink({
								href,
								children: content,
								target: action.target,
								rel: action.rel,
								external: action.external,
								disabled: action.disabled,
							})
						: (props) => <a {...props} href={href} target={action.target} rel={action.rel} />
				}
				className={className}
			>
				{content}
			</DropdownMenuLinkItem>
		)
	}

	return (
		<DropdownMenuItem
			key={key}
			disabled={action.disabled}
			variant={variant}
			closeOnClick={closeOnClick}
			onClick={action.onClick}
			className={className}
			{...slots}
			inset={inset}
		>
			{content}
		</DropdownMenuItem>
	)
}

/**
 * Slices the list into real `Menu.Group`s: `Menu.GroupLabel` throws outside one, and the
 * group is what carries the label's accessible name.
 */
function toGroups(actions: readonly ActionDefinition[]) {
	const groups: { caption: string | null; actions: { action: ActionDefinition; index: number }[] }[] = []
	let currentKey: string | true | null | undefined

	let previousWasDestructive = false

	actions.forEach((action, index) => {
		const key = action.group ?? null
		/*
		 * A destructive entry always starts a group, so a rule separates it from the command
		 * above. `preserveOrder` suppresses the reordering, not the rule.
		 */
		const startsGroup = isDestructive(action) && !previousWasDestructive
		if (groups.length === 0 || key !== currentKey || startsGroup) {
			currentKey = key
			groups.push({ caption: typeof key === "string" ? key : null, actions: [] })
		}
		groups[groups.length - 1]?.actions.push({ action, index })
		previousWasDestructive = isDestructive(action)
	})

	return groups
}

function renderGrouped(
	actions: readonly ActionDefinition[],
	closeOnSelect: boolean,
	renderLink?: ActionLinkRenderer,
) {
	/* One label column for the whole menu: iconless rows are inset when any row has an icon. */
	const anyIcon = actions.some((action) => action.icon != null)
	return toGroups(actions).map((group, groupIndex) => (
		<Fragment key={group.caption ?? `group-${groupIndex}`}>
			{groupIndex > 0 && <DropdownMenuSeparator />}
			<DropdownMenuGroup>
				{/* No Text inside: DropdownMenuLabel already is the caption treatment. */}
				{group.caption != null && <DropdownMenuLabel>{group.caption}</DropdownMenuLabel>}
				{group.actions.map(({ action, index }) =>
					renderMenuAction(action, index, closeOnSelect, renderLink, anyIcon && action.icon == null),
				)}
			</DropdownMenuGroup>
		</Fragment>
	))
}

/**
 * Overflow commands for a page, a card, a table or a row — one component so grouping,
 * destructive ordering, checkbox rows and links behave the same everywhere.
 */
export function ActionMenu({
	actions,
	label,
	icon = MoreVerticalIcon,
	strings,
	buttonProps,
	align,
	side = "bottom",
	contentClassName,
	width,
	minWidth,
	maxWidth,
	closeOnSelect,
	labelVisibility,
	preserveOrder = false,
	renderLink,
	renderTrigger,
}: ActionMenuProps) {
	const copy = { ...defaultActionMenuStrings, ...strings }
	const defaults = useDefaults("actionMenu", {
		align: "end" as const,
		closeOnSelect: true,
		labelVisibility: "visible" as ActionMenuLabelVisibility,
	})
	const resolvedAlign = align ?? defaults.align
	const resolvedCloseOnSelect = closeOnSelect ?? defaults.closeOnSelect
	const resolvedVisibility = labelVisibility ?? defaults.labelVisibility

	const resolved = useMemo(() => resolveActions(actions, preserveOrder), [actions, preserveOrder])
	if (resolved.length === 0) return null

	const showsLabel = Boolean(label) && resolvedVisibility === "visible"
	const labelClass =
		resolvedVisibility === "hidden"
			? styles.labelHidden
			: resolvedVisibility === "responsive"
				? styles.labelResponsive
				: undefined

	const triggerIcon = renderIcon(icon)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					renderTrigger ?? (
						<Button
							tone="neutral"
							buttonStyle="ghost"
							iconOnly={!showsLabel}
							aria-label={showsLabel ? undefined : copy.trigger}
							{...buttonProps}
						>
							{triggerIcon}
							{label != null && (
								<Text
									tag="span"
									size="inherit"
									weight="medium"
									className={cx(styles.triggerLabel, labelClass)}
								>
									{label}
								</Text>
							)}
						</Button>
					)
				}
			/>
			<DropdownMenuContent
				align={resolvedAlign}
				side={side}
				width={width}
				minWidth={minWidth}
				maxWidth={maxWidth}
				className={cx("action-menu--component", contentClassName)}
			>
				{renderGrouped(resolved, resolvedCloseOnSelect, renderLink)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

/** The same definitions rendered as visible buttons — a toolbar rather than an overflow. */
export function ActionButtons({
	actions,
	max,
	strings,
	className,
	renderLink,
}: ActionButtonsProps) {
	const copy = { ...defaultActionMenuStrings, ...strings }
	const visible = actions.filter((action) => action.visible !== false)
	if (visible.length === 0) return null

	/* A remainder of one still goes to the menu: `max` caps the buttons shown. */
	const { inline: shown, overflow } = splitActions(
		visible as ResolvedAction[],
		max != null && max >= 0 ? max : undefined,
	)

	return (
		<div className={cx("action-buttons--component", styles.buttons, className)}>
			{shown.map((action, index) => {
				const asLink = action.buttonStyle === "link"
				const buttonStyle: ButtonStyle = asLink
					? "ghost"
					: ((action.buttonStyle as ButtonStyle | undefined) ?? "solid")
				const content = (
					<>
						{renderIcon(action.icon)}
						{action.label}
					</>
				)

				if (action.href && !action.disabled) {
					const href = action.href
					const anchor = renderLink ? (
						renderLink({ href, children: content, target: action.target, rel: action.rel, external: action.external })
					) : (
						<a href={href} target={action.target} rel={action.rel}>
							{content}
						</a>
					)
					return (
						<Button
							key={actionKey(action, index)}
							/* The anchor arrives complete; `render` keeps its own content. */
							render={anchor as ReactElement}
							tone={action.tone ?? "primary"}
							buttonStyle={buttonStyle}
							className={cx(asLink && styles.linkButton, action.className)}
						/>
					)
				}

				return (
					<Button
						key={actionKey(action, index)}
						tone={action.tone ?? "primary"}
						buttonStyle={buttonStyle}
						disabled={action.disabled}
						onClick={action.onClick}
						className={cx(asLink && styles.linkButton, action.className)}
					>
						{content}
					</Button>
				)
			})}

			{overflow.length > 0 && (
				<ActionMenu actions={overflow} strings={{ trigger: copy.overflow }} renderLink={renderLink} />
			)}
		</div>
	)
}
