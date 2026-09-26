import { InfoIcon } from "lucide-react"

import { Button, TooltipButton } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/base/tooltip"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function TooltipPage() {
	return (
		<ComponentPage
			title="Tooltip"
			summary="A short explanation on hover and on focus. It is never the only place a piece of information lives — a tooltip is unreachable on touch and gone the moment the pointer moves."
			importPath="@/components/base/tooltip"
			exports={["Tooltip", "TooltipTrigger", "TooltipContent", "TooltipProvider"]}
		>
			<Example
				id="tooltip"
				title="Tooltip"
				description="The trigger has to be a real focusable element, so the tip opens on keyboard focus and not only on hover."
				stacked
				code={`<Tooltip>
  <TooltipTrigger render={<Button buttonStyle="outline" tone="neutral" />}>
    Hover me
  </TooltipTrigger>
  <TooltipContent>Explains the control.</TooltipContent>
</Tooltip>`}
			>
				<Stack direction="horizontal" gap="lg" align="center" wrap>
					<Tooltip>
						<TooltipTrigger render={<Button buttonStyle="outline" tone="neutral" />}>
							Hover or focus
						</TooltipTrigger>
						<TooltipContent>Charged on the first of the month.</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger render={<Button buttonStyle="ghost" tone="neutral" iconOnly aria-label="About billing" />}>
							<InfoIcon />
						</TooltipTrigger>
						<TooltipContent>An icon-only control still needs a name of its own.</TooltipContent>
					</Tooltip>

					<TooltipButton tooltip="TooltipButton wires the two together" buttonStyle="outline" tone="neutral">
						TooltipButton
					</TooltipButton>
				</Stack>
			</Example>

			<Example id="tooltip-rule" title="Never the only copy" stacked>
				<Callout label="Rule">
					A tooltip cannot be opened on a touch screen and disappears the moment the
					pointer moves, so nothing a reader NEEDS may live only here. It is for the
					second sentence, not the first. An icon-only control still needs its own{" "}
					<code>aria-label</code> — the tip is not a substitute for a name.
				</Callout>
			</Example>

			<Example id="tooltip-api" title="API">
				<PropTable
					rows={[
						{ name: "TooltipTrigger render", type: "ReactElement", description: "The element the tip anchors to. Must be focusable, or the tip is hover-only." },
						{ name: "TooltipContent", type: "component", description: "The tip. Short — a sentence, not a paragraph." },
						{ name: "TooltipProvider delay", type: "number", description: "Shared open delay. Wrap the app once rather than per tooltip." },
						{ name: "TooltipButton tooltip", type: "ReactNode", description: "A button and its tip in one component, for the common case." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
