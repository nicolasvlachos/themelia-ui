import { CodeIcon, DatabaseIcon, GlobeIcon, SearchIcon } from "lucide-react"

import type { AiChatAttachment, AiChatMessageData } from "themelia-ui/features/ai-chat"

export const SAMPLE_CODE = `export function total(lines: Line[]) {
	return lines.reduce((sum, line) => sum + line.amount, 0)
}

// Rounds once, at the end — not per line.
export function formatTotal(lines: Line[]) {
	return new Intl.NumberFormat("en-IE", {
		style: "currency",
		currency: "EUR",
	}).format(total(lines) / 100)
}`

export const SOURCES = [
	{ id: "s1", title: "Rounding money in JavaScript", publisher: "developer.mozilla.org", snippet: "Floating point cannot represent 0.1 exactly, so money is held in the smallest unit." },
	{ id: "s2", title: "Intl.NumberFormat currency options", publisher: "tc39.es" },
	{ id: "s3", title: "Invoice totals — internal note", publisher: "wiki.internal" },
]

export const MESSAGES: AiChatMessageData[] = [
	{
		id: "m1",
		role: "user",
		authorName: "You",
		timestamp: "09:12",
		parts: [{ type: "text", content: "Why is the invoice total off by a cent on some orders?" }],
	},
	{
		id: "m2",
		role: "assistant",
		authorName: "Atlas",
		timestamp: "09:12",
		parts: [
			{
				type: "reasoning",
				content:
					"The totals are summed as floats. 0.1 + 0.2 is 0.30000000000000004, and rounding each line before summing compounds the error.",
				durationSeconds: 4,
			},
			{
				type: "tool",
				name: "search_codebase",
				status: "success",
				icon: SearchIcon,
				durationMs: 820,
				args: '{ "query": "invoice total", "path": "src/billing" }',
				result: "3 matches — invoice.ts:41, totals.ts:12, order.ts:88",
			},
			{
				type: "text",
				content:
					"Each line is rounded to two decimals before the sum, so the error compounds. Hold amounts in cents and round once, at the end.",
			},
			{ type: "code", code: SAMPLE_CODE, language: "TypeScript", filename: "totals.ts", showLineNumbers: true, highlightLines: [2, 8] },
			{ type: "sources", items: SOURCES },
		],
	},
]

export const SUGGESTIONS = [
	{ id: "q1", label: "Show me the failing orders", icon: DatabaseIcon },
	{ id: "q2", label: "Write a migration", icon: CodeIcon },
	{ id: "q3", label: "Explain the rounding rule", icon: GlobeIcon },
]

export const STAGED: AiChatAttachment[] = [
	{ id: "a1", name: "invoice-9921.pdf", meta: "412 KB", kind: "document" },
	{ id: "a2", name: "totals.ts", meta: "2.1 KB", kind: "code" },
	{ id: "a3", name: "upload.csv", meta: "uploading", kind: "document", progress: 0.62 },
]
