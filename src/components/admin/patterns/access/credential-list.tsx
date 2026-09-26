/**
 * CredentialList: a collapsible list of named secrets (API keys, tokens, hooks) with a
 * per-row menu. Every action is a callback; delete confirmation belongs to the caller.
 * Copying goes through `base/copyable`.
 */
import { KeyRoundIcon, PlusIcon, Trash2Icon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Empty } from "@/components/base/feedback"
import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import { Button } from "@/components/base/buttons"
import { Copyable } from "@/components/base/copyable"
import {
	Collapsible, CollapsibleContent, CollapsibleTrigger, IconBadge,
} from "@/components/base/display"
import {
	Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle,
} from "@/components/base/item"
import { Text } from "@/components/base/typography"
import { useControllableState } from "@/hooks"
import { cx } from "@/lib/cx"

import { defaultCredentialListStrings, type CredentialListStrings } from "./admin.strings"
import styles from "./admin.module.css"

export interface Credential {
	id: string
	/** What the key is for — "Production", "CI". */
	name: string
	/** Written to the clipboard. */
	value: string
	/** Drawn in the row. Pass a masked form when the secret must not be on screen. */
	displayValue?: string
	icon?: ReactNode
	disabled?: boolean
}

/* `onCopy` is omitted: a div's is a clipboard EVENT handler, and ours reports an item. */
export interface CredentialListProps
	extends Omit<ComponentProps<"div">, "children" | "title" | "onCopy"> {
	items: Credential[]
	title?: ReactNode
	/** Uncontrolled. */
	defaultOpen?: boolean
	/** Controlled. */
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Omit to hide the add action. */
	onAdd?: () => void
	/** Omit to hide the delete entry. The confirmation belongs to the caller. */
	onDelete?: (id: string, item: Credential) => void
	/** Fires after the value reaches the clipboard — for analytics. */
	onCopy?: (id: string, item: Credential) => void
	strings?: Partial<CredentialListStrings>
}

export function CredentialList({
	items,
	title,
	defaultOpen = true,
	open,
	onOpenChange,
	onAdd,
	onDelete,
	onCopy,
	strings,
	className,
	...props
}: CredentialListProps) {
	const copy = { ...defaultCredentialListStrings, ...strings }
	const [expanded, setExpanded] = useControllableState({
		value: open,
		defaultValue: defaultOpen,
		onChange: onOpenChange,
	})

	return (
		<div className={cx("credential-list--component", styles.credentialList, className)} {...props}>
			<Collapsible
				open={expanded}
				onOpenChange={setExpanded}
			>
				<div className={styles.credentialHeader}>
					<CollapsibleTrigger className={styles.credentialToggle}>
						<Text tag="span" weight="semibold">
							{title ?? copy.title}
						</Text>
					</CollapsibleTrigger>
					{/* Icon only: the label is the accessible name, not a child. */}
					{onAdd && (
						<Button
							tone="secondary"
							buttonStyle="ghost"
							iconOnly
							aria-label={copy.addLabel}
							onClick={onAdd}
						>
							<PlusIcon aria-hidden="true" />
						</Button>
					)}
				</div>

				<CollapsibleContent className={styles.credentialBody}>
					{items.length === 0 ? (
						<Empty padding="sm" title={copy.emptyMessage} description={false} />
					) : (
						/* A hairline-ruled list. */
						<ItemGroup ruled>
							{items.map((item) => {
								const actions: ActionDefinition[] = onDelete
									? [
											{
												id: "delete",
												label: copy.deleteLabel,
												icon: Trash2Icon,
												tone: "destructive",
												disabled: item.disabled,
												onClick: () => onDelete(item.id, item),
											},
										]
									: []

								return (
									<Item key={item.id}>
										{/* Framed in an IconBadge, like every leading glyph in the kit. */}
										<ItemMedia>
											{item.icon ?? <IconBadge icon={KeyRoundIcon} shape="rounded" />}
										</ItemMedia>
										<ItemContent>
											<ItemTitle>{item.name}</ItemTitle>
											{/* Compact: in a row the secret reads as the title's description. */}
											<Copyable
												value={item.value}
												displayValue={item.displayValue ?? item.value}
												mono
												truncate
												compact
												/* The list's `copyLabel`, not Copyable's generic default. */
												strings={{ copy: copy.copyLabel }}
												onCopy={() => onCopy?.(item.id, item)}
											/>
										</ItemContent>
										{actions.length > 0 && (
											<ItemActions>
												<ActionMenu actions={actions} strings={{ trigger: copy.rowMenuLabel }} />
											</ItemActions>
										)}
									</Item>
								)
							})}
						</ItemGroup>
					)}
				</CollapsibleContent>
			</Collapsible>
		</div>
	)
}
