import { Spinner } from "themelia-ui/base/spinner"
import { Stack } from "themelia-ui/base/structure"

import { Demo } from "./_shared"

export default function SpinnerSize() {
	return (
		<Stack direction="horizontal" align="end">
			<Demo caption='size="sm"'><Spinner size="sm" /></Demo>
			<Demo caption="default"><Spinner /></Demo>
		</Stack>
	)
}
