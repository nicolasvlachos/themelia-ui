import { Header } from "themelia-ui/layout/header"

import { FRAME, FRAME_BODY } from "./data"

export default function HeaderBreadcrumbsExample() {
	return (
		<div style={FRAME}>
			<Header
				homeCrumb={{ label: "Home", href: "#/header" }}
				/* A second trail on the page needs a distinct landmark name. */
				breadcrumbsStrings={{ label: "Settings breadcrumb example" }}
				breadcrumbs={[
					{ label: "Settings", href: "#/settings-shell" },
					{ label: "Members" },
				]}
			/>
			<div style={FRAME_BODY} />
		</div>
	)
}
