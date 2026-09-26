import { useState } from "react"

import { BreadcrumbProgress } from "themelia-ui/layout/navigation"

const WIZARD = [
	{ id: "account", label: "Account", hint: "Who you are" },
	{ id: "workspace", label: "Workspace", hint: "Name and region" },
	{ id: "billing", label: "Billing", hint: "Plan and payment" },
	{ id: "review", label: "Review", hint: "Check and confirm" },
]

export default function BreadcrumbProgressExample() {
	const [current, setCurrent] = useState(2)

	return (
		<BreadcrumbProgress steps={WIZARD} currentIndex={current} onStepClick={(_id, index) => setCurrent(index)} />
	)
}
