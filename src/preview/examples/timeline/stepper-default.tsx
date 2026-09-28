import { Stack } from "themelia-ui/base/structure"
import { Stepper } from "themelia-ui/base/timeline"

import { WIZARD } from "./data"

export default function StepperDefault() {
	return (
		<Stack>
			<Stepper steps={WIZARD} />
			<Stepper variant="trail" steps={WIZARD} />
		</Stack>
	)
}
