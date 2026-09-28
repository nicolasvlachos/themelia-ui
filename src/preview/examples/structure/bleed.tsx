import { Bleed } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function BleedExample() {
	return (
		<div style={{ width: "100%", padding: "var(--padding-sm)", border: "var(--border-width) solid var(--border)", borderRadius: "var(--radius-sm)" }}>
			<Text size="xs" type="secondary">A surface padded by --padding-sm.</Text>
			<Bleed amount="sm">
				<div style={{ background: "var(--muted)", padding: "calc(var(--padding-sm) / 2) var(--padding-sm)", marginBlock: "calc(var(--gap-sm) / 2)" }}>
					<Text size="xs">This band bleeds to both edges.</Text>
				</div>
			</Bleed>
			<Text size="xs" type="secondary">Inset content resumes here.</Text>
		</div>
	)
}
