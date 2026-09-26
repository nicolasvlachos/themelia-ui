import { ArrowRightIcon, MailIcon, SearchIcon, StarIcon } from "lucide-react"

import {
	InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText,
	InputGroupTextarea,
} from "@/components/base/input-group"
import { Stack } from "@/components/base/structure"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function InputGroupPage() {
	return (
		<ComponentPage
			title="Input group"
			summary="A bordered shell that owns the focus ring on behalf of whichever control sits inside it, so the control is stripped of its own chrome and the two never draw a box each. For a field that needs something attached to it — a unit, a prefix, an action — rather than beside it."
			importPath="@/components/base/input-group"
			exports={[
				"InputGroup", "InputGroupAddon", "InputGroupButton", "InputGroupText",
				"InputGroupInput", "InputGroupTextarea",
			]}
		>
			<Example
				id="input-group-inline"
				title="Attached along the line"
				description="An addon aligned to either inline edge sits inside the shell, on the control's own line. The group draws one border and one ring; the input inside it draws neither, which is what stops a prefix reading as a second field."
				stacked
				code={`<InputGroup>
  <InputGroupAddon><SearchIcon /></InputGroupAddon>
  <InputGroupInput placeholder="Search orders" />
</InputGroup>`}
			>
				<Stack gap="lg" style={{ maxWidth: "26rem" }}>
					<InputGroup>
						<InputGroupAddon>
							<SearchIcon aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput placeholder="Search orders" aria-label="Search orders" />
					</InputGroup>

					<InputGroup>
						<InputGroupAddon>
							<MailIcon aria-hidden="true" />
						</InputGroupAddon>
						<InputGroupInput placeholder="name@example.com" aria-label="Email" />
						<InputGroupAddon align="inline-end">
							<InputGroupText>@acme.test</InputGroupText>
						</InputGroupAddon>
					</InputGroup>

					<InputGroup>
						<InputGroupInput placeholder="Add a label" aria-label="Label" />
						<InputGroupAddon align="inline-end">
							<InputGroupButton size="icon-xs" aria-label="Add">
								<ArrowRightIcon aria-hidden="true" />
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
				</Stack>
			</Example>

			<Example
				id="input-group-block"
				title="Attached above or below"
				description="A block-aligned addon takes its own row inside the shell — for a toolbar over a textarea, or a counter under one. The shell still owns the border, so the row and the control read as one field rather than as a field with something stacked on it."
				stacked
				code={`<InputGroup>
  <InputGroupTextarea placeholder="Write a note" />
  <InputGroupAddon align="block-end">
    <InputGroupText>Markdown supported</InputGroupText>
  </InputGroupAddon>
</InputGroup>`}
			>
				<Stack gap="lg" style={{ maxWidth: "26rem" }}>
					<InputGroup>
						<InputGroupAddon align="block-start">
							<InputGroupButton size="icon-xs" aria-label="Favourite">
								<StarIcon aria-hidden="true" />
							</InputGroupButton>
							<InputGroupText>Internal note</InputGroupText>
						</InputGroupAddon>
						<InputGroupTextarea placeholder="Write a note" aria-label="Note" rows={3} />
						<InputGroupAddon align="block-end">
							<InputGroupText>Markdown supported</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
				</Stack>
			</Example>

			<Example
				id="input-group-buttons"
				title="Button sizes inside the shell"
				description="A control inside a field cannot be a full-height control — it would set the field's height instead of fitting in it. The four sizes here are the ones that fit: two text sizes and their icon-only twins."
				stacked
				code={`<InputGroupButton size="icon-xs" aria-label="Go"><ArrowRightIcon /></InputGroupButton>`}
			>
				<Stack gap="lg" style={{ maxWidth: "26rem" }}>
					{(["xs", "sm"] as const).map((size) => (
						<InputGroup key={size}>
							<InputGroupInput placeholder={`size="${size}"`} aria-label={size} />
							<InputGroupAddon align="inline-end">
								<InputGroupButton size={size}>Apply</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
					))}
					{(["icon-xs", "icon-sm"] as const).map((size) => (
						<InputGroup key={size}>
							<InputGroupInput placeholder={`size="${size}"`} aria-label={size} />
							<InputGroupAddon align="inline-end">
								<InputGroupButton size={size} aria-label="Go">
									<ArrowRightIcon aria-hidden="true" />
								</InputGroupButton>
							</InputGroupAddon>
						</InputGroup>
					))}
				</Stack>
			</Example>

			<Example id="input-group-rule" title="One box, one ring" stacked>
				<Callout label="Rule">
					Use a group when the thing attached belongs <em>to the field</em> — a unit, a
					prefix, a submit. When it is a separate control that happens to sit nearby, it is
					two components in a <code>Stack</code>, and each keeps its own border. The tell is
					focus: if tabbing into the field should ring both, it is a group.
				</Callout>
			</Example>

			<Example id="input-group-api" title="API">
				<PropTable
					rows={[
						{ name: "InputGroup", type: "component", description: 'role="group" and the shell. Owns the border and the focus ring for whatever is inside, so the control strips its own.' },
						{ name: "InputGroupAddon align", type: '"inline-start" | "inline-end" | "block-start" | "block-end"', default: '"inline-start"', description: "Where the addon attaches. The inline edges sit on the control's line; the block edges take a row of their own, for a toolbar above a textarea or a hint below one." },
						{ name: "InputGroupButton size", type: '"xs" | "sm" | "icon-xs" | "icon-sm"', default: '"xs"', description: "The sizes that fit inside a field. A full-height Button would set the field's height rather than fit in it — which is the one place this kit keeps a size prop on a control." },
						{ name: "InputGroupText", type: "component", description: "Secondary text at the group's own size — a unit, a domain suffix, a counter. Inherits the size so it cannot drift from the input beside it." },
						{ name: "InputGroupInput / InputGroupTextarea", type: "component", description: "The kit's Input and Textarea with their chrome removed, because the group is drawing it. Every other prop passes through." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
