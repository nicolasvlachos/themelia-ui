import { Separator } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"


export default function SeparatorVariants() {
	return (
		<Stack gap="xl" style={{ maxWidth: "26rem", width: "100%" }}>
			<Stack gap="xs">
				<Text size="xs" type="secondary">solid</Text>
				<Separator />
			</Stack>
			<Stack gap="xs">
				<Text size="xs" type="secondary">dashed</Text>
				<Separator variant="dashed" />
			</Stack>
			<Stack gap="xs">
				<Text size="xs" type="secondary">dotted</Text>
				<Separator variant="dotted" />
			</Stack>
			<Stack gap="xs">
				<Text size="xs" type="secondary">thickness=&#123;2&#125;</Text>
				<Separator thickness={2} />
			</Stack>
			<Stack direction="horizontal" gap="lg" style={{ height: "3rem" }}>
				<Text size="sm">Vertical</Text>
				<Separator orientation="vertical" variant="dashed" />
				<Text size="sm">rules</Text>
				<Separator orientation="vertical" thickness={2} />
				<Text size="sm">too</Text>
			</Stack>
		</Stack>
	)
}
