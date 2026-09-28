import { BellIcon, PlusIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "themelia-ui/base/avatar"
import { Button } from "themelia-ui/base/buttons"
import { SearchInput } from "themelia-ui/base/text-inputs"
import { Header } from "themelia-ui/layout/header"

import { FRAME, FRAME_BODY } from "./data"

export default function HeaderExample() {
	return (
		<div style={FRAME}>
			<Header
				breadcrumbs={[{ label: "Billing", href: "#/header" }, { label: "Invoices" }]}
				slots={{
					center: <SearchInput placeholder="Search invoices…" />,
					right: (
						<>
							<Button tone="neutral" appearance="outline">
								<PlusIcon />
								New
							</Button>
							<Button iconOnly tone="neutral" appearance="ghost" aria-label="Notifications">
								<BellIcon />
							</Button>
							<Avatar size="sm">
								<AvatarFallback>JM</AvatarFallback>
							</Avatar>
						</>
					),
				}}
			/>
			<div style={FRAME_BODY} />
		</div>
	)
}
