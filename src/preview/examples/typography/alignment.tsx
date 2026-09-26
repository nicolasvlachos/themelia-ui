import { Text } from "themelia-ui/base/typography"


export default function Alignment() {
	return (
		<div style={{ maxWidth: "26rem", width: "100%", borderInline: "1px dashed var(--border)" }}>
			<Text align="left">left — the default</Text>
			<Text align="center">center</Text>
			<Text align="right" numeric>1,234.50</Text>
			<Text align="right" numeric>42.00</Text>
		</div>
	)
}
