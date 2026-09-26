import { Spinner } from "themelia-ui/base/spinner"
import { Stack } from "themelia-ui/base/structure"

import { Demo } from "./_shared"

export default function SpinnerSize() {
	return (
		<Stack direction="horizontal" gap="2xl" align="end">
			<Demo caption='size="sm"'><Spinner size="sm" /></Demo>
			<Demo caption='size="md" — default'><Spinner size="md" /></Demo>
			<Demo caption='size="lg"'><Spinner size="lg" /></Demo>
		</Stack>
	)
}
