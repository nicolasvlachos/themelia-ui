import {
	ContentSkeleton, PageSkeleton, TableSkeleton, TwoColumnPageSkeleton,
} from "themelia-ui/base/skeleton"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function Composed() {
	return (
		<Stack style={{ width: "100%" }}>
			<Stack gap="sm">
				<Text size="xs" type="secondary">ContentSkeleton</Text>
				<ContentSkeleton lines={3} />
			</Stack>
			<Stack gap="sm">
				<Text size="xs" type="secondary">TableSkeleton</Text>
				<TableSkeleton rows={4} columns={3} />
			</Stack>
			<Stack gap="sm">
				<Text size="xs" type="secondary">PageSkeleton</Text>
				<PageSkeleton blocks={2} />
			</Stack>
			<Stack gap="sm">
				<Text size="xs" type="secondary">TwoColumnPageSkeleton</Text>
				<TwoColumnPageSkeleton />
			</Stack>
		</Stack>
	)
}
