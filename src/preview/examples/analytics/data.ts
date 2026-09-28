import { CreditCardIcon, PackageIcon, TrendingUpIcon, UsersIcon } from "lucide-react"

import type { MetricData } from "themelia-ui/blocks/analytics"

export const REVENUE: MetricData = {
	id: "revenue",
	label: "Revenue",
	value: 48_200,
	valueType: "currency",
	currency: "EUR",
	change: { value: "12.4%", direction: "up" },
	sparkline: [18, 22, 19, 27, 24, 31, 29, 38],
	icon: CreditCardIcon,
	subtitle: "Net of refunds",
}

export const CHURN: MetricData = {
	id: "churn",
	label: "Churn",
	value: 0.038,
	valueType: "percentage",
	/* Down is the GOOD direction here, so the trend is stated rather than inferred. */
	change: { value: "0.6pp", direction: "down" },
	trend: "positive",
	sparkline: [9, 8, 8, 6, 7, 5, 5, 4],
	icon: UsersIcon,
}

export const ORDERS: MetricData = {
	id: "orders",
	label: "Orders",
	value: 1_284,
	valueType: "number",
	change: { value: "3.1%", direction: "down" },
	sparkline: [40, 38, 41, 36, 34, 35, 31, 30],
	icon: PackageIcon,
}

export const FULFILMENT: MetricData = {
	id: "fulfilment",
	label: "Median fulfilment",
	value: 5_400,
	valueType: "duration",
	change: { value: "0", direction: "neutral" },
	icon: TrendingUpIcon,
	footer: "Across all warehouses",
}

export const METRICS = [REVENUE, CHURN, ORDERS, FULFILMENT]

export const SERIES = [
	{ month: "Mar", sessions: 3_100 },
	{ month: "Apr", sessions: 3_800 },
	{ month: "May", sessions: 3_400 },
	{ month: "Jun", sessions: 4_600 },
	{ month: "Jul", sessions: 4_200 },
	{ month: "Aug", sessions: 5_300 },
]
