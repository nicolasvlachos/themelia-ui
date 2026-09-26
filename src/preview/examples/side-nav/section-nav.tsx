import { SectionNav } from "themelia-ui/layout/navigation"


export default function SectionNavExample() {
	return (
		<div style={{ maxWidth: "16rem", width: "100%" }}>
			<SectionNav
				items={[
					{ id: "side-nav", label: "SideNav" },
					{ id: "section-nav", label: "SectionNav" },
					{ id: "side-nav-api", label: "API", depth: 2 },
				]}
			/>
		</div>
	)
}
