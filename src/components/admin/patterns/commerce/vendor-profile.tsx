/**
 * VendorProfile: a supplier's identity, earnings and operating metrics. The two views are
 * tabs only when both exist; otherwise the one view renders bare.
 */
import { CheckIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { ContentBlock, IconBadge, MetadataList } from "@/components/base/display"
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/navigation"
import { DisplayLabel, Text } from "@/components/base/typography"
import { formatInitials } from "@/components/primitives"
import { useControllableState } from "@/hooks"
import { cx } from "@/lib/cx"

import { defaultVendorStrings, type VendorStrings } from "./commerce.strings"
import { AmountRow, SummaryPanel } from "./summary-panel"
import styles from "./commerce.module.css"

/** A performance tile. `change` is a comparison, and its tone is stated, not inferred. */
export interface VendorStat {
	id?: string
	label: ReactNode
	value: ReactNode
	change?: ReactNode
	changeTone?: "secondary" | "success" | "warning" | "destructive"
}

/** An operating fact — lead time, fill rate, disputes. */
export interface VendorMetric {
	id?: string
	label: ReactNode
	value: ReactNode
}

export type VendorView = "overview" | "stats"

/* `role` is redeclared: here it is the vendor's role, not the ARIA attribute. */
export interface VendorProfileProps
	extends Omit<ComponentProps<typeof ContentBlock>, "children" | "title" | "role"> {
	name: string
	/** Derived from `name` when omitted. */
	initials?: string
	avatarUrl?: string
	/** Category, market, location — whatever places them. */
	role?: ReactNode
	verified?: boolean
	/** Already formatted, including its currency. */
	earnings?: string
	metrics?: VendorMetric[]
	stats?: VendorStat[]
	/** Controlled. */
	view?: VendorView
	onViewChange?: (view: VendorView) => void
	onMessage?: () => void
	onHire?: () => void
	strings?: Partial<VendorStrings>
}

export function VendorProfile({
	name,
	initials,
	avatarUrl,
	role,
	verified = false,
	earnings,
	metrics,
	stats,
	view,
	onViewChange,
	onMessage,
	onHire,
	strings,
	className,
	...props
}: VendorProfileProps) {
	const copy = { ...defaultVendorStrings, ...strings }

	const hasMetrics = Boolean(metrics?.length)
	const hasStats = Boolean(stats?.length)
	const bothViews = hasMetrics && hasStats

	const [activeView, setActiveView] = useControllableState<VendorView>({
		value: view,
		defaultValue: hasMetrics ? "overview" : "stats",
		onChange: onViewChange,
	})

	const overview = hasMetrics && (
		<MetadataList layout="rows" items={metrics!.map((metric, index) => ({
			id: metric.id ?? String(index),
			label: metric.label,
			value: metric.value,
			render: () => <Text tag="div" weight="medium">{metric.value}</Text>,
		}))} />
	)

	const performance = hasStats && (
		<div className={styles.vendorStats}>
			{stats!.map((stat, index) => (
				<div key={stat.id ?? index} className={styles.vendorStat}>
					<DisplayLabel>{stat.label}</DisplayLabel>
					<Text size="lg" weight="semibold" lineHeight="tight">
						{stat.value}
					</Text>
					{stat.change != null && (
						<Badge tone={stat.changeTone ?? "secondary"}>{stat.change}</Badge>
					)}
				</div>
			))}
		</div>
	)

	return (
		<ContentBlock className={cx("vendor-profile--component", styles.block, className)} {...props}>
			<div className={styles.vendorIdentity}>
				<Avatar size="lg">
					{avatarUrl != null && <AvatarImage src={avatarUrl} alt="" />}
					<AvatarFallback>{initials ?? formatInitials(name)}</AvatarFallback>
				</Avatar>
				<div className={styles.vendorIdentityBody}>
					<span className={styles.vendorName}>
						<Text tag="span" weight="semibold">
							{name}
						</Text>
						{verified && (
							/* The tick is the only statement of verification, so it is labelled. */
							<IconBadge
								icon={CheckIcon}
								tone="success"
								shape="circle"
								solid
								role="img"
								aria-label={copy.verified}
								className={styles.vendorVerified}
							/>
						)}
					</span>
					{role != null && (
						<Text size="xs" type="secondary">
							{role}
						</Text>
					)}
				</div>
			</div>

			{earnings != null && (
				<SummaryPanel>
					<AmountRow label={copy.totalEarnings} amount={earnings} total />
				</SummaryPanel>
			)}

			{bothViews ? (
				<Tabs
					value={activeView}
					onValueChange={(next) => setActiveView(next as VendorView)}
				>
					<TabList>
						<Tab value="overview">{copy.tabOverview}</Tab>
						<Tab value="stats">{copy.tabStats}</Tab>
					</TabList>
					<TabPanel value="overview">{overview}</TabPanel>
					<TabPanel value="stats">{performance}</TabPanel>
				</Tabs>
			) : (
				<>
					{overview}
					{performance}
				</>
			)}

			{(onMessage || onHire) && (
				<div className={cx(styles.blockActions, styles.vendorActions)}>
					{onHire && <Button onClick={onHire}>{copy.hire}</Button>}
					{onMessage && (
						<Button tone="secondary" buttonStyle="outline" onClick={onMessage}>
							{copy.message}
						</Button>
					)}
				</div>
			)}
		</ContentBlock>
	)
}
