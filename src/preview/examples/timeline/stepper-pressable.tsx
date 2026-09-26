import { useState } from "react"

import { Stepper } from "themelia-ui/base/timeline"

import { WIZARD } from "./data"

/* The caller owns the position; a press on a finished step makes it current again. */
function PressableTrail() {
	const [current, setCurrent] = useState(2)
	const steps = WIZARD.map((step, index) => ({
		...step,
		status: index < current ? ("completed" as const) : index === current ? ("current" as const) : ("upcoming" as const),
	}))
	return <Stepper variant="trail" steps={steps} onStepClick={(_, index) => setCurrent(index)} />
}

export default function StepperPressable() {
	return (
		<PressableTrail />
	)
}
