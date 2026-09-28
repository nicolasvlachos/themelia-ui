import { CheckIcon, CloudIcon, HeadphonesIcon, ShieldIcon } from "lucide-react"

import { SubscriptionSummary } from "themelia-ui/blocks/admin/commerce"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

export default function SubscriptionSummaryExample() {
	return (
		<Stack maxWidth="32rem" gap="none">
			<SubscriptionSummary
				planName="Scale"
				price="240.00 EUR"
				cycle="Per month"
				nextBillingDate="01 Sep 2026"
				status="Active"
				perks={[
					{ label: "Unlimited seats", icon: CheckIcon },
					{ label: "99.9% uptime SLA", icon: ShieldIcon },
					{ label: "Priority support", icon: HeadphonesIcon },
					{ label: "500 GB storage", icon: CloudIcon },
				]}
				onManage={() => toast("Manage subscription requested", { description: "Preview callback — connect this action to your application." })}
				onUpgrade={() => toast("Upgrade subscription requested", { description: "Preview callback — connect this action to your application." })}
			/>
		</Stack>
	)
}
