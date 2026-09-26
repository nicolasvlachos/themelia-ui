import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { StackedLayout } from "themelia-ui/layout/app-shell"

import { AdminContent, Brand } from "./_shared"
import { FRAME } from "./data"

function StackedDemo() {
	const [currentUrl, setCurrentUrl] = useState("/app")
	const destinations = [["/app", "Overview"], ["/app/invoices", "Invoices"], ["/app/settings", "Settings"]] as const

	return (
		<div style={FRAME}>
			<StackedLayout
				contained
				boundContent={false}
				contentRender={<div />}
				header={
					<Stack direction="horizontal" gap="md" align="center" wrap>
						<Brand />
						<nav aria-label="Primary navigation (stacked example)">
							<Stack direction="horizontal" gap="xs" wrap>
								{destinations.map(([path, label]) => (
									<Button
										key={path}
										tone="neutral"
										buttonStyle={currentUrl === path ? "solid" : "ghost"}
										aria-current={currentUrl === path ? "page" : undefined}
										onClick={() => setCurrentUrl(path)}
									>{label}</Button>
								))}
							</Stack>
						</nav>
					</Stack>
				}
			>
				<AdminContent currentUrl={currentUrl} />
			</StackedLayout>
		</div>
	)
}

export default function StackedShell() {
	return (
		<StackedDemo />
	)
}
