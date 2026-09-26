import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { PopoverMenu } from "themelia-ui/base/popover-menu"
import { Stack } from "themelia-ui/base/structure"

import { OWNERS } from "./_shared"

export default function PopoverMenuStates() {
	const [failed, setFailed] = useState(true)

	return (
		<Stack direction="horizontal" gap="xl" align="center">
			<PopoverMenu
				trigger={
					<Button buttonStyle="outline" tone="neutral">
						Failed load
						<ChevronDownIcon />
					</Button>
				}
				items={failed ? [] : OWNERS}
				error={failed}
				onRetry={() => setFailed(false)}
				onSelect={() => setFailed(true)}
			/>
			<PopoverMenu
				trigger={
					<Button buttonStyle="outline" tone="neutral">
						Two characters
						<ChevronDownIcon />
					</Button>
				}
				items={OWNERS}
				minSearchLength={2}
				onSelect={() => {}}
			/>
		</Stack>
	)
}
