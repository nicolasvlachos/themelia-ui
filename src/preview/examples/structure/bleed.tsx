import { Bleed } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function BleedExample() {
	return (
		<div style={{ width: "100%", padding: "var(--space-md)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
			<Text size="xs" type="secondary">A surface padded by --space-md.</Text>
			<Bleed amount="md">
				<div style={{ background: "var(--muted)", padding: "var(--space-sm) var(--space-md)", marginBlock: "var(--space-sm)" }}>
					<Text size="xs">This band bleeds to both edges.</Text>
				</div>
			</Bleed>
			<Text size="xs" type="secondary">Inset content resumes here.</Text>
		</div>
	)
}
