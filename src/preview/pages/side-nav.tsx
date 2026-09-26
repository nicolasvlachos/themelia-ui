import { FileTextIcon, SettingsIcon, ShieldIcon, UsersIcon } from "lucide-react"
import { useState } from "react"

import { Card } from "@/components/base/cards"
import { Text } from "@/components/base/typography"
import { AsideNavShell, BreadcrumbProgress, SectionNav, SideNav } from "@/components/layout"

import { Callout } from "../partials/callout"
import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const SETTINGS_NAV = [
	{
		id: "workspace",
		label: "Workspace",
		items: [
			{ label: "General", href: "/settings", icon: SettingsIcon },
			{ label: "Members", href: "/settings/members", icon: UsersIcon, badge: "12" },
			{ label: "Security", href: "/settings/security", icon: ShieldIcon },
		],
	},
	{
		id: "billing",
		label: "Billing",
		collapsible: true,
		items: [
			{ label: "Invoices", href: "/settings/invoices", icon: FileTextIcon },
			{ label: "Plan", href: "/settings/plan", disabled: true },
		],
	},
]

const WIZARD = [
	{ id: "account", label: "Account", hint: "Who you are" },
	{ id: "workspace", label: "Workspace", hint: "Name and region" },
	{ id: "billing", label: "Billing", hint: "Plan and payment" },
	{ id: "review", label: "Review", hint: "Check and confirm" },
]

function WizardProgress() {
	const [current, setCurrent] = useState(2)
	return <BreadcrumbProgress steps={WIZARD} currentIndex={current} onStepClick={(_id, index) => setCurrent(index)} />
}

export function SideNavPage() {
	return (
		<ComponentPage
			title="Side nav, section nav & settings shell"
			summary="The two navigations that sit beside content rather than above it — the rail between the pages of one section, and the table of contents within one page — and AsideNavShell, which is the rail composed beside a column of content, as a settings area is."
			importPath="@/components/layout/navigation"
			exports={["SideNav", "SectionNav",
				"CategoryNav", "BreadcrumbProgress",
			]}
			alsoImports={[
				{ importPath: "@/components/layout/settings", title: "Settings shell", exports: ["AsideNavShell"] },
			]}
		>
			<Example
				id="side-nav"
				title="SideNav"
				description="The rail between the pages of one section, not the app's global sidebar. Entries are data, so the active state, the ARIA, and the router integration are decided once. The active entry is matched by longest prefix — an index entry otherwise lights up on every page beneath it."
				stacked
				code={`<SideNav groups={settingsNav} currentPath="/settings/members" />`}
			>
				<div style={MEASURE.narrow}>
					<SideNav groups={SETTINGS_NAV} currentPath="/settings/members" />
				</div>
			</Example>

			<Example
				id="section-nav"
				title="SectionNav"
				description="The in-page table of contents. It tracks which heading is on screen, which is the whole reason it exists — a list of anchors is trivial, a list of anchors that knows where the reader is needs an observer and a rule for which heading counts when two are visible."
				stacked
				code={`<SectionNav
  items={[
    { id: "side-nav", label: "SideNav" },
    { id: "section-nav", label: "SectionNav", depth: 2 },
  ]}
/>`}
			>
				<div style={MEASURE.narrow}>
					<SectionNav
						items={[
							{ id: "side-nav", label: "SideNav" },
							{ id: "section-nav", label: "SectionNav" },
							{ id: "side-nav-api", label: "API", depth: 2 },
						]}
					/>
				</div>
			</Example>

			<Example
				id="settings-shell"
				title="The rail beside its content: AsideNavShell"
				description="A composition of TwoColumnLayout and SideNav rather than new layout, with the rail drawn on the start side. The aside is still second in the DOM, so the content is reached first — the position is a grid decision, never a DOM one."
				stacked
				code={`<AsideNavShell title="Settings" groups={settingsNav} currentPath="/settings/members">
  <Card title="Members" />
</AsideNavShell>`}
			>
				{/* Its own landmark name, distinct from the SideNav demo above. */}
				<AsideNavShell
					title="Settings"
					description="Everything about this workspace."
					aside={<SideNav groups={SETTINGS_NAV} currentPath="/settings/members" strings={{ label: "Settings" }} />}
					stickyAside={false}
					style={{ width: "100%" }}
				>
					<Card surface="bordered" title="Members" description="Who can sign in and what they can do.">
						<Text size="sm" type="secondary">The section's content sits here.</Text>
					</Card>
				</AsideNavShell>
			</Example>

			<Example id="settings-shell-rule" title="One component, named for its shape" stacked>
				<Callout label="Rule">
					A settings area is an <code>AsideNavShell</code>, and so is an account area or a
					docs tree. The arrangement — a captioned rail beside a column of cards — is not
					specific to settings, and a section that had to import something called
					“settings” would end up rebuilding it instead. There is no second name for it.
				</Callout>
			</Example>

			<Example
				id="breadcrumb-progress"
				title="A wizard's position: BreadcrumbProgress"
				description="How far through a sequence the reader is, drawn by base's Stepper as a trail. Finished steps and the current one are reachable when onStepClick is given; steps ahead are not, because a wizard that lets you skip a step you have not filled in is not a wizard. Below lg the labels fold away and the markers carry the position alone — a screen reader still hears each step's name."
				stacked
				code={`<BreadcrumbProgress
  steps={[{ id: "account", label: "Account" }, { id: "billing", label: "Billing" }, …]}
  currentIndex={current}
  onStepClick={(_id, index) => setCurrent(index)}
/>`}
			>
				<WizardProgress />
			</Example>

			<Example id="side-nav-api" title="SideNav and SectionNav API">
				<PropTable
					rows={[
						{ name: "SideNav items / groups", type: "SideNavItem[] / SideNavGroup[]", description: "Flat entries or captioned blocks. A group can be collapsible." },
						{ name: "SideNav currentPath", type: "string", description: "Matched by longest prefix, so exactly one entry is current." },
						{ name: "SideNav renderLink", type: "(props) => ReactElement", description: "Routes entries through the app's router. Without it they are plain anchors — this library never imports a router." },
						{ name: "SectionNav items", type: "SectionNavItem[]", description: "id, label, and an optional depth for nesting." },
						{ name: "SectionNav rootMargin", type: "string", description: "Which band of the viewport counts as the current position. The default keeps the marker near the top." },
						{ name: "SideNav strings", type: "Partial<SideNavStrings>", description: "Overrides the rail's own copy — the collapse control's name." },
						{ name: "CategoryNav", type: "component", description: "A vertical list of destinations with a count on each. Not SideNav: this is a FILTER rail, where the rows are categories of one list rather than pages of a product, and the count is the reason a reader picks one." },
						{ name: "BreadcrumbProgress", type: "component", description: "A wizard\u2019s position, as a trail. Not Breadcrumbs: a trail describes where you ARE in a hierarchy you can climb, and this describes how far along a sequence you have got \u2014 the steps behind you are done, not ancestors." },
					]}
				/>
			</Example>

			<Example id="settings-shell-api" title="AsideNavShell API">
				<PropTable owner="AsideNavShell"
					rows={[
						{ name: "title / description", type: "ReactNode", description: "The section heading above both columns." },
						{ name: "items / groups / currentPath / renderLink", api: ["AsideNavShell.items", "AsideNavShell.groups", "AsideNavShell.currentPath", "AsideNavShell.renderLink"], type: "SideNav's", description: "Passed straight to the SideNav it draws — the same entries, current-path matching and router hook as above." },
						{ name: "stickyAside", type: "boolean", default: "true", description: "A settings rail is short and the content beside it usually is not." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
