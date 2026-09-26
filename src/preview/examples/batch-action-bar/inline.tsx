import { BatchActionBar } from "themelia-ui/base/batch-action-bar"
import { Button } from "themelia-ui/base/buttons"

export default function Inline() {
	return (
		<BatchActionBar
			placement="inline"
			selectedCount={12}
			onClear={() => undefined}
			strings={{ label: "Inline batch actions example" }}
		>
			<Button type="button" tone="neutral" buttonStyle="ghost">
				Assign
			</Button>
		</BatchActionBar>
	)
}
