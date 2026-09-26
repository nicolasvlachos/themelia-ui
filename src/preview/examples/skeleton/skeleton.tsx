import { Skeleton } from "themelia-ui/base/skeleton"
import { Stack } from "themelia-ui/base/structure"


export default function SkeletonExample() {
	return (
		<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
			<Skeleton style={{ width: "60%", height: "1.25rem" }} />
			<Skeleton style={{ width: "100%", height: "1rem" }} />
			<Skeleton style={{ width: "85%", height: "1rem" }} />
		</Stack>
	)
}
