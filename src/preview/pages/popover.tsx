import { CalendarIcon, InfoIcon, SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Checkbox } from "@/components/base/choice-inputs"
import {
	Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverFooter, PopoverHeader,
	PopoverTitle, PopoverTrigger,
} from "@/components/base/popover"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PopoverPage() {
	return (
		<ComponentPage
			title="Popover"
			summary="A panel anchored to a trigger. Not a modal: the page stays live behind it, focus is not trapped, and dismissing it costs a click outside. For a decision the reader must answer, that is a dialog; for a name on hover, that is a tooltip. This is the one in between — a filter, a settings pane, a definition worth reading."
			importPath="@/components/base/popover"
			exports={[
				"Popover", "PopoverTrigger", "PopoverAnchor", "PopoverContent", "PopoverHeader",
				"PopoverTitle", "PopoverDescription", "PopoverFooter",
			]}
		>
			<Example
				id="popover"
				title="Anatomy"
				description="Trigger and content, with optional header, title, description and footer inside. The title and description are wired to the panel's accessible name and description, so a panel without them announces as an unnamed group."
				stacked
				code={`<Popover>
  <PopoverTrigger render={<Button>Filters</Button>} />
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Filters</PopoverTitle>
      <PopoverDescription>Narrow the list.</PopoverDescription>
    </PopoverHeader>
    …
    <PopoverFooter>…</PopoverFooter>
  </PopoverContent>
</Popover>`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					<Popover>
						<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
							<SlidersHorizontalIcon aria-hidden="true" />
							Filters
						</PopoverTrigger>
						<PopoverContent>
							<PopoverHeader>
								<PopoverTitle>Filters</PopoverTitle>
								<PopoverDescription>Narrow the list to what you are looking for.</PopoverDescription>
							</PopoverHeader>
							<Stack gap="sm">
								<Checkbox label="Unfulfilled" defaultChecked />
								<Checkbox label="Refunded" />
								<Checkbox label="On hold" />
							</Stack>
							<PopoverFooter>
								<Button tone="neutral" buttonStyle="ghost">
									Reset
								</Button>
								<Button>Apply</Button>
							</PopoverFooter>
						</PopoverContent>
					</Popover>

					<Popover>
						<PopoverTrigger render={<Button tone="neutral" buttonStyle="ghost" iconOnly aria-label="About this figure" />}>
							<InfoIcon aria-hidden="true" />
						</PopoverTrigger>
						<PopoverContent width="18rem">
							<Text size="xs" type="secondary">
								Blended margin is computed after carrier surcharges and before tax. A panel is
								the right home for a sentence like this — a tooltip would vanish before it
								could be read.
							</Text>
						</PopoverContent>
					</Popover>
				</Stack>
			</Example>

			<Example
				id="popover-placement"
				title="side, align and width"
				description="`side` and `align` place the panel against its trigger, and it flips when there is no room. `width=&quot;trigger&quot;` matches the control it opened from — what a select-like panel wants — and `auto` sizes to the content up to the space actually available."
				stacked
				code={`<PopoverContent side="right" align="start" width="trigger" />`}
			>
				<Stack direction="horizontal" gap="lg" wrap>
					{(["top", "right", "bottom", "left"] as const).map((side) => (
						<Popover key={side}>
							<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
								{side}
							</PopoverTrigger>
							<PopoverContent side={side}>
								<Text size="xs">side=&quot;{side}&quot;</Text>
							</PopoverContent>
						</Popover>
					))}
					<Popover>
						<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
							width=&quot;trigger&quot;
						</PopoverTrigger>
						<PopoverContent width="trigger">
							<Text size="xs">Matches the control it opened from.</Text>
						</PopoverContent>
					</Popover>
				</Stack>
			</Example>

			<Example
				id="popover-anchor"
				title="PopoverAnchor"
				description="Separates what the panel points AT from what opens it. For a panel opened by a toolbar button but anchored to the selection it acts on, or opened by a row's menu and anchored to the row."
				stacked
				code={`<Popover>
  <PopoverAnchor>
    <Text>The panel points here…</Text>
  </PopoverAnchor>
  <PopoverTrigger render={<Button>…but this opens it</Button>} />
  <PopoverContent>…</PopoverContent>
</Popover>`}
			>
				<Popover>
					<Stack direction="horizontal" gap="2xl" align="center">
						<PopoverAnchor>
							<Text size="xs" type="secondary">
								<CalendarIcon aria-hidden="true" /> 14–28 August
							</Text>
						</PopoverAnchor>
						<PopoverTrigger render={<Button tone="neutral" buttonStyle="outline" />}>
							Change the range
						</PopoverTrigger>
					</Stack>
					<PopoverContent>
						<Text size="xs">Anchored to the date, opened by the button.</Text>
					</PopoverContent>
				</Popover>
			</Example>

			<Example id="popover-rule" title="Panel, not dialog" stacked>
				<Callout label="Rule">
					A popover leaves the page live and focus untrapped. If the reader must answer before
					continuing, that is <code>base/dialog</code>. If the content is a name for a control,
					that is <code>base/tooltip</code>, which is faster and announces as a description.
					A popover is for content worth reading that the page can survive being read beside.
				</Callout>
			</Example>

			<Example id="popover-api" title="API">
				<PropTable
					rows={[
						{ name: "PopoverContent side / align", type: '"top" | "right" | "bottom" | "left" / "start" | "center" | "end"', default: '"bottom" / "center"', description: "Where the panel sits against its anchor. It flips when the chosen side has no room." },
						{ name: "PopoverContent sideOffset / alignOffset", type: "number", default: "4 / 0", description: "The gap to the anchor along each axis." },
						{ name: "PopoverContent width / minWidth / maxWidth", type: 'string | number | "auto" | "trigger"', description: '"trigger" matches the control it opened from, which is what a select-like panel wants. "auto" sizes to the content, capped by the space actually available.' },
						{ name: "PopoverContent inset", type: '"padded" | string', default: '"padded"', description: "The panel's own inset. Drop it for content that draws its own edges — a calendar, a list that runs to the border." },
						{ name: "PopoverContent disablePortal", type: "boolean", default: "false", description: "Keeps the panel in place in the DOM. Portalling is the default because an ancestor that clips or transforms would otherwise cut the panel off." },
						{ name: "PopoverTrigger / PopoverAnchor", type: "component", description: "What opens the panel and what it points at. They are separate so a toolbar button can open a panel anchored to the thing it acts on." },
						{ name: "PopoverHeader / PopoverTitle / PopoverDescription / PopoverFooter", type: "component", description: "Title and description are wired to the panel's accessible name and description — without them it announces as an unnamed group." },
						{ name: "PopoverContent initialFocus / finalFocus", type: "boolean | RefObject | (interactionType) => HTMLElement | boolean", description: "Where focus lands on open and returns on close, from Base UI's popup. false leaves focus where it is." },
						{ name: "Popover onOpenChange", type: "(open, eventDetails) => void", description: "What an outside interaction does: eventDetails.reason is \"outside-press\", and eventDetails.cancel() keeps the panel open through a click that belongs to it." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
