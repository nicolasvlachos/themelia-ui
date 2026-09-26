import {
	ArchiveIcon, ChevronDownIcon, DownloadIcon, LogOutIcon, SendIcon,
	PencilIcon, SettingsIcon, ShareIcon, TrashIcon,
} from "lucide-react"
import { useState } from "react"

import {
	ActionButtons, ActionMenu, resolveContextActions,
	type ActionDefinition, type ContextAction,
} from "@/components/base/action-menu"
import { Button } from "@/components/base/buttons"
import { Card } from "@/components/base/cards"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

/* One primary and the rest quiet, as a real toolbar looks. */
const QUIET = { buttonStyle: "outline", tone: "neutral" } as const

const TOOLBAR: ActionDefinition[] = [
	{ label: "Edit", icon: PencilIcon, onClick: () => {} },
	{ label: "Duplicate", icon: ShareIcon, ...QUIET, onClick: () => {} },
	{ label: "Export", icon: DownloadIcon, ...QUIET, onClick: () => {} },
	{ label: "Archive", icon: ArchiveIcon, ...QUIET, onClick: () => {} },
	{ label: "Delete", icon: TrashIcon, buttonStyle: "outline", tone: "destructive", onClick: () => {} },
]

/* Delete declared first on purpose: the example shows it moving last. */
const DESTRUCTIVE_FIRST: ActionDefinition[] = [
	{ label: "Delete", icon: TrashIcon, onClick: () => {}, tone: "destructive" },
	{ label: "Edit", icon: PencilIcon, onClick: () => {} },
	{ label: "Duplicate", icon: ShareIcon, onClick: () => {} },
]

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

export function ActionMenuPage() {
	const [showArchived, setShowArchived] = useState(false)

	const actions: ActionDefinition[] = [
		{ label: "Edit", icon: PencilIcon, onClick: () => {} },
		{ label: "Duplicate", icon: ShareIcon, onClick: () => {} },
		{
			group: "View",
			label: "Show archived",
			type: "checkbox",
			checked: showArchived,
			onCheckedChange: setShowArchived,
		},
		{ label: "Export as CSV", icon: DownloadIcon, onClick: () => {} },
		{ label: "Archive", icon: ArchiveIcon, onClick: () => {}, group: true },
		{ label: "Delete", icon: TrashIcon, onClick: () => {}, tone: "destructive" },
	]

	return (
		<ComponentPage
			title="Action menu & buttons"
			summary="Commands as data. One ActionDefinition array collapses behind a trigger (ActionMenu), spreads out as buttons (ActionButtons), or both at once — the first few as buttons and the rest in an overflow menu — so a toolbar and its overflow can never offer different things."
			importPath="@/components/base/action-menu"
			exports={[
				"ActionMenu", "ActionButtons", "resolveContextActions", "splitActions",
				"type ActionDefinition", "type ContextAction",
			]}
		>
			<Example
				id="action-menu"
				title="ActionMenu"
				description="Definition-driven rather than composed. Grouping, the destructive ordering, the checkbox rows, and the link handling are precisely the parts everyone gets subtly different when assembling menu items by hand."
				stacked
				code={`<ActionMenu
  actions={[
    { label: "Edit", icon: PencilIcon, onClick: … },
    { label: "Archive", icon: ArchiveIcon, onClick: …, group: true },
    { label: "Delete", icon: TrashIcon, onClick: …, tone: "destructive" },
  ]}
/>`}
			>
				<Stack direction="horizontal" gap="xl" align="center">
					<ActionMenu actions={actions} />
					<ActionMenu actions={actions} label="Actions" icon={SettingsIcon} />
					<ActionMenu
						actions={actions}
						renderTrigger={
							<Button buttonStyle="outline" tone="neutral">
								Custom trigger
								<ChevronDownIcon />
							</Button>
						}
					/>
				</Stack>
			</Example>

			<Example
				id="action-menu-order"
				title="Destructive last"
				description="A destructive entry moves to the end and gets a rule above it, whatever order it was declared in. Pass preserveOrder when the caller genuinely knows better."
				stacked
				code={`const declared = [
  { label: "Delete", tone: "destructive", onClick: … },
  { label: "Edit", onClick: … },
  { label: "Duplicate", onClick: … },
]

<ActionMenu actions={declared} />
<ActionMenu actions={declared} preserveOrder />`}
			>
				{/* The same delete-first array: default ordering on the left, `preserveOrder` on the right. */}
				<Stack direction="horizontal" gap="lg" align="center">
					<ActionMenu
						actions={DESTRUCTIVE_FIRST}
						label="Sorted"
						buttonProps={{ tone: "neutral", buttonStyle: "outline" }}
					/>
					<ActionMenu
						actions={DESTRUCTIVE_FIRST}
						preserveOrder
						label="preserveOrder"
						buttonProps={{ tone: "neutral", buttonStyle: "outline" }}
					/>
				</Stack>

				<Callout label="Rule">
					One <code>ActionMenu</code> for every overflow in the app — page headers, card
					headers, table rows. A surface-specific copy is how two menus in the same product
					end up ordering their delete differently.
				</Callout>
			</Example>

			<Example
				id="action-menu-width"
				title="Width and row slots"
				description="A menu sizes to its widest row, capped at a reading measure rather than the viewport — so one long label cannot drag every row out with it. width pins it, maxWidth moves the cap, and width=“trigger” matches the trigger for a menu that reads as the field's own list."
				stacked
				code={`<ActionMenu actions={actions} maxWidth="18rem" />
<ActionMenu actions={actions} width={280} />
<ActionMenu actions={actions} width="trigger" label="Matches trigger" />

// Rows take slots, so the label is the only part that gives way:
{ label: "Duplicate", icon: CopyIcon, shortcut: "⌘D" }
{ label: "Export", description: "CSV, one row per invoice" }`}
			>
				<Stack direction="horizontal" gap="xl" align="center" wrap>
					<ActionMenu
						label="Shortcuts"
						actions={[
							{ label: "Edit", icon: PencilIcon, shortcut: "⌘E", onClick: () => {} },
							{ label: "Duplicate", icon: ShareIcon, shortcut: "⌘D", onClick: () => {} },
							{ label: "Export as CSV", icon: DownloadIcon, shortcut: "⌘⇧E", onClick: () => {} },
							{ label: "Delete", icon: TrashIcon, shortcut: "⌫", onClick: () => {}, tone: "destructive" },
						]}
					/>
					<ActionMenu
						label="Descriptions"
						actions={[
							{ label: "Edit", icon: PencilIcon, description: "Change the name and the billing address.", onClick: () => {} },
							{ label: "Export", icon: DownloadIcon, description: "CSV, one row per invoice.", onClick: () => {} },
							{ label: "Delete", icon: TrashIcon, description: "Permanent. Invoices are kept for seven years.", onClick: () => {}, tone: "destructive" },
						]}
						maxWidth="20rem"
					/>
					<ActionMenu
						label="Fixed 280px"
						width={280}
						actions={[
							{ label: "A short one", onClick: () => {} },
							{ label: "A considerably longer label that would otherwise set the width", onClick: () => {} },
						]}
					/>
					<ActionMenu
						renderTrigger={
							<Button buttonStyle="outline" tone="neutral" style={{ width: "16rem" }}>
								Matches the trigger
								<ChevronDownIcon />
							</Button>
						}
						width="trigger"
						actions={[
							{ label: "Edit", icon: PencilIcon, onClick: () => {} },
							{ label: "Archive", icon: ArchiveIcon, onClick: () => {} },
						]}
					/>
				</Stack>
			</Example>

			<Example
				id="menus-in-context"
				title="In a card header"
				description="The card's actions prop takes the same definitions and renders them through the same menu."
				stacked
			>
				<Card
					surface="bordered"
					title="Northwind Traders"
					description="Customer since 2019"
					actions={[
						{ label: "Edit", icon: PencilIcon, onClick: () => {} },
						{ label: "Sign out of all sessions", icon: LogOutIcon, onClick: () => {}, group: true },
						{ label: "Delete customer", icon: TrashIcon, onClick: () => {}, tone: "destructive" },
					]}
					style={{ maxWidth: "26rem" }}
				>
					<Text size="sm" type="secondary">
						The header menu is an ActionMenu — the card passes its actions straight through.
					</Text>
				</Card>
			</Example>

			<Example
				id="action-buttons"
				title="The same definitions, as buttons"
				description="ActionButtons lays the array out as visible buttons. max is where the two presentations meet: the first few render as buttons and the rest collapse into an ActionMenu built from the same array."
				stacked
				code={`<ActionButtons actions={toolbar} max={2} />`}
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					{[5, 3, 1].map((max) => (
						<Stack key={max} gap="xs">
							<Text size="xs" type="secondary">max={max}</Text>
							<ActionButtons actions={TOOLBAR} max={max} />
						</Stack>
					))}
				</Stack>
			</Example>

			<Example
				id="context-actions"
				title="Actions that depend on a record"
				description="A ContextAction is an ActionDefinition whose handler and predicates take the record it acts on. resolveContextActions binds one set to one record — hidden entries dropped, disabled ones worked out, handlers bound — and placement pins an entry inline or sends it to the overflow menu whatever max says. Tables, kanban cards, activity entries and page headers all take this shape."
				stacked
				code={`const actions: ContextAction<Invoice>[] = [
  { id: "send", label: "Send reminder", visible: (i) => !i.paid, placement: "inline" },
  { id: "edit", label: "Edit", disabled: (i) => i.locked },
  { id: "delete", label: "Delete", tone: "destructive", placement: "menu" },
]

<ActionButtons actions={resolveContextActions(actions, invoice)} max={2} />`}
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					{INVOICES.map((invoice) => (
						<Stack key={invoice.number} gap="xs">
							<Text size="xs" type="secondary">
								{invoice.number} · {invoice.paid ? "paid, locked" : "unpaid"}
							</Text>
							<ActionButtons actions={resolveContextActions(INVOICE_ACTIONS, invoice)} max={2} />
						</Stack>
					))}
				</Stack>
			</Example>

			<Example id="action-menu-api" title="API">
				<PropTable owner="ActionMenu"
					rows={[
						{ name: "actions", type: "ActionDefinition[]", description: "The commands. visible: false omits one entirely." },
						{ name: "ActionDefinition.group", type: "string | true", description: "Starts a group, ruling off above. A string also captions it; true rules off with no heading." },
						{ name: "ActionDefinition.tone", type: "ButtonTone", description: "destructive also moves the entry last and separates it." },
						{ name: "ActionDefinition.type", type: '"item" | "checkbox"', default: '"item"', description: "A checkbox row is driven by checked / onCheckedChange." },
						{ name: "ActionDefinition.href", type: "string", description: "Renders as a link. A native anchor unless renderLink is given." },
						{ name: "ActionDefinition.shortcut / description / trailing", api: ["ActionDefinition.shortcut", "ActionDefinition.description", "ActionDefinition.trailing"], type: "ReactNode", description: "Row slots. The label is the only part that gives way, so a long name truncates instead of pushing the shortcut off." },
						{ name: "renderLink", type: "(props) => ReactElement", description: "Routes href actions through the app's router. Return an element, not a spread function." },
						{ name: "renderTrigger", type: "Base UI render prop", description: "Replaces the trigger entirely, for a menu hanging off something that is not a button." },
						{ name: "width", type: 'string | number | "trigger"', description: 'Pins the surface width. "trigger" matches the trigger, for a menu that reads as the field\'s own list.' },
						{ name: "maxWidth", type: "string | number", default: "20rem", description: "Ceiling for the content-sized default — a reading measure, not the viewport." },
						{ name: "preserveOrder", type: "boolean", default: "false", description: "Keeps the declared order instead of moving destructive entries last." },
						{ name: "strings", type: "Partial<ActionMenuStrings>", description: "Overrides this menu's own copy — `trigger` names an icon-only trigger, which without a visible label has no other name." },
						{ name: "labelVisibility", type: '"always" | "sm-up"', description: "Hides the trigger's text below sm, leaving the glyph — for a toolbar that has to survive a phone." },
						{ name: "closeOnSelect", type: "boolean", default: "true", description: "Off for a menu of checkbox rows, where the reader is setting several things at once." },
						{ name: "side / align", type: '"top" | "right" | "bottom" | "left" / "start" | "center" | "end"', description: "Where the surface opens relative to the trigger." },
						{ name: "minWidth / contentClassName", type: "string | number / string", description: "A floor under the content-sized width, and the escape hatch for the surface itself." },
						{ name: "ActionButtons actions", api: "ActionButtons.actions", type: "ActionDefinition[]", description: "The same definitions ActionMenu takes — that is the point of the shape. tone and buttonStyle carry through to each button." },
						{ name: "ActionButtons max / strings", type: "number / Partial<ActionMenuStrings>", description: "How many render as buttons before the rest collapse into a menu built from the same array. `strings.overflow` names that menu." },
					]}
				/>
				<PropTable owner="ContextAction"
					rows={[
						{ name: "onClick", type: "(context: T) => void", description: "Receives the record the set was resolved against." },
						{ name: "visible", type: "boolean | (context: T) => boolean", default: "true", description: "False, or a predicate returning false, drops the entry for that record." },
						{ name: "disabled", type: "boolean | (context: T) => boolean", default: "false", description: "Worked out per record, so a locked row shows the action greyed rather than missing." },
						{ name: "placement", type: '"auto" | "inline" | "menu"', default: '"auto"', description: "inline stays a button whatever max is; menu always overflows; auto fills the buttons in order up to max." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
