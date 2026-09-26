import { CheckIcon, CreditCardIcon, PackageIcon, TruckIcon } from "lucide-react"

import { Timeline, type TimelineItem } from "themelia-ui/base/timeline"

const ORDER: TimelineItem[] = [
	{
		id: "placed",
		title: "Order placed",
		description: "Eight items, paid in full.",
		timestamp: "14 Aug, 09:12",
		icon: CheckIcon,
		status: "completed",
	},
	{
		id: "paid",
		title: "Payment captured",
		description: "Visa ending 4417.",
		timestamp: "14 Aug, 09:12",
		icon: CreditCardIcon,
		status: "completed",
	},
	{
		id: "packed",
		title: "Packed",
		timestamp: "15 Aug, 11:40",
		icon: PackageIcon,
		status: "completed",
	},
	{
		id: "transit",
		title: "In transit",
		description: "Left the Rotterdam depot.",
		timestamp: "16 Aug, 06:02",
		icon: TruckIcon,
		status: "current",
	},
	{
		id: "delivered",
		title: "Delivered",
		timestamp: "Expected 18 Aug",
		status: "pending",
	},
]

export default function TimelineDefault() {
	return (
		<Timeline items={ORDER} />
	)
}
