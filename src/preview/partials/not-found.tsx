import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom"

import { Button } from "@/components/base/buttons"
import { Empty } from "@/components/base/feedback"

/** The page an unknown URL lands on. `Empty` carries `role="status"`, so arrival is announced. */
export function NotFoundPage() {
	const { pathname } = useLocation()

	return (
		<Empty
			title="No page at this address"
			description={`Nothing is routed to ${pathname}. It may have been renamed, or the link may be a guess.`}
			action={
				<Button render={<Link to="/" />}>Go to the introduction</Button>
			}
			border
		/>
	)
}
