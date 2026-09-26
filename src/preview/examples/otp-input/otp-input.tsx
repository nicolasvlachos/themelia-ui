import { useState } from "react"

import { OtpInput } from "themelia-ui/base/otp-input"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

export default function OtpInputExample() {
	const [code, setCode] = useState("")

	return (
		<Stack gap="lg" align="start">
			<OtpInput length={6} value={code} onValueChange={setCode} />
			<Stack gap="xs" align="start">
				<Text size="xs" type="secondary">groupSize={"{3}"} — written as "123 456"</Text>
				<OtpInput length={6} groupSize={3} />
			</Stack>
		</Stack>
	)
}
