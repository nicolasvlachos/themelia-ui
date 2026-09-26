import { useState } from "react"

import { PopoverMenuPanel } from "themelia-ui/base/popover-menu"

import { OWNERS } from "./_shared"

export default function PopoverMenuPanelExample() {
	const [picked, setPicked] = useState<string[]>(["raj"])

	return (
		<div style={{ maxWidth: "16rem", width: "100%" }}>
			<PopoverMenuPanel
				search={false}
				items={OWNERS.map((item) => ({ ...item, selected: picked.includes(item.value) }))}
				onSelect={(item) =>
					setPicked((current) =>
						current.includes(item.value)
							? current.filter((value) => value !== item.value)
							: [...current, item.value],
					)
				}
			/>
		</div>
	)
}
