import { useState } from "react"
import { SparklesIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { AiAgent, AiConfirmation } from "themelia-ui/features/ai-chat"

export default function Approval() {
	const [approval, setApproval] = useState<"pending" | "approved" | "rejected">("pending")

	return (
		<Stack gap="lg">
			<AiConfirmation
				title="Run the backfill on 4,102 invoices"
				description="Rewrites every stored amount into cents. There is no undo."
				tone="destructive"
				status={approval}
				onApprove={() => setApproval("approved")}
				onReject={() => setApproval("rejected")}
			/>
			{approval !== "pending" && (
				<Stack direction="horizontal" gap="md">
					<Button type="button" tone="neutral" buttonStyle="outline" onClick={() => setApproval("pending")}>
						Ask again
					</Button>
				</Stack>
			)}
			<AiAgent name="Atlas" subtitle="model-large" status="working" variant="card" />
			<AiAgent name="Scribe" icon={SparklesIcon} tone="success" status="done" />
		</Stack>
	)
}
