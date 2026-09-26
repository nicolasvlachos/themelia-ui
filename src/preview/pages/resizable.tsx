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
				<PropTable owners={["ResizablePanelGroup", "ResizablePanel", "ResizableHandle"]} />
			</Example>
		</ComponentPage>
	)
}
