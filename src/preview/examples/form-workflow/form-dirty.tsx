import { Button } from "themelia-ui/base/buttons"
import { DirtyStateBanner } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"

export default function FormDirty() {
	return (
		<Stack style={{ maxWidth: "34rem" }}>
			{(["neutral", "info", "warning"] as const).map((tone) => (
				<DirtyStateBanner
					key={tone}
					tone={tone}
					actions={
						<>
							<Button tone="neutral" appearance="outline">
								Discard
							</Button>
							<Button>Save</Button>
						</>
					}
				/>
			))}
		</Stack>
	)
}
