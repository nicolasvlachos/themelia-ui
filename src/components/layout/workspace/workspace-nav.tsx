/**
 * WorkspaceNav: navigation for a record filled in over time. Each entry's status glyph is
 * derived from its completion unless set explicitly.
 */
import { Fragment, type ComponentProps, type ComponentType, type ReactElement, type ReactNode } from "react"
import { CheckIcon, CircleAlertIcon, CircleIcon } from "lucide-react"

import { Progress } from "@/components/base/feedback"
import {
	Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { VisuallyHidden } from "@/components/base/display"
import { SecondaryValue } from "@/components/primitives"
import { DisplayLabel, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { resolveLayoutLinkRenderer, type LayoutNavigationAdapter } from "../layout.types"
import { defaultWorkspaceNavStrings, type WorkspaceNavStrings } from "./workspace.strings"
import styles from "./workspace.module.css"

export type WorkspaceNavStatus = "complete" | "current" | "attention" | "disabled" | "idle"

export interface WorkspaceNavItem {
	id: string
	label: ReactNode
	description?: ReactNode
	icon?: ComponentType<{ className?: string }>
	/** 0–100. Drives the bar, and the status when none is set. */
	completion?: number
	/** Overrides the derived status. */
	status?: WorkspaceNavStatus
	/** Shorthand for `status="attention"`. */
	warning?: boolean
	disabled?: boolean
	/** Renders a navigation link through renderLink. Without a URL, onSelect uses a button. */
	href?: string
}

export interface WorkspaceNavGroup {
	id: string
	label?: ReactNode
	description?: ReactNode
	items: WorkspaceNavItem[]
}

export interface WorkspaceNavRenderContext {
	active: boolean
	group: WorkspaceNavGroup
	index: number
}

export interface WorkspaceNavProps
	extends Omit<ComponentProps<"nav">, "onSelect">,
		LayoutNavigationAdapter {
	groups: WorkspaceNavGroup[]
	activeId?: string
	/** Runs on enabled link/button activation. Rows with neither a URL nor onSelect stay static. */
	onSelect?: (item: WorkspaceNavItem) => void
	renderItem?: (item: WorkspaceNavItem, context: WorkspaceNavRenderContext) => ReactNode
	footerSlot?: ReactNode
	strings?: Partial<WorkspaceNavStrings>
}

const STATUS_ICON: Record<WorkspaceNavStatus, ComponentType<{ className?: string }>> = {
	complete: CheckIcon,
	current: CircleIcon,
	attention: CircleAlertIcon,
	disabled: CircleIcon,
	idle: CircleIcon,
}

function clampPercent(value: number) {
	return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0
}

/** Explicit status wins; then warning, then current, then completion. */
function resolveStatus(item: WorkspaceNavItem, active: boolean): WorkspaceNavStatus {
	if (item.disabled) return "disabled"
	if (item.status) return item.status
	if (item.warning) return "attention"
	if (active) return "current"
	if (item.completion !== undefined && clampPercent(item.completion) >= 100) return "complete"
	return "idle"
}

export function WorkspaceNav({
	groups,
	activeId,
	onSelect,
	renderItem,
	renderLink,
	footerSlot,
	strings,
	className,
	...props
}: WorkspaceNavProps) {
	const copy = { ...defaultWorkspaceNavStrings, ...strings }
	const link = resolveLayoutLinkRenderer({ renderLink })

	return (
		<nav
			data-slot="workspace-nav"
			aria-label={props["aria-label"] ?? copy.label}
			className={cx("workspace-nav--component", styles.nav, className)}
			{...props}
		>
			<div className={styles.navGroups}>
				{groups.map((group) => (
					<div key={group.id} className={styles.navGroup}>
						{!!group.label && (
							<div className={styles.navGroupHead}>
								<DisplayLabel>{group.label}</DisplayLabel>
								{!!group.description && (
									<Text size="xs" type="secondary">{group.description}</Text>
								)}
							</div>
						)}
						<ItemGroup className={styles.navItems}>
							{group.items.map((item, index) => {
								const active = item.id === activeId
								const status = resolveStatus(item, active)
								const disabled = status === "disabled"
								const StatusIcon = STATUS_ICON[status]
								const Icon = item.icon
								const completion =
									item.completion === undefined ? undefined : clampPercent(item.completion)

								if (renderItem) {
									return (
										<Fragment key={item.id}>
											{renderItem(item, { active, group, index })}
										</Fragment>
									)
								}

								const content = (
									<>
										<ItemMedia variant="icon">
											{Icon ? <Icon /> : <StatusIcon className={styles.navStatusIcon} />}
										</ItemMedia>
										<ItemContent>
											<ItemTitle>
												{item.label}
												{/* The tint is visual; announce the current row too. */}
												{active && <VisuallyHidden>{copy.current}</VisuallyHidden>}
											</ItemTitle>
											{!!item.description && <ItemDescription>{item.description}</ItemDescription>}
											{completion !== undefined && (
												<div className={styles.navProgress}>
													<Progress value={completion} label={copy.completion(completion)} />
													<SecondaryValue size="xs">{copy.completion(completion)}</SecondaryValue>
												</div>
											)}
										</ItemContent>
									</>
								)

								return (
									<Item
										key={item.id}
										render={disabled ? undefined : item.href
											? link({ href: item.href, active, children: content }) as ReactElement
											: onSelect ? <button type="button" /> : undefined}
										aria-current={active ? "page" : undefined}
										aria-disabled={disabled || undefined}
										data-active={active || undefined}
										data-status={status}
										onClick={!disabled && onSelect ? () => onSelect(item) : undefined}
										className={styles.navItem}
									>
										{content}
									</Item>
								)
							})}
						</ItemGroup>
					</div>
				))}
			</div>
			{!!footerSlot && <div className={styles.navFooter}>{footerSlot}</div>}
		</nav>
	)
}
