import { useState } from "react"
import { BuildingIcon, DownloadIcon, PlusIcon } from "lucide-react"

import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { MetadataList, type MetadataListItem } from "@/components/base/display"
import { StackedCardsIllustration } from "@/components/base/feedback"
import { Stack } from "@/components/base/structure"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/base/table"
import { Input } from "@/components/base/text-inputs"
import { Text } from "@/components/base/typography"
import {
	ResourceActionBar, ResourceDetailsSection, ResourceEmptyState, ResourceHeader,
	ResourceIndexShell, ResourceShowShell, TabbedResourceShell,
} from "@/components/features"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

type ShellState = "ready" | "loading" | "empty" | "error"

const INVOICES = [
	{ ref: "INV-4417", customer: "Northwind Traders", amount: "$48,200.00", status: "Overdue" },
	{ ref: "INV-4418", customer: "Contoso Ltd", amount: "$12,400.00", status: "Paid" },
	{ ref: "INV-4419", customer: "Fabrikam Inc", amount: "$1,950.00", status: "Draft" },
]

const DETAILS: MetadataListItem[] = [
	{ label: "Reference", value: { kind: "mono", value: "INV-4417" } },
	{ label: "Amount", value: { kind: "money", value: 48_200, currency: "USD" } },
	{ label: "Issued", value: { kind: "date", value: "2026-08-14" } },
	{ label: "Due", value: { kind: "date", value: "2026-08-28" } },
	{ label: "Billing email", value: { kind: "email", value: "billing@northwind.test" } },
	{ label: "Paid", value: null },
]

const TABS = [
	{ id: "overview", label: "Overview" },
	{ id: "lines", label: "Line items", badge: <Badge tone="neutral">7</Badge> },
	{ id: "payments", label: "Payments" },
	{ id: "history", label: "History" },
]

function InvoiceTable() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Reference</TableHead>
					<TableHead>Customer</TableHead>
					<TableHead>Amount</TableHead>
					<TableHead>Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{INVOICES.map((invoice) => (
					<TableRow key={invoice.ref}>
						<TableCell>{invoice.ref}</TableCell>
						<TableCell>{invoice.customer}</TableCell>
						<TableCell>{invoice.amount}</TableCell>
						<TableCell>
							<Badge tone={invoice.status === "Paid" ? "success" : invoice.status === "Overdue" ? "destructive" : "neutral"}>
								{invoice.status}
							</Badge>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

export function ResourcePage() {
	const [state, setState] = useState<ShellState>("ready")
	const [tab, setTab] = useState("overview")

	return (
		<ComponentPage
			title="Resource shells"
			summary="The skeleton every list and detail screen shares: a header identifying the thing, a toolbar, a body, sometimes an aside, and the three states that replace the body while it waits, fails, or comes back empty. The shells own that; the table, the form, and the fetch stay the screen's."
			importPath="@/components/features/resource"
			exports={["ResourceIndexShell", "ResourceShowShell", "TabbedResourceShell", "ResourceDetailsSection",
				"ResourceHeader", "ResourceActionBar", "ResourceEmptyState",
			]}
		>
			<Example
				id="resource-index"
				title="ResourceIndexShell"
				description="A list screen. loading, error, and empty REPLACE the body rather than sitting beside it — a screen showing a spinner above a stale table is giving two answers to the same question, and the reader has no way to tell which one is current."
				stacked
				code={`<ResourceIndexShell
  title="Invoices"
  description="Everything billed on this account."
  actions={<Button>New invoice</Button>}
  loading={isLoading}
  error={error}
  empty={rows.length === 0}
  onRetry={refetch}
  toolbar={<ResourceActionBar leading={<SearchInput />} />}
>
  <InvoiceTable rows={rows} />
</ResourceIndexShell>`}
			>
				<Stack direction="horizontal" gap="sm" wrap>
					{(["ready", "loading", "empty", "error"] as const).map((option) => (
						<Button
							key={option}
							tone={state === option ? "primary" : "neutral"}
							buttonStyle={state === option ? "solid" : "outline"}
							onClick={() => setState(option)}
						>
							{option}
						</Button>
					))}
				</Stack>

				<ResourceIndexShell
					title="Invoices"
					description="Everything billed on this account."
					actions={
						<>
							<Button tone="neutral" buttonStyle="outline">
								<DownloadIcon />
								Export
							</Button>
							<Button>
								<PlusIcon />
								New invoice
							</Button>
						</>
					}
					toolbar={
						<ResourceActionBar
							leading={<Input placeholder="Search invoices…" />}
							trailing={<Text size="sm" type="secondary">3 of 3</Text>}
						/>
					}
					loading={state === "loading"}
					empty={state === "empty"}
					error={state === "error" ? new Error("The billing service returned 502.") : undefined}
					onRetry={() => setState("ready")}
					strings={{
						emptyTitle: "No invoices yet",
						emptyDescription: "Invoices appear here once a customer is billed.",
						errorTitle: "Invoices unavailable",
					}}
				>
					<InvoiceTable />
				</ResourceIndexShell>
			</Example>

			<Example
				id="resource-show"
				title="ResourceShowShell"
				description="A detail screen, with an aside. The aside drops below the body on a CONTAINER query, not a media query — the same shell sits inside a full-width page and inside a split pane, and only the container knows which."
				stacked
				code={`<ResourceShowShell
  title="INV-4417"
  slots={{ aside: <PaymentPanel /> }}
>
  <ResourceDetailsSection title="Details" metadata={facts} />
</ResourceShowShell>`}
			>
				<ResourceShowShell
					slots={{
						header: (
							<ResourceHeader
								eyebrow="Northwind Traders"
								title="INV-4417"
								description="Issued 14 August, due 28 August."
								icon={BuildingIcon}
								badges={<Badge tone="destructive">Overdue</Badge>}
								metadata={<MetadataList layout="inline" itemSeparator items={[
									{ label: "Amount", value: { kind: "money", value: 48_200, currency: "USD" } },
									{ label: "Terms", value: "Net 14" },
								]} />}
								actions={<Button tone="neutral" buttonStyle="outline">Send reminder</Button>}
							/>
						),
						aside: (
							<ResourceDetailsSection
								title="Payment"
								metadata={[
									{ label: "Method", value: "Bank transfer" },
									{ label: "Received", value: null },
								]}
								metadataColumns={1}
								metadataDense
							/>
						),
					}}
				>
					<ResourceDetailsSection
						title="Details"
						description="Everything recorded against this invoice."
						metadata={DETAILS}
						metadataColumns={2}
						help="Amounts exclude tax and any credit applied at settlement."
					/>
				</ResourceShowShell>
			</Example>

			<Example
				id="tabbed-resource"
				title="TabbedResourceShell"
				description="The show shell with a tab row in its toolbar. The tabs scroll rather than wrap: wrapping onto a second line changes the page's height as the reader switches, which shifts everything below them."
				stacked
				code={`<TabbedResourceShell
  tabs={tabs}
  activeTab={tab}
  onTabChange={setTab}
  title="INV-4417"
>
  {panelFor(tab)}
</TabbedResourceShell>`}
			>
				<TabbedResourceShell
					title="INV-4417"
					description="Northwind Traders · Net 14"
					tabs={TABS}
					activeTab={tab}
					onTabChange={setTab}
					strings={{ tabsLabel: "Invoice sections" }}
				>
					<ResourceDetailsSection
						title={TABS.find((item) => item.id === tab)?.label}
						metadata={tab === "overview" ? DETAILS : undefined}
						body={tab === "overview" ? undefined : <Text type="secondary">Nothing recorded on this tab yet.</Text>}
					/>
				</TabbedResourceShell>
			</Example>

			<Example
				id="resource-empty"
				title="ResourceEmptyState"
				description="The shell's empty state on its own, for a screen supplying its own through slots.empty. It is `Empty` with the resource hook applied, so an illustration, a footer, and the dashed affordance all work exactly as they do there."
				stacked
				code={`slots={{ empty: (
  <ResourceEmptyState
    mediaVariant="illustration"
    media={<StackedCardsIllustration />}
    title="No invoices yet"
    action={<Button>New invoice</Button>}
    border
  />
) }}`}
			>
				<ResourceEmptyState
					mediaVariant="illustration"
					media={<StackedCardsIllustration />}
					title="No invoices yet"
					description="Invoices appear here once a customer is billed."
					action={<Button><PlusIcon />New invoice</Button>}
					border
				/>
			</Example>

			<Example id="resource-rule" title="What `error` accepts" stacked>
				<Callout label="Rule">
					An <code>Error</code>, a string, or a number is a <strong>message</strong> and
					becomes the generated error state&rsquo;s description. Any other truthy node is
					rendered <strong>instead of</strong> the generated state — which is how a screen
					supplies a 404 panel that is not really an error at all. Both replace the body;
					neither sits beside it.
				</Callout>
			</Example>

			<Example id="resource-api" title="API">
				<PropTable owner="TabbedResourceShell"
					rows={[
						{ name: "title / description / actions", type: "ReactNode", description: "Feed the generated header. Omit them and pass slots.header when the header is not a title and a description." },
						{ name: "loading / empty", type: "boolean", description: "Replace the body. `empty` is a boolean rather than an inference from children — a screen with a header row and no data still has children, and only the screen knows 'no records' from 'no records MATCHING'." },
						{ name: "error", type: "ReactNode | Error", description: "Anything truthy replaces the body. See the rule above for which half it takes." },
						{ name: "onRetry", type: "() => void", description: "Wiring it puts a retry control on the generated error state. Without it there is nothing to offer." },
						{ name: "slots", type: "ResourceShellSlots", description: "header, toolbar, aside, footer, loading, empty, error. Every one has a generated default; the slot is for the screen where configuring that default prop by prop is worse than replacing it." },
						{ name: "TabbedResourceShell tabs", type: "OverflowTabItem[]", required: true, description: "Goes into the toolbar slot, so slots.toolbar still wins outright." },
						{ name: "ResourceHeader media / avatarUrl / icon", type: "ReactNode / string / ComponentType", description: "Ordered, not exclusive. A screen knows one of the three, and which one depends on what the record is — a person has an avatar, a settings section has an icon." },
						{ name: "ResourceActionBar sticky", type: "boolean", default: "false", description: "Pins the bar below the shell header, not the viewport top — for a bar carrying a selection count, which is needed exactly when a static bar has scrolled away." },
						{ name: "ResourceDetailsSection metadata", type: "MetadataListItem[]", description: "Structured facts before any free-form body. metadataColumns is a ceiling; the list steps down at narrow widths on its own." },
						{ name: "ResourceDetailsSection padding / surface", type: '"sm" | "md" | "lg" / ContentBlockSurface', default: '"md" / "bordered"', description: "Use surface=\"plain\" when the section sits inside a frame that already has chrome." },
						{ name: "ResourceHeader / ResourceActionBar", type: "component", description: "The title block and the verb row of an index or show screen, for a page that wants the shell\u2019s rhythm without its whole frame." },
						{ name: "ResourceEmptyState", type: "component", description: "One of the three states the shells swap in for content. loading, error and empty are replacements rather than overlays \u2014 they take the space the content will take, so nothing reflows when it arrives." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
