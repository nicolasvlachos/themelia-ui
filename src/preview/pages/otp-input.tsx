import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function OtpInputPage() {
	return (
		<ComponentPage>
			<Example
				example="otp-input/otp-input"
				title="OtpInput"
				description="A one-time code, one box per character — and ONE input underneath, which is what makes paste and SMS autofill work. Six separate inputs each take one character and drop the other five, which is the failure every hand-built version of this has."
			/>

			<Example id="otp-input-api" title="API">
				<PropTable owner="OtpInput" />
			</Example>
		</ComponentPage>
	)
}
