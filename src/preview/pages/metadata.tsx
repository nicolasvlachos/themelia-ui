import { BuildingIcon, CalendarIcon, CreditCardIcon, HashIcon, MailIcon } from "lucide-react"

import { MetadataList, type MetadataInlineListItem, type MetadataListItem } from "@/components/base/display"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const FACTS: MetadataListItem[] = [
	{ label: "Reference", value: { kind: "mono", value: "INV-4417" }, icon: HashIcon },
	{ label: "Customer", value: "Northwind Traders", icon: BuildingIcon },
	{ label: "Billing email", value: { kind: "email", value: "billing@northwind.test" }, icon: MailIcon },
	{
		label: "Amount",
		value: { kind: "money", value: 48_200, currency: "USD" },
		icon: CreditCardIcon,
		tooltip: "Excludes tax and any credit applied at settlement.",
	},
	{ label: "Issued", value: { kind: "date", value: "2026-08-14" }, icon: CalendarIcon },
	{ label: "Paid", value: null, description: "Nothing has been received against this invoice." },
	{ label: "Status", value: { kind: "badge", value: "Overdue", badgeTone: "destructive" } },
	{ label: "Portal", value: { kind: "link", href: "https://example.test/inv/4417", value: "View in portal" } },
]

// Typed for the inline layout, which has no second line to put a description on.
const SUMMARY: MetadataInlineListItem[] = [
	{ label: "Created", value: { kind: "date", value: "2026-08-14" } },
	{ label: "By", value: "Alice Mercer" },
	{ label: "Version", value: { kind: "mono", value: "v3.2" } },
]

export function MetadataPage() {
	return (
		<ComponentPage
			title="Metadata list"
			summary="Label/value facts about one thing, in three layouts. A fact is data with a kind, not a node — writing { kind: 'money', value: 48200, currency: 'USD' } hands the amount to the primitive that knows the currency's exponent and the locale's separators. A single pair inside another surface is an InlineStat."
			importPath="@/components/base/display"
			exports={["MetadataList", "MetadataValue"]}
		>
			<Example
				id="metadata-grid"
				title="grid"
				description="Label above value, flowed into columns. The default, and the right one for a detail panel — the eye scans labels down a column and finds values beside them. columns is a ceiling, not a fixed number: four columns on a phone is four columns of one word each, so the list steps down at the widths where each still holds a readable value."
				stacked
				code={`<MetadataList
  columns={3}
  items={[
    { label: "Reference", value: { kind: "mono", value: "INV-4417" } },
    { label: "Amount", value: { kind: "money", value: 48200, currency: "USD" } },
    { label: "Status", value: { kind: "badge", value: "Overdue", badgeTone: "destructive" } },
  ]}
/>`}
			>
				<MetadataList items={FACTS} columns={3} />
			</Example>

			<Example
				id="metadata-rows"
				title="rows"
				description="A two-column definition list — a real <dl>, so a screen reader announces it as one. For a long list of facts whose labels vary in length, which a grid makes ragged. Labels and values share proportional columns, so they stay aligned while wrapping to fit narrow panels."
				stacked
				code={`<MetadataList layout="rows" itemSeparator items={facts} />`}
			>
				<MetadataList layout="rows" itemSeparator items={FACTS} />
			</Example>

			<Example
				id="metadata-inline"
				title="inline"
				description="Label, colon, value, running along one line and wrapping. For the summary strip under a title. The separator between facts is drawn between them and never after the last one — a trailing middle dot reads as a fact that failed to load."
				stacked
				code={`<MetadataList layout="inline" itemSeparator items={summary} />`}
			>
				<Stack gap="lg">
					<MetadataList layout="inline" itemSeparator items={SUMMARY} />
					<MetadataList layout="inline" itemSeparator="—" density="compact" items={SUMMARY} />
				</Stack>
			</Example>

			<Example
				id="metadata-density"
				title="density"
				description="compact tightens the rhythm and drops the value a size, for a side panel or an inspector where the facts support the content rather than being it."
				stacked
				code={`<MetadataList density="compact" columns={2} items={facts} />`}
			>
				<MetadataList density="compact" columns={2} items={FACTS.slice(0, 4)} title="Invoice" titleSeparator />
			</Example>

			<Example id="metadata-kinds" title="The value kinds" stacked>
				<Callout label="Rule">
					A value is a <strong>node</strong> or a <strong>descriptor</strong>. A descriptor
					names the kind — <code>text</code>, <code>mono</code>, <code>email</code>,{" "}
					<code>phone</code>, <code>url</code>, <code>link</code>, <code>date</code>,{" "}
					<code>time</code>, <code>datetime</code>, <code>money</code>,{" "}
					<code>badge</code>, <code>node</code>, <code>empty</code> — and each exposes only
					the fields its primitive consumes, so <code>pattern</code> on a money fact is a
					type error rather than a silently ignored prop.
				</Callout>
				<Text size="sm" type="secondary">
					The temporal kinds take a <code>pattern</code> and nothing else: the locale and
					the default pattern come from the scope&rsquo;s dates config, so one fact does not
					get to disagree with the surface it sits on about how a date is written. Money is
					the same — the symbol, the currency display, and the fraction digits are the
					scope&rsquo;s policy.
				</Text>
			</Example>

			<Example id="metadata-api" title="MetadataList API">
				<PropTable owner="MetadataList"
					rows={[
						{ name: "items", type: "MetadataListItem[]", required: true, description: "label, value, and optionally description, tooltip, icon, emptyLabel, render. Returns null when the list is empty, so a caller can render it unconditionally." },
						{ name: "layout", type: '"grid" | "rows" | "inline"', default: '"grid"', description: "One component because the three carry the same data — a screen that switches between them changes a prop, not its items." },
						{ name: "columns", type: "1 | 2 | 3 | 4 | breakpoints", default: "2", description: "A ceiling for the grid layout. A plain number picks a responsive recipe; an object sets the breakpoints itself." },
						{ name: "density", type: '"default" | "compact"', default: '"default"', description: "Tightens the rhythm and drops the value a size." },
						{ name: "title / titleSeparator", type: "ReactNode / boolean", description: "A label above the facts, and the rule beneath it." },
						{ name: "separator", type: "string", default: '": "', description: "Between a label and its value in the inline layout." },
						{ name: "itemSeparator", type: "boolean | string", default: "false", description: "Between facts. A rule in the rows layout; a character in the inline one." },
						{ name: "emptyLabel", type: "ReactNode", default: "—", description: "For a fact whose value is absent. A dash says 'we looked'; an omitted row does not." },
						{ name: "item.tooltip", api: "MetadataListItem.tooltip", type: "ReactNode", description: "Adds an info trigger beside the label. Its accessible name is built from the label through strings.formatInfoLabel — a function, not a suffix, because word order differs by language." },
						{ name: "item.render", api: "MetadataListItem.render", type: "(item) => ReactNode", description: "Takes over the value entirely, for the one fact none of the kinds cover." },
					]}
				/>
			</Example>

		</ComponentPage>
	)
}
