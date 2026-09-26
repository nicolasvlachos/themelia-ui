import { Stack } from "themelia-ui/base/structure"
import { AiChainOfThought, AiReasoning, AiTask } from "themelia-ui/features/ai-chat"

const PLAN = {
	id: "t0",
	title: "Fix the rounding",
	status: "running" as const,
	rightSlot: "2 of 4",
	children: [
		{ id: "t1", title: "Move amounts to cents", status: "completed" as const },
		{ id: "t2", title: "Round once in formatTotal", status: "completed" as const },
		{ id: "t3", title: "Backfill the existing invoices", status: "running" as const },
		{ id: "t4", title: "Add a regression test", status: "queued" as const },
	],
}

const CHAIN = [
	{ id: "c1", title: "Read the failing orders", description: "Nine of 4,102 are off by one cent.", status: "completed" as const },
	{ id: "c2", title: "Compare the sums", description: "Per-line rounding, then a sum.", status: "completed" as const },
	{ id: "c3", title: "Draft the fix", status: "active" as const },
	{ id: "c4", title: "Write the test", status: "pending" as const },
]

export default function Thinking() {
	return (
		<Stack gap="lg">
			<AiReasoning durationSeconds={4}>
				The totals are summed as floats. 0.1 + 0.2 is 0.30000000000000004, and rounding
				each line before summing compounds the error across a long invoice.
			</AiReasoning>
			<AiReasoning streaming>
				Checking whether the backfill needs to run per tenant…
			</AiReasoning>
			<AiChainOfThought steps={CHAIN} streaming />
			<AiTask task={PLAN} density="expanded" />
		</Stack>
	)
}
