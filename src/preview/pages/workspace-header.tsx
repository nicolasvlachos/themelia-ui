import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Card } from "@/components/base/cards"
import { PillRadioGroup } from "@/components/base/choice-inputs"
import { Money } from "@/components/primitives"
import { WorkspaceRecordHeader } from "@/components/layout"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

function ViewSwitch() {
	const [view, setView] = useState<string | null>("logs")
	return (
		<PillRadioGroup
			value={view}
			onValueChange={setView}
			options={[
				{ value: "logs", label: "Logs" },
				{ value: "assets", label: "Assets" },
				{ value: "timing", label: "Timing" },
			]}
		/>
	)
}

export function WorkspaceHeaderPage() {
	return (
		<ComponentPage
			title="Workspace record header"
			summary="The header of a record you are working ON — an invoice, a customer, a deployment. Built on PageHeading for the title row, but not a page title: a page heading names a screen, and this identifies a thing and carries the apparatus that comes with one — media, a status, metadata."
			importPath="@/components/layout/workspace"
			exports={["WorkspaceRecordHeader",
				"WorkspaceLayout", "WorkspaceNav", "WorkspaceLocaleStrip",
			]}
		>
			<Example
				id="record-header"
				title="WorkspaceRecordHeader"
				description="Media, a status, metadata pairs, and two tiers of action. Each metadata pair is one inline item, label and value together, so a screen reader reads “Owner: Jane McDonald” as one fact rather than two loose strings."
				stacked
				code={`<WorkspaceRecordHeader
  title="Invoice #4417"
  media={<Avatar />}
  badges={<Badge tone="success" dot>Paid</Badge>}
  metadata={[{ label: "Owner", value: "Jane McDonald" }]}
  actions={<Button>Edit</Button>}
/>`}
			>
				<Card surface="bordered" style={{ width: "100%" }}>
					<WorkspaceRecordHeader
						title="Invoice #4417"
						description="Northwind Traders — issued 1 September 2026."
						media={
							<Avatar size="lg">
								<AvatarFallback>NT</AvatarFallback>
							</Avatar>
						}
						badges={<Badge tone="success" dot>Paid</Badge>}
						metadata={[
							{ label: "Owner", value: "Jane McDonald" },
							{ label: "Amount", value: <Money amount={1299.5} currency="EUR" /> },
							{ label: "Terms", value: "Net 30" },
						]}
						actions={
							<>
								<Button tone="neutral" buttonStyle="outline">Duplicate</Button>
								<Button>Edit</Button>
							</>
						}
					/>
				</Card>
			</Example>

			<Example
				id="record-header-secondary"
				title="Two tiers of action"
				description="Primary actions pin to the title row, where they are read as belonging to the record. The secondary row beneath is for controls that change the VIEW of it — a tab bar, a filter, a bulk selection — which belong to the screen rather than to the thing."
				stacked
				code={`<WorkspaceRecordHeader
  title="Deployment 41a9c2"
  actions={<Button>Redeploy</Button>}
  secondaryActions={<PillRadioGroup options={views} />}
/>`}
			>
				<Card surface="bordered" style={{ width: "100%" }}>
					<WorkspaceRecordHeader
						title="Deployment 41a9c2"
						headingLevel={2}
						description="main → production, 4 minutes ago."
						badges={<Badge tone="warning" dot pulse>Building</Badge>}
						metadata={[
							{ label: "Branch", value: "main" },
							{ label: "Author", value: "Raj Patel" },
						]}
						actions={<Button tone="neutral" buttonStyle="outline">Cancel</Button>}
						secondaryActions={<ViewSwitch />}
					/>
				</Card>
			</Example>

			<Example id="record-header-rule" title="A record is not a page" stacked>
				<Callout label="Rule">
					Use <code>PageHeading</code> when the answer to “what is this?” is a screen, and
					this when it is a row in a table somewhere. Folding both into one component would
					mean a page title growing an avatar prop, a status prop, and a metadata prop it
					never uses — and every page paying the cost of the ones that do.
				</Callout>
			</Example>

			<Example id="record-header-api" title="API">
				<PropTable owner="WorkspaceRecordHeader"
					rows={[
						{ name: "title", type: "ReactNode", description: "What the record IS. Gives way before the badges do." },
						{ name: "headingLevel", type: "1 | 2 | 3", default: "1", description: "The heading element, for the document outline." },
						{ name: "description", type: "ReactNode", description: "One line under the title." },
						{ name: "media", type: "ReactNode", description: "An avatar, an icon medallion, a thumbnail." },
						{ name: "badges", type: "ReactNode", description: "Status marks beside the title. Short — the title is what gives way, not these." },
						{ name: "status", type: "ReactNode", description: "A single prominent status, rendered after the badges." },
						{ name: "metadata", type: "{ id?, label, value }[]", description: "An inline MetadataList: each label and value is one item, with a middle dot between items." },
						{ name: "actions", type: "ReactNode", description: "Primary actions, pinned to the end of the title row." },
						{ name: "secondaryActions", type: "ReactNode", description: "A second, quieter row beneath — filters, tabs, bulk controls." },
						{ name: "WorkspaceLayout", type: "component", description: "The frame a single RECORD is edited in. Not an app shell \u2014 it sits inside one: a record with many sections needs its own navigation, and nesting a second shell is how a page ends up with two sidebars." },
						{ name: "WorkspaceNav", type: "component", description: "Navigation for a record filled in over time. The difference from every other nav in the kit is COMPLETION: each section reports how much of it is done, because that is what decides where the reader goes next." },
						{ name: "WorkspaceLocaleStrip", type: "component", description: "The languages a record exists in, and how complete each is. A strip rather than a select, because the completeness is the reason to switch and a select hides it behind a press." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
