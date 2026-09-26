import { Spinner } from "themelia-ui/base/spinner"
import { Stack } from "themelia-ui/base/structure"

import { Demo } from "./_shared"

export default function SpinnerExample() {
	return (
		<Stack direction="horizontal" gap="2xl" align="end">
			<Demo caption='label="Saving…"'>
				<Spinner label="Saving…" />
			</Demo>
			<Demo caption="no label — hidden from assistive technology">
				<Spinner />
			</Demo>
		</Stack>
	)
}
