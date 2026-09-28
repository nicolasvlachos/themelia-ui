import { useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { PopoverMenu } from "themelia-ui/base/popover-menu"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

import { OWNERS } from "./_shared"

export default function PopoverMenuExample() {
	const [owner, setOwner] = useState("jane")

	return (
		<Stack direction="horizontal" align="center">
			<PopoverMenu
				trigger={
					<Button appearance="outline" tone="neutral">
						Owner
						<ChevronDownIcon />
					</Button>
				}
				items={OWNERS.map((item) => ({ ...item, selected: item.value === owner }))}
				onSelect={(item) => setOwner(item.value)}
				header={
					<Text size="xs" type="secondary">
						Assign to
					</Text>
				}
			/>
			<PopoverMenu
				trigger={
					<Button appearance="outline" tone="neutral">
						No search
						<ChevronDownIcon />
					</Button>
				}
				search={false}
				items={OWNERS.slice(0, 3)}
				onSelect={() => {}}
			/>
			<PopoverMenu
				trigger={
					<Button appearance="outline" tone="neutral">
						Loading
						<ChevronDownIcon />
					</Button>
				}
				loading
				items={[]}
				onSelect={() => {}}
			/>
		</Stack>
	)
}
