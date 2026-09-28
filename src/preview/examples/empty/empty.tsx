import { InboxIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Empty } from "themelia-ui/base/feedback"

export default function EmptyExample() {
	return (
		<Empty
			media={<InboxIcon />}
			mediaVariant="icon"
			title="No invoices yet"
			description="Invoices appear here once a customer is billed. Nothing has been sent on this account."
			action={
				<>
					<Button>Create invoice</Button>
					<Button tone="neutral" appearance="outline">
						Import
					</Button>
				</>
			}
			footer="Imported invoices keep their original numbering."
		/>
	)
}
