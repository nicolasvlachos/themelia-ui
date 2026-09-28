import { SearchIcon } from "lucide-react"

import { Stack } from "themelia-ui/base/structure"
import { AiToolCall } from "themelia-ui/features/ai-chat"

export default function Tools() {
	return (
		<Stack gap="sm">
			<AiToolCall name="read_file" status="pending" />
			<AiToolCall
				name="search_codebase"
				status="running"
				icon={SearchIcon}
				args={'{ "query": "invoice total" }'}
			/>
			<AiToolCall
				name="search_codebase"
				status="success"
				icon={SearchIcon}
				durationMs={820}
				defaultExpanded
				args={'{\n  "query": "invoice total",\n  "path": "src/billing"\n}'}
				result={"3 matches\n  invoice.ts:41\n  totals.ts:12\n  order.ts:88"}
			/>
			<AiToolCall
				name="run_migration"
				status="error"
				durationMs={14_200}
				defaultExpanded
				args={'{ "name": "amounts_to_cents" }'}
				error={"SQLSTATE 23505: duplicate key value violates unique constraint"}
			/>
		</Stack>
	)
}
