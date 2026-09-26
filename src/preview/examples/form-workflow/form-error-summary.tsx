import { Button } from "themelia-ui/base/buttons"
import { ErrorSummary } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"

export default function FormErrorSummary() {
	return (
		<Stack style={{ maxWidth: "34rem" }}>
			<ErrorSummary
				errors={[
					"Name is required.",
					"Email is not valid.",
					"VAT number does not match the selected country.",
				]}
				action={
					<Button tone="neutral" buttonStyle="outline">
						Review the first problem
					</Button>
				}
			/>
		</Stack>
	)
}
