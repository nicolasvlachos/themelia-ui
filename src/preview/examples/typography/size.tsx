import { Text } from "themelia-ui/base/typography"

export default function Size() {
	return (
		<>
			{(["xs", "pxs", "sm", "base", "lg", "xl"] as const).map((size) => (
				<Text key={size} size={size}>
					{size} — the quick brown fox jumps over the lazy dog
				</Text>
			))}
		</>
	)
}
