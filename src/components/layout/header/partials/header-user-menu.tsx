/**
 * HeaderUserMenu: the account control. The three callbacks build a command menu;
 * `customContent` replaces it with arbitrary content.
 */
import type { ReactElement } from "react"
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import { formatInitials } from "@/components/primitives"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultHeaderUserMenuStrings } from "../header.strings"
import type { HeaderUserMenuProps } from "../header.types"
import styles from "../header.module.css"

export function HeaderUserMenu({
	user,
	showIdentity = true,
	showEmail = true,
	customContent,
	onProfile,
	onSettings,
	onLogout,
	align = "end",
	side = "bottom",
	strings,
	className,
	contentClassName,
	renderTrigger,
}: HeaderUserMenuProps) {
	const copy = { ...defaultHeaderUserMenuStrings, ...strings }
	const initials = formatInitials(user.name, { strategy: "first-words" })

	/* Sign-out is set apart by a rule, away from "Settings". */
	const actions: ActionDefinition[] = [
		...(onProfile ? [{ id: "profile", label: copy.profile, icon: UserIcon, onClick: onProfile }] : []),
		...(onSettings ? [{ id: "settings", label: copy.settings, icon: SettingsIcon, onClick: onSettings }] : []),
		...(onLogout
			? [{
				id: "logout",
				label: copy.logout,
				icon: LogOutIcon,
				onClick: onLogout,
				...(onProfile || onSettings ? { group: true as const } : null),
			}]
			: []),
	]

	const trigger = renderTrigger?.(user) ?? (
		<button
			type="button"
			data-slot="header-user-menu-trigger"
			// The identity column hides below md, so the avatar alone needs a name.
			aria-label={showIdentity ? undefined : `${copy.trigger}, ${user.name}`}
			className={cx("header-user-menu--component", styles.userTrigger, className)}
		>
			<Avatar size="sm">
				{!!user.avatar && <AvatarImage src={user.avatar} alt="" />}
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
			{!!showIdentity && (
				<span className={styles.userIdentity}>
					<Text tag="span" weight="medium">{user.name}</Text>
					{!!showEmail && !!user.email && (
						<Text tag="span" size="xs" type="secondary">{user.email}</Text>
					)}
				</span>
			)}
			<ChevronsUpDownIcon aria-hidden className={styles.userChevron} />
		</button>
	)

	if (customContent) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger render={trigger as ReactElement} />
				<DropdownMenuContent
					data-slot="header-user-menu-content"
					align={align}
					side={side}
					className={contentClassName}
				>
					{customContent}
				</DropdownMenuContent>
			</DropdownMenu>
		)
	}

	return (
		<ActionMenu
			actions={actions}
			align={align}
			side={side}
			contentClassName={contentClassName}
			renderTrigger={trigger as ReactElement}
		/>
	)
}
