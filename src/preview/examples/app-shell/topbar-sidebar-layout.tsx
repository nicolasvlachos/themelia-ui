import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { PillRadioGroup } from "themelia-ui/base/choice-inputs"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { TopbarSidebarLayout } from "themelia-ui/layout/app-shell"
import { AppSidebar } from "themelia-ui/layout/sidebar"

import { demoLink } from "./_demo-link"
import { AdminContent, Brand } from "./_shared"
import { FRAME, NAVIGATION, PROVIDER } from "./data"

function TopbarDemo() {
	const [currentUrl, setCurrentUrl] = useState("/app/invoices")
	const [side, setSide] = useState<string | null>("left")
	const [query, setQuery] = useState("")
	const sidebarSide = side === "right" ? "right" : "left"

	return (
		<Stack style={{ width: "100%", minWidth: 0 }}>
			<PillRadioGroup
				aria-label="Navigation side"
				name="topbar-sidebar-side"
				value={side}
				onValueChange={setSide}
				options={[{ value: "left", label: "Left navigation" }, { value: "right", label: "Right navigation" }]}
			/>
			<div style={FRAME}>
				<TopbarSidebarLayout
					contained
					contentRender={<div />}
					sidebarProviderProps={PROVIDER}
					sidebarSide={sidebarSide}
					logo={<Brand />}
					headerActions={<Badge tone="neutral">Workspace</Badge>}
					sidebar={
						<AppSidebar
							side={sidebarSide}
							collapsible="icon"
							currentUrl={currentUrl}
							navigationGroups={NAVIGATION}
							renderLink={demoLink(setCurrentUrl)}
						/>
					}
				>
					<Stack>
						{currentUrl === "/app/invoices" && (
							<Input type="search" aria-label="Search invoices" placeholder="Search invoices…" value={query} onChange={event => setQuery(event.target.value)} />
						)}
						<AdminContent currentUrl={currentUrl} query={currentUrl === "/app/invoices" ? query : undefined} />
					</Stack>
				</TopbarSidebarLayout>
			</div>
		</Stack>
	)
}

export default function TopbarSidebarLayoutExample() {
	return (
		<TopbarDemo />
	)
}
