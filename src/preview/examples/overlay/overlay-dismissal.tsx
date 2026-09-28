import { Stack } from "themelia-ui/base/structure"

import { Demo } from "./_shared"

export default function OverlayDismissal() {
	return (
		<Stack direction="horizontal" gap="sm" wrap>
			<Demo label="no backdrop dismiss" dismissal={{ backdrop: false }} />
			<Demo label="no escape" dismissal={{ escape: false }} />
		</Stack>
	)
}
