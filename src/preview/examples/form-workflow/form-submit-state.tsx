import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { SubmitStateButton, type SubmitState } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"

export default function FormSubmitState() {
	const [state, setState] = useState<SubmitState>("idle")

	return (
		<Stack direction="horizontal" wrap align="center">
			{(["idle", "submitting", "succeeded"] as SubmitState[]).map((s) => (
				<SubmitStateButton key={s} state={s} />
			))}
			<Button
				tone="neutral"
				appearance="outline"
				onClick={() => {
					setState("submitting")
					setTimeout(() => setState("succeeded"), 1200)
					setTimeout(() => setState("idle"), 2600)
				}}
			>
				Run the cycle
			</Button>
			<SubmitStateButton state={state} />
		</Stack>
	)
}
