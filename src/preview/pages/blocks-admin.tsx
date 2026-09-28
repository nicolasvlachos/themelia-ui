import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function BlocksAdminPage() {
	return (
		<ComponentPage>
			<Example
				example="blocks-admin/blocks-changelog"
				title="Changelog"
				description="An entry's kind picks a tone and a label; `base/timeline` draws everything else. That split is why the rail lives in base — a changelog, a set of milestones and a stepper are one geometry with three vocabularies. The kind is stated once: the badge names it and carries the colour, and the rail keeps a marker rather than repeating the same fact as a glyph inside a coloured disc."
			/>

			<Example
				example="blocks-admin/blocks-milestones"
				title="Milestones"
				description="A milestone in flight carries a percentage, and that bar is base/feedback's Progress rather than a div with a width — Progress already answers the role, the value range and the accessible name."
			/>

			<Example
				example="blocks-admin/blocks-steps"
				title="Steps, vertical and horizontal"
				description="Two components rather than an orientation prop. They are not one layout turned ninety degrees: the vertical form hangs a step's own content under it, and the horizontal one puts labels below numbered dots. One prop would leave half the props dead in whichever form you picked."
			/>

			<Example
				example="blocks-admin/blocks-checklist"
				title="Onboarding checklist"
				description="Opens the next unfinished step by default, because the reader's question on arriving is 'what do I do now'. Built on base/accordion's items API — the canonical icon/title/badge row already exists, and hand-assembling triggers here would be a second row rhythm beside the kit's own."
			/>

			<Example
				example="blocks-admin/blocks-credentials"
				title="Credential list"
				description="Any named secret — API keys, service tokens, deploy hooks. Copying goes through base/copyable, which owns the clipboard write, the copied state and both toasts, so no row writes any of the four itself."
			/>

			<Example
				example="blocks-admin/blocks-roles"
				title="Role permissions"
				description="A read-only summary, not an editor — the grid that changes permissions is a form with its own submit and dirty state. Each permission states its condition in text as well as colour, because a green dot beside a grey one is otherwise the whole difference."
			/>

			<Example
				example="blocks-admin/blocks-sensitive"
				title="Sensitive action"
				description="The danger zone, as a component — so 'this is irreversible' gets stated the same way everywhere. It does not own the confirmation dialog: the action is a slot, so the destructive decision stays where its consequences are known."
			/>

			<Example
				example="blocks-admin/blocks-changelog-blueprint"
				title="Compose your own timeline"
				description="The timelines are `Timeline` rows with a version and change badges. For a different record, pass your own items: `timestamp` takes any node, such as a `MonoValue` version, and `children` a row of `Badge`s."
			/>

			<Example
				example="blocks-admin/blocks-checklist-blueprint"
				title="Compose your own checklist"
				description="The checklist is `Progress` above an `Accordion` whose items carry an `IconBadge` for their state. Compose it yourself when a step needs content the block does not take."
			/>

			<Example
				example="blocks-admin/blocks-roles-blueprint"
				title="Compose your own permissions"
				description="A permissions grid is a `Table` with a column per role. Give each mark hidden text, so a screen reader hears granted or not rather than an icon."
			/>

			<Example id="blocks-props" title="Props">
				<Callout>
					These modules are blocks, which sit <strong>above</strong> Features: a block may
					assemble Base, Primitives, Layout and Features, and neither Features nor Layout may
					import one. That is why <code>features/ai-chat</code> carries its own AI surfaces
					rather than taking them from a block — <code>verify architecture</code> rejects the
					reverse edge.
				</Callout>
				<PropTable
					owners={[
						"ChangelogTimeline",
						"MilestonesTimeline",
						"Steps",
						"StepsBar",
						"Checklist",
						"CredentialList",
						"RolePermissions",
						"SensitiveAction",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
