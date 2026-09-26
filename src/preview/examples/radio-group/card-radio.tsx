import { SparklesIcon, UsersIcon, ZapIcon } from "lucide-react"
import { useState } from "react"

import { CardRadioGroup } from "themelia-ui/base/choice-inputs"

const PLANS = [
	{
		value: "free",
		label: "Free",
		description: "One project, community support.",
		icon: SparklesIcon,
		tooltip: "No card required. Upgrade at any time without losing data.",
	},
	{ value: "pro", label: "Pro", description: "Ten projects, email support.", icon: ZapIcon },
	{
		value: "team",
		label: "Team",
		description: "Unlimited projects, SSO, audit log.",
		icon: UsersIcon,
		tooltip: "Billed per seat. SSO requires a verified domain.",
	},
]

export default function CardRadio() {
	const [plan, setPlan] = useState("pro")

	return (
		<CardRadioGroup options={PLANS} value={plan} onValueChange={setPlan} columns={3} />
	)
}
