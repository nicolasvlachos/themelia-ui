import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "themelia-ui/base/resizable"
import { Text } from "themelia-ui/base/typography"

const FRAME: React.CSSProperties = {
	width: "100%",
	height: "12rem",
	border: "1px solid var(--border)",
	borderRadius: "var(--radius)",
	overflow: "hidden",
}

export default function Resizable() {
	return (
		<div style={FRAME}>
			<ResizablePanelGroup orientation="horizontal">
				<ResizablePanel defaultSize="65%">
					<div style={{ padding: "var(--padding)" }}>
						<Text size="sm" type="secondary">The document</Text>
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel defaultSize="35%">
					<div style={{ padding: "var(--padding)" }}>
						<Text size="sm" type="secondary">The inspector</Text>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	)
}
