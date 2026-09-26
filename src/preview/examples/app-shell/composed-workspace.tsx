import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { StackedLayout } from "themelia-ui/layout/app-shell"
import { WorkspaceLayout, WorkspaceNav } from "themelia-ui/layout/workspace"

import { Brand, InvoiceContent, SettingsContent } from "./_shared"
import { FRAME } from "./data"

function WorkspaceDemo() {
	const [section, setSection] = useState("details")
	return (
		<div style={FRAME}>
			<StackedLayout contained boundContent={false} contentRender={<div />} header={<Brand />} headerEnd={<Badge tone="neutral">Settings</Badge>}>
				<WorkspaceLayout
					contentRender={<div />}
					contentWidth="full"
					sidebar={
						<WorkspaceNav
							aria-label="Record sections (workspace example)"
							activeId={section}
							onSelect={item => setSection(item.id)}
							groups={[{ id: "settings", label: "Workspace", items: [
								{ id: "details", label: "Details", completion: 100 },
								{ id: "billing", label: "Billing", completion: 50 },
							] }]}
						/>
					}
				>
					{section === "details" ? <SettingsContent /> : <InvoiceContent />}
				</WorkspaceLayout>
			</StackedLayout>
		</div>
	)
}

export default function ComposedWorkspace() {
	return (
		<WorkspaceDemo />
	)
}
