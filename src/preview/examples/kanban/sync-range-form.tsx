import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { SyncRangeForm } from "themelia-ui/features/sync"

const WINDOWS = [
	{ value: "6", label: "6 hours", description: "A quick catch-up." },
	{ value: "24", label: "24 hours", description: "The usual overnight run." },
	{ value: "168", label: "7 days", description: "A full week — slower." },
	{ value: "720", label: "30 days", description: "A full reconcile." },
]

const SYNC_OPTIONS = [
	{ value: "invoices", label: "Invoices", description: "Reconcile invoice records only." },
	{ value: "payouts", label: "Payouts", description: "Reconcile settlement records only." },
]

export default function SyncRangeFormExample() {
	const [submitted, setSubmitted] = useState<string | null>(null)

	return (
		<>
			<SyncRangeForm
				formId="sync-demo"
				options={WINDOWS}
				syncOptions={SYNC_OPTIONS}
				onSubmit={(data) => setSubmitted(`${data.hours}h · ${data.options.join(", ") || "everything"}`)}
			/>
			<Stack direction="horizontal" gap="sm" align="center">
				<Button type="submit" form="sync-demo" appearance="outline">
					Run sync
				</Button>
				{!!submitted && <Text size="sm" type="secondary">submitted: {submitted}</Text>}
			</Stack>
		</>
	)
}
