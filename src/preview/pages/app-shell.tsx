import {
	ChartNoAxesColumnIcon, CreditCardIcon, FileTextIcon,
	SettingsIcon, UsersIcon,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/base/badge"
import type { SidebarCollapsible, SidebarVariant } from "@/components/base/sidebar"
import {
	AppSidebar, WorkspaceLayout, WorkspaceNav,
	SidebarInsetLayout, StackedLayout, TopbarSidebarLayout,
	type SidebarNavItem,
} from "@/components/layout"
import { IconBadge } from "@/components/base/display"
import { PillRadioGroup } from "@/components/base/choice-inputs"
import { Grid, Stack } from "@/components/base/structure"
import { Heading, Text } from "@/components/base/typography"

import { Button } from "@/components/base/buttons"
import { Card } from "@/components/base/cards"
import { Input } from "@/components/base/text-inputs"
import { FormField } from "@/components/base/forms"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableEmpty } from "@/components/base/table"
import type { LayoutLinkRenderer } from "@/components/layout/layout.types"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

/** Navigation data; with `currentUrl` it decides "active" once. */
const NAVIGATION: Record<string, SidebarNavItem[]> = {
	Workspace: [
		{ label: "Overview", href: "/app", icon: ChartNoAxesColumnIcon },
		{ label: "Invoices", href: "/app/invoices", icon: FileTextIcon, handle: "invoices" },
		{ label: "Customers", href: "/app/customers", icon: UsersIcon },
		{ label: "Billing", href: "/app/billing", icon: CreditCardIcon },
	],
	Configure: [
		{
			label: "Settings",
			href: "/app/settings",
			icon: SettingsIcon,
			children: [
				{ label: "General", href: "/app/settings" },
				{ label: "Members", href: "/app/settings/members" },
			],
		},
		/* No href: this parent is a disclosure the reader opens, not a destination. */
		{
			label: "Reports",
			icon: ChartNoAxesColumnIcon,
			children: [
				{ label: "Revenue", href: "/app/reports/revenue" },
				{ label: "Tax", href: "/app/reports/tax" },
			],
		},
	],
}

const PROVIDER = { persist: false, keyboardShortcut: false }
const FRAME = {
	height: "34rem",
	borderRadius: "var(--radius)",
	border: "1px solid var(--border)",
	width: "100%",
	overflow: "hidden",
} as const
const INVOICES = [
	{ id: "INV-4417", customer: "Northwind Traders", amount: "$1,299.50", paid: true },
	{ id: "INV-4418", customer: "Acme Corporation", amount: "$840.00", paid: false },
	{ id: "INV-4419", customer: "Initech", amount: "$2,150.00", paid: false },
]

function demoLink(onNavigate: (url: string) => void): LayoutLinkRenderer {
	return ({ href, children, active, disabled, external, ...rest }) => {
		void active
		void external
		if (disabled) return <span {...rest}>{children}</span>
		return <a {...rest} href={href} onClick={event => { event.preventDefault(); if (href) onNavigate(href) }}>{children}</a>
	}
}

function InvoiceContent({ query = "" }: { query?: string }) {
	const [unpaid, setUnpaid] = useState(false)
	const rows = INVOICES.filter(row => (!unpaid || !row.paid) && `${row.id} ${row.customer}`.toLowerCase().includes(query.toLowerCase()))
	return <Card title="Recent invoices" description="Track payments across your workspace."
		contentTop={<Stack direction="horizontal" justify="end"><Button buttonStyle="outline" tone="neutral" aria-pressed={unpaid} onClick={() => setUnpaid(!unpaid)}>{unpaid ? "Show all" : "Unpaid only"}</Button></Stack>}
		footerText={`${rows.length} ${rows.length === 1 ? "invoice" : "invoices"}`}>
		<Table aria-label="Recent invoices">
			<TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead align="end">Amount</TableHead></TableRow></TableHeader>
			<TableBody>{rows.map(row => <TableRow key={row.id}><TableCell>{row.id}</TableCell><TableCell>{row.customer}</TableCell><TableCell><Badge tone={row.paid ? "success" : "warning"}>{row.paid ? "Paid" : "Due"}</Badge></TableCell><TableCell align="end">{row.amount}</TableCell></TableRow>)}
				{!rows.length && <TableEmpty colSpan={4}>No invoices match this search.</TableEmpty>}
			</TableBody>
		</Table>
	</Card>
}

function SettingsContent() {
	const [name, setName] = useState("Northwind Traders")
	const [saved, setSaved] = useState(false)
	return <Card title="Workspace details" description="Shared with everyone in your workspace.">
		<form onSubmit={event => { event.preventDefault(); setSaved(true) }}>
			<Stack gap="lg">
				<FormField label="Workspace name" required><Input value={name} required onChange={event => { setName(event.target.value); setSaved(false) }} /></FormField>
				<Stack direction="horizontal" gap="md" align="center" wrap>
					<Button type="submit">Save changes</Button>
					<Text size="sm" role="status">{saved ? "Workspace updated." : ""}</Text>
				</Stack>
			</Stack>
		</form>
	</Card>
}

function AdminContent({ currentUrl, query }: { currentUrl: string; query?: string }) {
	const title = currentUrl.includes("settings") ? "Settings"
		: currentUrl.includes("invoices") ? "Invoices"
		: currentUrl.includes("customers") ? "Customers"
		: currentUrl.includes("billing") ? "Billing" : "Overview"

	return (
		<Stack gap="xl">
			<Stack gap="xs">
				<Heading level={3} size="xl">{title}</Heading>
				<Text type="secondary">Northwind workspace</Text>
			</Stack>
			{title === "Settings" ? (
				currentUrl.endsWith("/members") ? (
					<Card title="Workspace members" description="People with access to this workspace.">
						<Table aria-label="Workspace members">
							<TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
							<TableBody>
								<TableRow><TableCell>Jane McDonald</TableCell><TableCell><Badge tone="neutral">Owner</Badge></TableCell></TableRow>
								<TableRow><TableCell>Alex Morgan</TableCell><TableCell><Badge tone="neutral">Member</Badge></TableCell></TableRow>
							</TableBody>
						</Table>
					</Card>
				) : <SettingsContent />
			) : title === "Customers" ? (
				<Card title="Customer directory" description="Customers linked to recent invoices.">
					<Table aria-label="Customers">
						<TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Latest invoice</TableHead></TableRow></TableHeader>
						<TableBody>{INVOICES.map(row => <TableRow key={row.id}><TableCell>{row.customer}</TableCell><TableCell>{row.id}</TableCell></TableRow>)}</TableBody>
					</Table>
				</Card>
			) : (
				<>
					{title === "Overview" && (
						<Grid columns={{ base: 1, md: 3 }} gap="md">
							{[["Collected", "$1,299.50"], ["Outstanding", "$2,990.00"], ["Customers", "3"]].map(([label, value]) => (
								<Card key={label} title={label}><Text size="xl" weight="semibold">{value}</Text></Card>
							))}
						</Grid>
					)}
					<InvoiceContent query={query} />
				</>
			)}
		</Stack>
	)
}

function TopbarDemo() {
	const [currentUrl, setCurrentUrl] = useState("/app/invoices")
	const [side, setSide] = useState<string | null>("left")
	const [query, setQuery] = useState("")
	const sidebarSide = side === "right" ? "right" : "left"

	return (
		<Stack gap="lg" style={{ width: "100%", minWidth: 0 }}>
			<PillRadioGroup
				aria-label="Navigation side"
				name="topbar-sidebar-side"
				value={side}
				onValueChange={setSide}
				options={[{ value: "left", label: "Left navigation" }, { value: "right", label: "Right navigation" }]}
			/>
			<div style={FRAME}>
				<TopbarSidebarLayout
					contained
					contentRender={<div />}
					sidebarProviderProps={PROVIDER}
					sidebarSide={sidebarSide}
					logo={<Brand />}
					headerActions={<Badge tone="neutral">Workspace</Badge>}
					sidebar={
						<AppSidebar
							side={sidebarSide}
							collapsible="icon"
							currentUrl={currentUrl}
							navigationGroups={NAVIGATION}
							renderLink={demoLink(setCurrentUrl)}
						/>
					}
				>
					<Stack gap="lg">
						{currentUrl === "/app/invoices" && (
							<Input type="search" aria-label="Search invoices" placeholder="Search invoices…" value={query} onChange={event => setQuery(event.target.value)} />
						)}
						<AdminContent currentUrl={currentUrl} query={currentUrl === "/app/invoices" ? query : undefined} />
					</Stack>
				</TopbarSidebarLayout>
			</div>
		</Stack>
	)
}

function StackedDemo() {
	const [currentUrl, setCurrentUrl] = useState("/app")
	const destinations = [["/app", "Overview"], ["/app/invoices", "Invoices"], ["/app/settings", "Settings"]] as const

	return (
		<div style={FRAME}>
			<StackedLayout
				contained
				boundContent={false}
				contentRender={<div />}
				header={
					<Stack direction="horizontal" gap="md" align="center" wrap>
						<Brand />
						<nav aria-label="Primary navigation (stacked example)">
							<Stack direction="horizontal" gap="xs" wrap>
								{destinations.map(([path, label]) => (
									<Button
										key={path}
										tone="neutral"
										buttonStyle={currentUrl === path ? "solid" : "ghost"}
										aria-current={currentUrl === path ? "page" : undefined}
										onClick={() => setCurrentUrl(path)}
									>{label}</Button>
								))}
							</Stack>
						</nav>
					</Stack>
				}
			>
				<AdminContent currentUrl={currentUrl} />
			</StackedLayout>
		</div>
	)
}

function WorkspaceDemo() {
	const [section, setSection] = useState("details")
	return (
		<div style={FRAME}>
			<StackedLayout contained boundContent={false} contentRender={<div />} header={<Brand />} headerEnd={<Badge tone="neutral">Settings</Badge>}>
				<WorkspaceLayout
					contentRender={<div />}
					contentWidth="full"
					sidebar={
						<WorkspaceNav
							aria-label="Record sections (workspace example)"
							activeId={section}
							onSelect={item => setSection(item.id)}
							groups={[{ id: "settings", label: "Workspace", items: [
								{ id: "details", label: "Details", completion: 100 },
								{ id: "billing", label: "Billing", completion: 50 },
							] }]}
						/>
					}
				>
					{section === "details" ? <SettingsContent /> : <InvoiceContent />}
				</WorkspaceLayout>
			</StackedLayout>
		</div>
	)
}

/** The product mark. A real one is an SVG; this is the shape of the slot. */
function Brand() {
	return (
		<Stack direction="horizontal" gap="sm" align="center">
			<BrandMark />
			<Text weight="semibold">Northwind</Text>
		</Stack>
	)
}

/** The compact mark, for the collapsed rail and the header on a phone. */
function BrandMark() {
	return <IconBadge icon={<ChartNoAxesColumnIcon />} tone="primary" shape="rounded" />
}

function ShellDemo({ variant, collapsible }: { variant: SidebarVariant; collapsible: SidebarCollapsible }) {
	const [currentUrl, setCurrentUrl] = useState("/app/settings/members")
	return <div style={FRAME}>
		<SidebarInsetLayout contentRender={<div />} contained sidebarProviderProps={PROVIDER}
			showTrigger={collapsible !== "none"} ruledToolbar={variant !== "inset"}
			toolbar={<Text weight="medium">Workspace</Text>} toolbarEnd={<Badge tone="neutral">{variant}</Badge>}
			sidebar={<AppSidebar variant={variant} collapsible={collapsible} currentUrl={currentUrl} navigationGroups={NAVIGATION}
				liveBadges={{ invoices: 2 }} logo={<Brand />} collapsedLogo={<BrandMark />} renderLink={demoLink(setCurrentUrl)} />}
		><AdminContent currentUrl={currentUrl} /></SidebarInsetLayout>
	</div>
}

export function AppShellPage() {
	const [variant, setVariant] = useState<string | null>("sidebar")
	const [collapsible, setCollapsible] = useState<string | null>("icon")

	return (
		<ComponentPage
			title="App shell"
			summary="The outermost layout a signed-in product lives in: a collapsing navigation column with the page in the inset beside it, or a stacked shell with the navigation across the top."
			importPath="@/components/layout/app-shell"
			exports={["SidebarInsetLayout", "StackedLayout", "AppSidebar", "useActivePath", "isPathMatch",
				"SidebarLogo", "SidebarWorkspace", "SidebarUser", "SidebarIcon", "TopbarSidebarLayout"
			]}
		>
			<Example
				id="sidebar-shell"
				title="The shell"
				description="SidebarInsetLayout mounts the provider itself — it is the thing that owns the open state, and asking every consumer to remember the wrapper is how half a product's screens end up without it. AppSidebar takes navigation data and a currentUrl; everything active follows from those."
				stacked
				code={`<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader>…</SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton active>
              <FileTextIcon />
              <span>Invoices</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>12</SidebarMenuBadge>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>{children}</SidebarInset>
</SidebarProvider>`}
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					<Stack direction="horizontal" gap="xl" wrap>
						<Stack gap="2xs">
							<Text size="xs" type="secondary">
								variant
							</Text>
							<PillRadioGroup
								aria-label="Sidebar surface"
								name="sidebar-variant"
								value={variant}
								onValueChange={setVariant}
								options={[
									{ value: "sidebar", label: "sidebar" },
									{ value: "floating", label: "floating" },
									{ value: "inset", label: "inset" },
								]}
							/>
						</Stack>
						<Stack gap="2xs">
							<Text size="xs" type="secondary">
								collapsible
							</Text>
							<PillRadioGroup
								aria-label="Sidebar collapse behavior"
								name="sidebar-collapsible"
								value={collapsible}
								onValueChange={setCollapsible}
								options={[
									{ value: "icon", label: "icon" },
									{ value: "offcanvas", label: "offcanvas" },
									{ value: "none", label: "none" },
								]}
							/>
						</Stack>
					</Stack>
					<ShellDemo
						key={`${variant}-${collapsible}`}
						variant={(variant ?? "sidebar") as SidebarVariant}
						collapsible={(collapsible ?? "icon") as SidebarCollapsible}
					/>
				</Stack>
			</Example>

			<Example
				id="topbar-sidebar-layout"
				title="TopbarSidebarLayout"
				description="A full-width header with navigation and independently scrolling content below it. Move the navigation to either side, collapse it to icons, and try it on a phone. Search and filter the sample invoices."
				stacked
				code={`<TopbarSidebarLayout
  logo={<Brand />}
  sidebar={<AppSidebar collapsible="icon" navigationGroups={NAVIGATION} currentUrl={url} renderLink={renderLink} />}
>
  <InvoicePage />
</TopbarSidebarLayout>`}
			>
				<TopbarDemo />
			</Example>

			<Example
				id="stacked-shell"
				title="StackedLayout"
				description="Navigation across the top leaves the page its full width. The header wraps on narrow screens. Switch sections and save a workspace name; changes stay in this local demo."
				stacked
				code={`<StackedLayout
  header={<Nav />}
  headerEnd={<Account />}
>
  {children}
</StackedLayout>`}
			>
				<StackedDemo />
			</Example>

			<Example id="composed-workspace" title="A workspace inside a shell" description="Compose record navigation and forms inside the same full-width shell. The shell owns scrolling; WorkspaceLayout owns the inner columns." stacked>
				<WorkspaceDemo />
			</Example>

			<Example id="sidebar-routing" title="The router seam" stacked>
				<Callout label="Rule">
					This layer never imports a router. Navigation goes through{" "}
					<code>renderLink</code>, so the same shell works under React Router, Next,
					Inertia, TanStack, or plain anchors — and the kit does not pick one. What it
					does own is the matching: <code>isPathMatch</code> keeps a parent lit while a
					child route is current, which is what opens the nested list on arrival rather
					than after a click.
				</Callout>
			</Example>

			<Example id="sidebar-two-boxes" title="Why the panel is two elements" stacked>
				<Callout label="Rule">
					The desktop shell renders a <code>gap</code> element and a fixed{" "}
					<code>container</code>. The container is out of flow so it can span the viewport
					and slide off-canvas; the gap is the in-flow element that reserves the column
					beside it. One element cannot do both — fixed positioning removes it from the
					very flow the page content needs to be pushed by. Both animate their width
					together, which is what makes collapsing read as the column closing rather than
					the content jumping.
				</Callout>
			</Example>

			<Example id="sidebar-api" title="API">
				<PropTable
					rows={[
						{ name: "SidebarProvider defaultOpen", api: "@/components/base/sidebar#SidebarProvider.defaultOpen", type: "boolean", default: "true", description: "Initial expanded state when uncontrolled." },
						{ name: "SidebarProvider persist", api: "@/components/base/sidebar#SidebarProvider.persist", type: "boolean", default: "true", description: "Remembers the state in localStorage, read during the initial render so the shell does not flash open then snap shut." },
						{ name: "SidebarProvider keyboardShortcut", api: "@/components/base/sidebar#SidebarProvider.keyboardShortcut", type: "boolean", default: "true", description: "Binds ⌘B / Ctrl-B to the toggle." },
						{ name: "SidebarProvider contained", api: "@/components/base/sidebar#SidebarProvider.contained", type: "boolean", default: "false", description: "Bounds the shell to its wrapper instead of the viewport. The panel is fixed by default, which is right for a shell that owns the screen and wrong everywhere else." },
						{ name: "SidebarInsetLayout showTrigger", type: "boolean", default: "true", description: "The toolbar's collapse control. Off for a shell whose navigation is opened from somewhere else." },
						{ name: "SidebarInsetLayout boundContent", type: "boolean", description: "Caps the inset's content at a reading measure instead of letting it run the shell's full width." },
						{ name: "Sidebar variant", api: "@/components/base/sidebar#Sidebar.variant", type: '"sidebar" | "floating" | "inset"', default: '"sidebar"', description: "Against the edge with a border; a rounded inset panel; or inset with the page lifted into a card." },
						{ name: "Sidebar collapsible", api: "@/components/base/sidebar#Sidebar.collapsible", type: '"offcanvas" | "icon" | "none"', default: '"offcanvas"', description: "Slides away; collapses to a glyph rail; or never collapses." },
						{ name: "Sidebar side", api: "@/components/base/sidebar#Sidebar.side", type: '"left" | "right"', default: '"left"', description: "Docking edge, for the rail and the mobile sheet alike." },
						{ name: "SidebarMenuButton size", api: "@/components/base/sidebar#SidebarMenuButton.size", type: '"sm" | "md" | "lg"', default: '"md"', description: "A shape, not a density: lg is the workspace switcher, sm a secondary row. The one place in the kit that keeps a size prop." },
						{ name: "SidebarMenuButton render", api: "@/components/base/sidebar#SidebarMenuButton.render", type: "ReactElement", description: "The element the row becomes — a router link, most often. The row's content stays in `children`, so the link keeps its own navigation and the row keeps its icon and label." },
						{ name: "SidebarMenuAction showOnHover", api: "@/components/base/sidebar#SidebarMenuAction.showOnHover", type: "boolean", default: "false", description: "Reveals on hover or keyboard focus — focus-within, so it is reachable without a pointer." },
						{ name: "AppSidebar navigationGroups", type: "Record<string, SidebarNavItem[]>", description: "Navigation as data, grouped by heading. An item with children renders as a disclosure." },
						{ name: "AppSidebar currentUrl", type: "string", description: "The current route. Active rows, and which parent is expanded, follow from this alone." },
						{ name: "AppSidebar renderLink", type: "LayoutLinkRenderer", description: "The router seam. Without it, entries render as plain anchors." },
						{ name: "AppSidebar liveBadges", type: "Record<string, string | number>", description: "Counts keyed by handle, overriding an item's declared badge — for a number that changes after the nav was defined." },
						{ name: "AppSidebar iconMap", type: "Record<string, ComponentType>", description: "Resolves an icon NAME to a component, so navigation data stays serialisable." },
						{ name: "SidebarMenuButton closeOnSelectMobile", api: "@/components/base/sidebar#SidebarMenuButton.closeOnSelectMobile", type: "boolean", default: "true", description: "Dismisses the mobile sheet on activation. Off for a row that opens something else, like a switcher." },
						{ name: "useSidebar()", api: "@/components/base/sidebar#useSidebar", type: "{ state, open, setOpen, isMobile, toggleSidebar, … }", description: "The shell's state, for anything that needs to react to it." },
						{ name: "headerClassName / toolbarClassName / contentClassName", api: ["StackedLayout.headerClassName", "SidebarInsetLayout.toolbarClassName", "SidebarInsetLayout.contentClassName"], type: "string", description: "Style one region without wrapping it. The shell owns the grid, so a wrapper around any of the three would break the sticky rows." },
						{ name: "SidebarLogo", api: "@/components/layout/sidebar#SidebarLogo", type: "component", description: "The product mark in the rail\u2019s header. It swaps to the compact mark when the rail collapses to icons rather than scaling the full one down, because a squeezed wordmark is unreadable at rail width." },
						{ name: "SidebarWorkspace", api: "@/components/layout/sidebar#SidebarWorkspace", type: "component", description: "The rail\u2019s header as a workspace switcher. The whole header row is the trigger, not a chevron beside a decorative name \u2014 the name is what a reader aims at." },
						{ name: "SidebarUser", api: "@/components/layout/sidebar#SidebarUser", type: "component", description: "The account row at the foot of the rail. Its menu opens to the RIGHT when the rail is collapsed and BELOW when it is not, because a menu that always drops down is off-screen at the bottom of a full-height panel." },
						{ name: "SidebarIcon", api: "@/components/layout/sidebar#SidebarIcon", type: "component", description: "Resolves an icon that may be a NAME. Exported because a caller supplying renderItem still wants the same resolution — a row rendered by hand should not need its own copy of \u201cstring means look it up, component means render it, node means use it\u201d." },
						{ name: "TopbarSidebarLayout contained", type: "boolean", default: "false", description: "Fits a parent with a definite height. The default owns the viewport; sidebar and content scroll below the header." },
						{ name: "TopbarSidebarLayout sidebar / sidebarSide", api: ["TopbarSidebarLayout.sidebar", "TopbarSidebarLayout.sidebarSide"], type: "ReactNode / left | right", description: "Use Sidebar or AppSidebar with icon/offcanvas collapse for a mobile drawer. Match the Sidebar side to sidebarSide. Omit the sidebar for a full-width body." },
						{ name: "TopbarSidebarLayout mobileSidebarMode", type: '"drawer" | "inline"', default: '"drawer"', description: "Drawer mode uses the Sidebar mobile sheet. Inline mode stacks static navigation above content; pair it with collapsible=none and sidebarTrigger=false." },
						{ name: "sidebarProviderProps", api: ["SidebarInsetLayout.sidebarProviderProps", "TopbarSidebarLayout.sidebarProviderProps"], type: "Pick<SidebarProviderProps, …>", description: "Pass open/onOpenChange, persist, keyboardShortcut and strings to the shell's provider. Disable persistence and shortcuts in independent embedded examples." },
						{ name: "StackedLayout contained", type: "boolean", default: "false", description: "Fits a parent with a definite height and scrolls content below the header." },
						{ name: "StackedLayout boundContent", type: "boolean", default: "true", description: "Caps the reading width. Set false for wide tables and composed workspaces." },
						{ name: "TopbarSidebarLayout", type: "component", description: "The header-first admin shell. The header spans the full width and owns the brand, the search and the account; the sidebar and the content share the height below it. The only difference from SidebarInsetLayout is where the LOGO lives — and that decides the whole frame, which is why it is two components rather than a boolean." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
