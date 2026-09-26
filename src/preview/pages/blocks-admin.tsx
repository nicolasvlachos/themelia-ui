import { KeyRoundIcon } from "lucide-react"

import { CredentialList, RolePermissions, SensitiveAction } from "@/components/admin/patterns/access"
import { Checklist } from "@/components/patterns/onboarding"
import {
	ChangelogTimeline, MilestonesTimeline, Steps, StepsBar,
	type ChangelogEntry, type Milestone, type Step,
} from "@/components/patterns/timelines"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const CHANGELOG: ChangelogEntry[] = [
	{
		id: "1",
		kind: "added",
		title: "Saved views on the data table",
		description: "A view captures filters, column order and page size.",
		version: "v3.4.0",
		timestamp: "16 Aug",
		author: "Alice Mercer",
	},
	{
		id: "2",
		kind: "fixed",
		title: "Sheet no longer traps focus after a nested dialog closes",
		version: "v3.3.2",
		timestamp: "12 Aug",
	},
	{
		id: "3",
		kind: "modified",
		title: "Badge tones renamed to the semantic set",
		description: "The default and error tones are gone; use neutral and destructive.",
		version: "v3.3.0",
		timestamp: "4 Aug",
	},
	{
		id: "4",
		kind: "removed",
		title: "The legacy size prop on Metric",
		version: "v3.3.0",
		timestamp: "4 Aug",
	},
]

const MILESTONES: Milestone[] = [
	{ id: "1", title: "Discovery", description: "Interviews with eight teams.", status: "completed", dueDate: "12 Jun" },
	{ id: "2", title: "Design system audit", status: "completed", dueDate: "3 Jul" },
	{ id: "3", title: "Token consolidation", description: "1,699 custom properties down to 479.", status: "inProgress", dueDate: "29 Aug", progress: 68 },
	{ id: "4", title: "Consumer migration", status: "blocked", description: "Waiting on the package release." },
	{ id: "5", title: "Deprecate the old kit", status: "upcoming", dueDate: "Q4" },
]

const STEPS: Step[] = [
	{ id: "1", title: "Create your workspace", description: "Name it and pick a region.", status: "completed", timestamp: "Done 14 Aug" },
	{ id: "2", title: "Invite your team", description: "Add the people who need access.", status: "completed", timestamp: "Done 15 Aug" },
	{ id: "3", title: "Connect a data source", description: "Postgres, BigQuery, or a CSV upload.", status: "current", badge: "Required" },
	{ id: "4", title: "Publish your first dashboard", description: "Pick a template or start empty.", status: "upcoming" },
]

const CREDENTIALS = [
	{ id: "1", name: "Production", value: "sk_live_4417a92f0b3d", displayValue: "sk_live_••••0b3d" },
	{ id: "2", name: "Staging", value: "sk_test_88fe12c4a771", displayValue: "sk_test_••••a771" },
	{ id: "3", name: "CI", value: "sk_ci_29ab77f0e145", displayValue: "sk_ci_••••e145", disabled: true },
]

const GROUPS = [
	{
		name: "Members",
		permissions: [
			{ label: "View", granted: true },
			{ label: "Invite", granted: true },
			{ label: "Remove", granted: false },
		],
	},
	{
		name: "Billing",
		permissions: [
			{ label: "View invoices", granted: true },
			{ label: "Change plan", granted: false },
			{ label: "Update card", granted: false },
		],
	},
]

export function BlocksAdminPage() {
	return (
		<ComponentPage
			title="Timelines, onboarding & admin"
			summary="Domain presentation assembled from the layers below it. The three timeline surfaces map a vocabulary onto base/timeline rather than redrawing the rail, and nothing here fetches, navigates, or confirms a destructive action — every one takes callbacks and slots."
			importPath="@/components/patterns/timelines"
			exports={["ChangelogTimeline", "MilestonesTimeline", "Steps", "StepsBar", "Checklist", "CredentialList", "RolePermissions", "SensitiveAction"]}
		>
			<Example
				id="blocks-changelog"
				title="Changelog"
				description="An entry's kind picks a tone and a label; `base/timeline` draws everything else. That split is why the rail lives in base — a changelog, a set of milestones and a stepper are one geometry with three vocabularies. The kind is stated once: the badge names it and carries the colour, and the rail keeps a marker rather than repeating the same fact as a glyph inside a coloured disc."
				stacked
				code={`<ChangelogTimeline
  entries={[
    { id: "1", kind: "added", title: "Saved views", version: "v3.4.0", timestamp: "16 Aug" },
  ]}
/>`}
			>
				<ChangelogTimeline entries={CHANGELOG} />
			</Example>

			<Example
				id="blocks-milestones"
				title="Milestones"
				description="A milestone in flight carries a percentage, and that bar is base/feedback's Progress rather than a div with a width — Progress already answers the role, the value range and the accessible name."
				stacked
				code={`<MilestonesTimeline
  milestones={[
    { id: "3", title: "Token consolidation", status: "inProgress", progress: 68 },
  ]}
/>`}
			>
				<MilestonesTimeline milestones={MILESTONES} />
			</Example>

			<Example
				id="blocks-steps"
				title="Steps, vertical and horizontal"
				description="Two components rather than an orientation prop. They are not one layout turned ninety degrees: the vertical form hangs a step's own content under it, and the horizontal one puts labels below numbered dots. One prop would leave half the props dead in whichever form you picked."
				stacked
				code={`<Steps steps={steps} />
<StepsBar steps={steps} />`}
			>
				<Stack gap="2xl">
					<StepsBar steps={STEPS} />
					<Steps steps={STEPS} />
				</Stack>
			</Example>

			<Example
				id="blocks-checklist"
				title="Onboarding checklist"
				description="Opens the next unfinished step by default, because the reader's question on arriving is 'what do I do now'. Built on base/accordion's items API — the canonical icon/title/badge row already exists, and hand-assembling triggers here would be a second row rhythm beside the kit's own."
				stacked
				code={`<Checklist
  steps={[
    { id: "3", status: "inProgress", title: "Connect a data source", content: <Form /> },
  ]}
/>`}
			>
				<Checklist
					steps={[
						{ id: "1", status: "completed", title: "Create your workspace", content: <Text type="secondary">Named and provisioned in eu-west-1.</Text> },
						{ id: "2", status: "completed", title: "Invite your team", content: <Text type="secondary">Four people accepted.</Text> },
						{
							id: "3",
							status: "inProgress",
							title: "Connect a data source",
							badge: <Badge tone="warning">Required</Badge>,
							content: (
								<Stack gap="md">
									<Text type="secondary">Pick where your data lives. You can add more later.</Text>
									<Stack direction="horizontal" gap="sm" wrap>
										<Button tone="primary">Connect Postgres</Button>
										<Button tone="secondary" buttonStyle="outline">Upload a CSV</Button>
									</Stack>
								</Stack>
							),
						},
						{ id: "4", status: "pending", title: "Publish your first dashboard", content: <Text type="secondary">Start from a template.</Text> },
					]}
				/>
			</Example>

			<Example
				id="blocks-credentials"
				title="Credential list"
				description="Any named secret — API keys, service tokens, deploy hooks. Copying goes through base/copyable, which owns the clipboard write, the copied state and both toasts; the source hand-rolled all four per row."
				stacked
				code={`<CredentialList items={keys} onAdd={add} onDelete={remove} />`}
			>
				<CredentialList items={CREDENTIALS} onAdd={() => {}} onDelete={() => {}} />
			</Example>

			<Example
				id="blocks-roles"
				title="Role permissions"
				description="A read-only summary, not an editor — the grid that changes permissions is a form with its own submit and dirty state. Each permission states its condition in text as well as colour, because a green dot beside a grey one is otherwise the whole difference."
				stacked
				code={`<RolePermissions roleName="Editor" groups={groups} memberCount={12} onEdit={edit} />`}
			>
				<RolePermissions
					roleName="Editor"
					description="Can publish and manage content, but not billing."
					memberCount={12}
					groups={GROUPS}
					onEdit={() => {}}
				/>
			</Example>

			<Example
				id="blocks-sensitive"
				title="Sensitive action"
				description="The danger zone, as a component — so 'this is irreversible' gets stated the same way everywhere. It does not own the confirmation dialog: the action is a slot, so the destructive decision stays where its consequences are known."
				stacked
				code={`<SensitiveAction
  title="Delete this workspace"
  confirmation="Every dashboard, source and saved view goes with it."
  action={<Button tone="destructive">Delete</Button>}
/>`}
			>
				<SensitiveAction
					title="Delete this workspace"
					description="Removes the workspace and everything inside it."
					confirmation="Every dashboard, data source and saved view goes with it. This cannot be undone."
					icon={KeyRoundIcon}
					action={<Button tone="destructive">Delete workspace</Button>}
				/>
			</Example>

			<Example id="blocks-props" title="Props">
				<Callout>
					Blocks sit <strong>above</strong> features, which is the opposite of the source
					kit's <code>composed/</code>. A block may assemble base, primitives and features;
					nothing may import a block. That inversion is why <code>features/ai-chat</code>
					carries its own AI surfaces instead of waiting on a <code>blocks/ai</code> that
					did not exist — <code>verify composition</code> enforces it as
					<code> blocks-are-terminal</code>.
				</Callout>
				<PropTable
					rows={[
						{ name: "ChangelogTimeline entries", type: "ChangelogEntry[]", required: true, description: "id, kind, title, and optionally description, version, timestamp, author. kind is added | removed | modified | fixed." },
						{ name: "MilestonesTimeline milestones", type: "Milestone[]", required: true, description: "status is completed | inProgress | upcoming | blocked. progress is drawn only while in flight." },
						{ name: "Steps / StepsBar steps", api: ["Steps.steps", "StepsBar.steps"], type: "Step[]", required: true, description: "status is completed | current | upcoming. The vertical form also takes per-step content." },
						{ name: "Checklist steps", type: "ChecklistStep[]", required: true, description: "id, status, title, and optionally badge, content, disabled." },
						{ name: "Checklist expanded / onExpandedChange", type: "string[] / (ids) => void", description: "Controlled. Uncontrolled it opens the first unfinished step." },
						{ name: "Checklist onStepOpen", type: "(id) => void", description: "Fires on the transition into open — for analytics, not for state." },
						{ name: "CredentialList items", type: "Credential[]", required: true, description: "id, name, value, and displayValue for the masked form shown in the row." },
						{ name: "CredentialList onAdd / onDelete", type: "() => void / (id, item) => void", description: "Omit either to hide its action. The delete confirmation belongs to the caller." },
						{ name: "RolePermissions groups", type: "PermissionGroup[]", required: true, description: "Each group names an area and lists its permissions with a granted flag." },
						{ name: "SensitiveAction action / confirmation", type: "ReactNode", description: "The control, and what will happen before it does. The confirmation renders role=\"note\" — nothing has gone wrong yet." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
