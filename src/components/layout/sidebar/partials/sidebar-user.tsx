/**
 * SidebarUser: the account row at the foot of the rail. Its menu opens to the side when
 * the rail is collapsed and below it otherwise.
 */
import type { ReactElement, ReactNode } from "react"
import { ChevronsUpDownIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

import { ActionMenu, type ActionDefinition } from "@/components/base/action-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import {
	SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/base/sidebar"
import { formatInitials } from "@/components/primitives"
import { Text } from "@/components/base/typography"

import type { LayoutUser } from "../../layout.types"
import { defaultSidebarUserStrings, type SidebarUserStrings } from "../sidebar.strings"
import styles from "../layout-sidebar.module.css"

export interface SidebarUserProps {
	user: LayoutUser
	/** Replaces the menu body, as in HeaderUserMenu. */
	customContent?: ReactNode
	onProfile?: () => void
	onSettings?: () => void
	onLogout?: () => void
	strings?: Partial<SidebarUserStrings>
	/** Replaces the row's content, keeping the button and the menu. */
	renderTrigger?: (user: LayoutUser) => ReactNode
}

export function SidebarUser({
	user,
	customContent,
	onProfile,
	onSettings,
	onLogout,
	strings,
	renderTrigger,
}: SidebarUserProps) {
	const copy = { ...defaultSidebarUserStrings, ...strings }
	const { state, isMobile } = useSidebar()
	const side = isMobile || state !== "collapsed" ? "top" : "right"
	const initials = formatInitials(user.name, { strategy: "first-words" })

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

	const trigger = (
		<SidebarMenuButton
			size="lg"
			className={styles.userTrigger}
			// Collapsed, the row is an avatar: it needs a name of its own.
			aria-label={state === "collapsed" ? `${copy.trigger}, ${user.name}` : undefined}
		>
			{renderTrigger?.(user) ?? (
				<>
					<Avatar size="sm">
						{!!user.avatar && <AvatarImage src={user.avatar} alt="" />}
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
					<span className={styles.userIdentity}>
						<Text tag="span" weight="medium">{user.name}</Text>
						{!!user.email && (
							<Text tag="span" size="xs" type="secondary">{user.email}</Text>
						)}
					</span>
					<ChevronsUpDownIcon aria-hidden className={styles.userChevron} />
				</>
			)}
		</SidebarMenuButton>
	)

	return (
		<SidebarMenu className="sidebar-user--component">
			<SidebarMenuItem>
				{customContent ? (
					<DropdownMenu>
						<DropdownMenuTrigger render={trigger as ReactElement} />
						<DropdownMenuContent align="end" side={side}>
							{customContent}
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<ActionMenu
						actions={actions}
						align="end"
						side={side}
						renderTrigger={trigger as ReactElement}
					/>
				)}
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
