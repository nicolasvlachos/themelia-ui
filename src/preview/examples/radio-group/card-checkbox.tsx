import { GlobeIcon, MailIcon, ShieldIcon, SmartphoneIcon } from "lucide-react"
import { useState } from "react"

import { CardCheckboxGroup } from "themelia-ui/base/choice-inputs"

const CHANNELS = [
	{ value: "email", label: "Email", description: "Daily digest.", icon: MailIcon },
	{ value: "push", label: "Push", description: "Mobile and desktop.", icon: SmartphoneIcon },
	{ value: "web", label: "In-app", description: "Only while signed in.", icon: GlobeIcon },
	{ value: "sms", label: "SMS", description: "Critical alerts only.", icon: ShieldIcon, disabled: true },
]

export default function CardCheckbox() {
	const [channels, setChannels] = useState<string[]>(["email"])

	return (
		<CardCheckboxGroup options={CHANNELS} value={channels} onValueChange={setChannels} columns={4} name="channels" />
	)
}
