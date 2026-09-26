/**
 * HeaderNotifications: the bell and its list. Renders what it is handed and reports clicks;
 * fetching, marking read and paging belong to the application.
 */
import type { ReactElement } from "react"
import { BellIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
	DropdownMenuLabel, DropdownMenuLinkItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/base/dropdown-menu"
import { VisuallyHidden } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { resolveLayoutLinkRenderer, type LayoutLinkRenderer } from "../../layout.types"
import { defaultHeaderNotificationsStrings } from "../header.strings"
import type { HeaderNotification, HeaderNotificationsProps } from "../header.types"
import styles from "../header.module.css"

export function HeaderNotifications({
	notifications = [],
	unreadCount = 0,
	onNotificationClick,
	onMarkAllRead,
	onViewAll,
	viewAllHref,
	renderLink,
	align = "end",
	side = "bottom",
	strings,
	className,
	contentClassName,
	renderNotification,
}: HeaderNotificationsProps) {
	const copy = { ...defaultHeaderNotificationsStrings, ...strings }
	const link = resolveLayoutLinkRenderer({ renderLink })
	// Capped at "99+" to keep the badge narrow.
	const badge = unreadCount > 99 ? "99+" : String(unreadCount)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						data-slot="header-notifications-trigger"
						tone="neutral"
						buttonStyle="ghost"
						iconOnly
						/* The count goes in the accessible name; the badge is visual only. */
						aria-label={
							unreadCount > 0 ? `${copy.trigger}, ${copy.unread(unreadCount)}` : copy.trigger
						}
						className={cx("header-notifications--component", styles.tool, className)}
					>
						<BellIcon aria-hidden />
						{unreadCount > 0 && (
							<span aria-hidden className={styles.toolBadge}>
								{badge}
							</span>
						)}
					</Button>
				}
			/>
			<DropdownMenuContent
				data-slot="header-notifications-content"
				align={align}
				side={side}
				className={cx(styles.toolSurface, contentClassName)}
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className={styles.notificationsHead}>
						{copy.heading}
						{unreadCount > 0 && !!onMarkAllRead && (
							<Button type="button" tone="neutral" buttonStyle="ghost" onClick={onMarkAllRead}>
								{copy.markAllRead}
							</Button>
						)}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{notifications.length === 0 ? (
						<div className={styles.notificationsEmpty}>
							{/*
							 * Plain text rather than `Empty`, and this is the exception rather than
							 * the oversight. `Empty` is a content region and carries `role="status"`;
							 * this sits inside a menu popup, whose children ARIA expects to be
							 * menuitems. Putting a live region among them trades a tidy import for
							 * an invalid menu — the one thing the accessibility work in this repo
							 * has spent the most time undoing.
							 */}
							<Text type="secondary">{copy.empty}</Text>
						</div>
					) : (
						<div className={styles.notificationsList}>
							{notifications.map((notification) => (
								<NotificationRow
									key={notification.id}
									notification={notification}
									onClick={onNotificationClick}
									link={link}
									renderNotification={renderNotification}
									unreadLabel={copy.unreadItem}
								/>
							))}
						</div>
					)}
				</DropdownMenuGroup>

				{(!!onViewAll || !!viewAllHref) && (
					<>
						<DropdownMenuSeparator />
						{viewAllHref ? (
							<DropdownMenuLinkItem
								href={viewAllHref}
								render={(props) =>
									link({ ...props, href: viewAllHref, children: props.children }) as ReactElement
								}
							>
								{copy.viewAll}
							</DropdownMenuLinkItem>
						) : (
							<DropdownMenuItem onClick={onViewAll}>{copy.viewAll}</DropdownMenuItem>
						)}
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

function NotificationRow({
	notification,
	onClick,
	link,
	renderNotification,
	unreadLabel,
}: {
	notification: HeaderNotification
	onClick?: (notification: HeaderNotification) => void
	link: LayoutLinkRenderer
	renderNotification?: HeaderNotificationsProps["renderNotification"]
	unreadLabel: string
}) {
	if (renderNotification) return <>{renderNotification(notification)}</>

	const content = (
		<div className={styles.notificationBody}>
			{!!notification.tone && (
				<span aria-hidden data-tone={notification.tone} className={styles.notificationTone} />
			)}
			<div className={styles.notificationText}>
				<Text weight="medium">{notification.title}</Text>
				{!!notification.description && (
					<Text size="xs" type="secondary">
						{notification.description}
					</Text>
				)}
				{!!notification.time && (
					<Text size="xs" type="secondary">
						{notification.time}
					</Text>
				)}
			</div>
			{/* The tint and the dot are both visual; unread has to be said as well. */}
			{notification.read === false && <VisuallyHidden>{unreadLabel}</VisuallyHidden>}
		</div>
	)

	const rowProps = {
		"data-read": String(notification.read !== false),
		className: styles.notificationRow,
	}

	if (notification.href) {
		return (
			<DropdownMenuLinkItem
				href={notification.href}
				onClick={() => onClick?.(notification)}
				render={(props) =>
					link({ ...props, href: notification.href, children: props.children }) as ReactElement
				}
				{...rowProps}
			>
				{content}
			</DropdownMenuLinkItem>
		)
	}

	return (
		<DropdownMenuItem onClick={() => onClick?.(notification)} {...rowProps}>
			{content}
		</DropdownMenuItem>
	)
}
