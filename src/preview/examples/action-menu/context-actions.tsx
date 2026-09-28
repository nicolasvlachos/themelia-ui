import { ArchiveIcon, SendIcon, PencilIcon, TrashIcon } from "lucide-react"

import {
	ActionButtons, resolveContextActions, type ContextAction,
} from "themelia-ui/base/action-menu"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

import { QUIET } from "./data"

interface Invoice { number: string; paid: boolean; locked: boolean }

/* Declared once against the record type; predicates run per record and handlers receive it. */
const INVOICE_ACTIONS: ContextAction<Invoice>[] = [
	{ id: "send", label: "Send reminder", icon: SendIcon, visible: (invoice) => !invoice.paid, placement: "inline" },
	{ id: "edit", label: "Edit", icon: PencilIcon, disabled: (invoice) => invoice.locked, ...QUIET },
	{ id: "archive", label: "Archive", icon: ArchiveIcon, ...QUIET },
	{ id: "delete", label: "Delete", icon: TrashIcon, tone: "destructive", placement: "menu" },
]

const INVOICES: Invoice[] = [
	{ number: "INV-1042", paid: false, locked: false },
	{ number: "INV-1038", paid: true, locked: true },
]

export default function ContextActions() {
	return (
		<Stack style={{ width: "100%" }}>
			{INVOICES.map((invoice) => (
				<Stack key={invoice.number} gap="sm">
					<Text size="xs" type="secondary">
						{invoice.number} · {invoice.paid ? "paid, locked" : "unpaid"}
					</Text>
					<ActionButtons actions={resolveContextActions(INVOICE_ACTIONS, invoice)} max={2} />
				</Stack>
			))}
		</Stack>
	)
}
