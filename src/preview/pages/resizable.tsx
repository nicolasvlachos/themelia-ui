import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function ResizablePage() {
	return (
		<ComponentPage>
			<Example
				example="resizable/resizable"
				title="Resizable"
				description="Split panes with a real separator — role=separator and arrow-key support, which is what makes this different from a div with a mousedown listener. Keep the layout in your own state with `onLayoutChanged` and hand it back through `defaultLayout`; a reader who widened the inspector expects it wide next time."
			/>

			<Example id="resizable-api" title="API">
				<PropTable
					rows={[
						{ name: "ResizablePanelGroup orientation", type: '"horizontal" | "vertical"', description: "The axis of the split. Use defaultLayout and onLayoutChanged to own persistence." },
						{ name: "ResizableHandle withHandle", type: "boolean", default: "false", description: "Draws a grip on the line. The hit area is wider than the 1px rule either way." },
						{ name: "ResizablePanel / ResizableHandle", type: "component", description: "A panel inside a ResizablePanelGroup and the grip between two. The handle is focusable and takes arrow keys, so the split is adjustable without a pointer." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
