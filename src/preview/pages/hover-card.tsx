import { Avatar, AvatarFallback } from "@/components/base/avatar"
import {
	HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/base/hover-card"
import { Stack } from "@/components/base/structure"
import { Text, TextLink } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function HoverCardPage() {
	return (
		<ComponentPage
			title="Hover card"
			summary="A preview that opens while the pointer rests on a name or a link — a person, an order, a page — so a reader can glance at it without leaving where they are. It is an accelerator, never a route: everything in it has to be one click away as well, because hover does not exist on touch."
			importPath="@/components/base/hover-card"
			exports={["HoverCard", "HoverCardTrigger", "HoverCardContent"]}
		>
			<Example
				id="hover-card"
				title="HoverCard"
				description="A preview that opens on hover. Distinct from Tooltip in what it may CONTAIN: a tooltip is a short string and is not reachable, this is a surface with structure a reader can move into. That is why it has a close delay — the gap between trigger and card is exactly where the pointer travels to read it."
				stacked
				code={`<HoverCard>
  <HoverCardTrigger render={<TextLink href="/people/jane" />}>@jane</HoverCardTrigger>
  <HoverCardContent>…</HoverCardContent>
</HoverCard>`}
			>
				<Text>
					Assigned to{" "}
					<HoverCard>
						{/* A real link, as the rule below asks: the card previews where it goes. */}
						<HoverCardTrigger render={<TextLink href="/people/jane" onClick={(event) => event.preventDefault()} />}>
							@jane
						</HoverCardTrigger>
						<HoverCardContent>
							<Stack direction="horizontal" gap="md" align="start">
								<Avatar>
									<AvatarFallback>JM</AvatarFallback>
								</Avatar>
								<Stack gap="2xs">
									<Text weight="medium">Jane McDonald</Text>
									<Text size="xs" type="secondary">Billing · joined March 2024</Text>
								</Stack>
							</Stack>
						</HoverCardContent>
					</HoverCard>{" "}
					on 1 September.
				</Text>
			</Example>

			<Example id="hover-card-rule" title="Hover is an accelerator" stacked>
				<Callout label="Rule">
					Nothing inside a <code>HoverCard</code> may be the only route to anything. Hover
					does not exist on touch, and a preview is a convenience for a pointer — the
					information in it has to be reachable by following the link it hangs off.
				</Callout>
			</Example>

			<Example id="hover-card-api" title="API">
				<PropTable
					rows={[
						{ name: "HoverCardTrigger delay / closeDelay", type: "number", default: "400 / 200", description: "The delays live on the TRIGGER. closeDelay is the load-bearing one: without it the card closes as the pointer leaves the trigger, and the gap between the two is where the pointer has to travel." },
						{ name: "HoverCardTrigger / HoverCardContent", type: "component", description: "What opens the card and what it shows. Hover AND focus open it, because a card reachable only by pointer is unreachable to a keyboard." },
						{ name: "HoverCardContent side / align / sideOffset", api: ["HoverCardContent.side", "HoverCardContent.align", "HoverCardContent.sideOffset"], type: '"top" | "right" | "bottom" | "left" / "start" | "center" | "end" / number', default: '"bottom" / "center" / 8', description: "Where the card opens relative to its trigger, and the gap between them." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
