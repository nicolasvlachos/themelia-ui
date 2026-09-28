import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

export default function ToastStatuses() {
	return (
		<Stack direction="horizontal" gap="sm" wrap>
			<Button appearance="outline" tone="neutral" onClick={() => toast("Draft saved")}>
				Neutral
			</Button>
			<Button
				appearance="outline"
				tone="neutral"
				onClick={() => toast.success("Invoice sent", { description: "Northwind Traders · $1,299.50" })}
			>
				Success
			</Button>
			<Button appearance="outline" tone="neutral" onClick={() => toast.info("Two seats left on this plan")}>
				Info
			</Button>
			<Button appearance="outline" tone="neutral" onClick={() => toast.warning("Your card expires next month")}>
				Warning
			</Button>
			<Button
				appearance="outline"
				tone="neutral"
				onClick={() => toast.error("Could not reach the server", { description: "Retrying in 30 seconds." })}
			>
				Error
			</Button>
		</Stack>
	)
}
