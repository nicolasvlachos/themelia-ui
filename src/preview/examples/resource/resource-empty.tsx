import { PlusIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { StackedCardsIllustration } from "themelia-ui/base/feedback"
import { ResourceEmptyState } from "themelia-ui/features/resource"

export default function ResourceEmpty() {
	return (
		<ResourceEmptyState
			mediaVariant="illustration"
			media={<StackedCardsIllustration />}
			title="No invoices yet"
			description="Invoices appear here once a customer is billed."
			action={<Button><PlusIcon />New invoice</Button>}
			border
		/>
	)
}
