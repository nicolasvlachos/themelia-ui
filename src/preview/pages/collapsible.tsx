import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/base/display"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CollapsiblePage() {
	return (
		<ComponentPage
			title="Collapsible"
			summary="One region that opens and closes. Where Accordion manages a set of sections, Collapsible is a single disclosure with no siblings to coordinate."
			importPath="@/components/base/display"
			exports={["Collapsible", "CollapsibleTrigger", "CollapsibleContent"]}
		>
			<Example
				id="collapsible"
				title="Collapsible"
				description="Animates to the content's own height using grid-template-rows 0fr to 1fr — height: auto is not an animatable value, and this reaches the same result without measuring anything in JavaScript."
				stacked
				code={`<Collapsible>
  <CollapsibleTrigger>Advanced options</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
			>
				<Collapsible>
					<CollapsibleTrigger>
						<Text tag="span" size="sm" weight="medium">
							Advanced options
						</Text>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<Stack gap="sm" style={{ paddingTop: "var(--space-md)" }}>
							<Text type="secondary" size="sm">
								Content that expands to its natural height.
							</Text>
							<Text type="secondary" size="sm">
								However many lines it happens to be.
							</Text>
						</Stack>
					</CollapsibleContent>
				</Collapsible>
			</Example>

			<Example id="collapsible-api" title="API">
				<PropTable owner="Collapsible"
					rows={[
						{ name: "open / defaultOpen", type: "boolean", description: "Controlled and uncontrolled state." },
						{ name: "onOpenChange", type: "(open: boolean) => void", description: "Fires on every toggle, from the pointer or the keyboard." },
						{ name: "CollapsibleTrigger", type: "component", description: "The control. Carries aria-expanded and points at the content." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
