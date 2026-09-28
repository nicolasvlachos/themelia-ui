import { Text } from "themelia-ui/base/typography"

export function Box({ children }: { children: React.ReactNode }) {
	return (
		<Text
			tag="div"
			size="sm"
			style={{
				padding: "var(--padding-sm) var(--padding)",
				borderRadius: "var(--radius-sm)",
				background: "var(--muted)",
			}}
		>
			{children}
		</Text>
	)
}
