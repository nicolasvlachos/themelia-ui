/**
 * RolePermissions: a read-only summary of what a role can do, grouped by area. Each
 * permission's state is a glyph and hidden text, not colour alone.
 */
import { CheckIcon, MinusIcon, PencilIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { DisplayLabel, Text } from "@/components/base/typography"
import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { defaultRolePermissionsStrings, type RolePermissionsStrings } from "./admin.strings"
import styles from "./admin.module.css"

export interface Permission {
	label: string
	/** Whether the role holds it. */
	granted: boolean
}

export interface PermissionGroup {
	/** The area these permissions cover — "Billing", "Members". */
	name: string
	permissions: Permission[]
}

export interface RolePermissionsProps extends Omit<ComponentProps<"div">, "children"> {
	roleName: ReactNode
	description?: ReactNode
	memberCount?: number
	groups: PermissionGroup[]
	/** Omit to hide the edit action. */
	onEdit?: () => void
	strings?: Partial<RolePermissionsStrings>
}

export function RolePermissions({
	roleName,
	description,
	memberCount,
	groups,
	onEdit,
	strings,
	className,
	...props
}: RolePermissionsProps) {
	const copy = { ...defaultRolePermissionsStrings, ...strings }

	return (
		<div className={cx("role-permissions--component", styles.role, className)} {...props}>
			<div className={cx("role-permissions--header", styles.roleHeader)}>
				<div className={styles.roleIdentity}>
					<Text weight="medium">{roleName}</Text>
					{description != null && (
						<Text type="secondary">
							{description}
						</Text>
					)}
				</div>
				{/* The count and the edit share the header's other side. `neutral`: a headcount is not a state. */}
				{(memberCount !== undefined || onEdit) && (
					<div className={styles.roleHeaderActions}>
						{memberCount !== undefined && (
							<Badge tone="neutral">{copy.formatMemberCount(memberCount)}</Badge>
						)}
						{onEdit && (
							<Button tone="secondary" buttonStyle="outline" onClick={onEdit}>
								<PencilIcon aria-hidden="true" />
								{copy.editLabel}
							</Button>
						)}
					</div>
				)}
			</div>

			{groups.map((group) => (
				<div key={group.name} className={styles.roleGroup}>
					<DisplayLabel>{group.name}</DisplayLabel>
					<div className={styles.rolePermissions}>
						{group.permissions.map((permission) => (
							<span
								key={permission.label}
								data-granted={permission.granted ? "" : undefined}
								className={styles.rolePermission}
							>
								{/* A tick or a dash: a shape, not only a hue. */}
								{permission.granted ? (
									<CheckIcon className={styles.roleMark} aria-hidden="true" />
								) : (
									<MinusIcon className={styles.roleMark} aria-hidden="true" />
								)}
								<Text tag="span">
									{permission.label}
								</Text>
								{/* The glyph is decorative; the state in text for screen readers. */}
								<VisuallyHidden>
									{permission.granted ? copy.granted : copy.notGranted}
								</VisuallyHidden>
							</span>
						))}
					</div>
				</div>
			))}

		</div>
	)
}
