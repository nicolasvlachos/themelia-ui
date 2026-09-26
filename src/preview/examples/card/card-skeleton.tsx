import { CardSkeleton } from "themelia-ui/base/cards"
import { Stack } from "themelia-ui/base/structure"

export default function CardSkeletonExample() {
	return (
		<Stack direction="horizontal" gap="lg" wrap align="start">
			<div style={{ width: "18rem" }}>
				<CardSkeleton showHeader lines={3} label="Loading invoice" />
			</div>
			<div style={{ width: "18rem" }}>
				<CardSkeleton surface="bordered" lines={2} label="Loading summary" />
			</div>
		</Stack>
	)
}
