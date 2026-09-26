import { useState } from "react"

import { Badge } from "themelia-ui/base/badge"
import { PillRadioGroup } from "themelia-ui/base/choice-inputs"
import type { SidebarCollapsible, SidebarVariant } from "themelia-ui/base/sidebar"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { SidebarInsetLayout } from "themelia-ui/layout/app-shell"
import { AppSidebar } from "themelia-ui/layout/sidebar"

import { demoLink } from "./_demo-link"
import { AdminContent, Brand, BrandMark } from "./_shared"
import { FRAME, NAVIGATION, PROVIDER } from "./data"

function ShellDemo({ variant, collapsible }: { variant: SidebarVariant; collapsible: SidebarCollapsible }) {
	const [currentUrl, setCurrentUrl] = useState("/app/settings/members")
	return <div style={FRAME}>
		<SidebarInsetLayout contentRender={<div />} contained sidebarProviderProps={PROVIDER}
			showTrigger={collapsible !== "none"} ruledToolbar={variant !== "inset"}
			toolbar={<Text weight="medium">Workspace</Text>} toolbarEnd={<Badge tone="neutral">{variant}</Badge>}
			sidebar={<AppSidebar variant={variant} collapsible={collapsible} currentUrl={currentUrl} navigationGroups={NAVIGATION}
				liveBadges={{ invoices: 2 }} logo={<Brand />} collapsedLogo={<BrandMark />} renderLink={demoLink(setCurrentUrl)} />}
		><AdminContent currentUrl={currentUrl} /></SidebarInsetLayout>
	</div>
}

export default function SidebarShell() {
	const [variant, setVariant] = useState<string | null>("sidebar")
	const [collapsible, setCollapsible] = useState<string | null>("icon")

	return (
		<Stack gap="lg" style={{ width: "100%" }}>
			<Stack direction="horizontal" gap="xl" wrap>
				<Stack gap="2xs">
					<Text size="xs" type="secondary">
						variant
					</Text>
					<PillRadioGroup
						aria-label="Sidebar surface"
						name="sidebar-variant"
						value={variant}
						onValueChange={setVariant}
						options={[
							{ value: "sidebar", label: "sidebar" },
							{ value: "floating", label: "floating" },
							{ value: "inset", label: "inset" },
						]}
					/>
				</Stack>
				<Stack gap="2xs">
					<Text size="xs" type="secondary">
						collapsible
					</Text>
					<PillRadioGroup
						aria-label="Sidebar collapse behavior"
						name="sidebar-collapsible"
						value={collapsible}
						onValueChange={setCollapsible}
						options={[
							{ value: "icon", label: "icon" },
							{ value: "offcanvas", label: "offcanvas" },
							{ value: "none", label: "none" },
						]}
					/>
				</Stack>
			</Stack>
			<ShellDemo
				key={`${variant}-${collapsible}`}
				variant={(variant ?? "sidebar") as SidebarVariant}
				collapsible={(collapsible ?? "icon") as SidebarCollapsible}
			/>
		</Stack>
	)
}
