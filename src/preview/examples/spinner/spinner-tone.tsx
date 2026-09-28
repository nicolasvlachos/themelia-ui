import { Spinner } from "themelia-ui/base/spinner"
import { Stack } from "themelia-ui/base/structure"

import { Demo } from "./_shared"

export default function SpinnerTone() {
	return (
		<Stack direction="horizontal" align="end">
			<Demo caption='tone="primary" — default'><Spinner /></Demo>
			<Demo caption='tone="neutral"'><Spinner tone="neutral" /></Demo>
			<Demo caption='tone="success"'><Spinner tone="success" /></Demo>
			<Demo caption='tone="destructive"'><Spinner tone="destructive" /></Demo>
		</Stack>
	)
}
