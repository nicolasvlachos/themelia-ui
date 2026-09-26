import {
	ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from "@/components/base/resizable"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const FRAME: React.CSSProperties = {
	width: "100%",
	height: "12rem",
	border: "1px solid var(--border)",
	borderRadius: "var(--radius)",
	overflow: "hidden",
}

export function ResizablePage() {
	return (
		<ComponentPage
			title="Resizable panels"
			summary="Split panes the reader drags apart — a document beside its inspector, a list beside its detail. Reach for it when the reader, not the layout, knows how much room each side deserves; a split nobody needs to move is a Grid."
			importPath="@/components/base/resizable"
			exports={["ResizablePanelGroup", "ResizablePanel", "ResizableHandle"]}
		>
			<Example
				id="resizable"
				title="Resizable"
				description="Split panes with a real separator — role=separator and arrow-key support, which is what makes this different from a div with a mousedown listener. Keep the layout in your own state with `onLayoutChanged` and hand it back through `defaultLayout`; a reader who widened the inspector expects it wide next time."
				stacked
				code={`<ResizablePanelGroup orientation="horizontal" defaultLayout={savedLayout} onLayoutChanged={saveLayout}>
  <ResizablePanel defaultSize="65%">…</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize="35%">…</ResizablePanel>
</ResizablePanelGroup>`}
			>
				<div style={FRAME}>
					<ResizablePanelGroup orientation="horizontal">
						<ResizablePanel defaultSize="65%">
							<div style={{ padding: "var(--space-lg)" }}>
								<Text size="sm" type="secondary">The document</Text>
							</div>
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize="35%">
							<div style={{ padding: "var(--space-lg)" }}>
								<Text size="sm" type="secondary">The inspector</Text>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</Example>

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
