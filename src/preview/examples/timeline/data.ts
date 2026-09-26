import type { StepperStep } from "themelia-ui/base/timeline"

export const WIZARD: StepperStep[] = [
	{ id: "account", label: "Account", hint: "Who you are", status: "completed" },
	{ id: "billing", label: "Billing", hint: "How you pay", status: "completed" },
	{ id: "shipping", label: "Shipping", hint: "Where it goes", status: "current" },
	{ id: "review", label: "Review", hint: "Check and place", status: "upcoming" },
]
