import { useState } from "react"

import { OtpInput } from "@/components/base/otp-input"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function OtpInputPage() {
	const [code, setCode] = useState("")

	return (
		<ComponentPage
			title="One-time code input"
			summary="The field for a short code sent by text message or email, drawn one box per character so the reader can check it against the message at a glance. It stays a single input underneath, which is what lets paste and SMS autofill fill every box at once."
			importPath="@/components/base/otp-input"
			exports={["OtpInput"]}
		>
			<Example
				id="otp-input"
				title="OtpInput"
				description="A one-time code, one box per character — and ONE input underneath, which is what makes paste and SMS autofill work. Six separate inputs each take one character and drop the other five, which is the failure every hand-built version of this has."
				stacked
				code={`<OtpInput length={6} groupSize={3} value={code} onValueChange={setCode} />`}
			>
				<Stack gap="lg" align="start">
					<OtpInput length={6} value={code} onValueChange={setCode} />
					<Stack gap="xs" align="start">
						<Text size="xs" type="secondary">groupSize={"{3}"} — written as "123 456"</Text>
						<OtpInput length={6} groupSize={3} />
					</Stack>
				</Stack>
			</Example>

			<Example id="otp-input-api" title="API">
				<PropTable
					rows={[
						{ name: "OtpInput length / groupSize", type: "number", default: "6 / —", description: "How many boxes, and how they are grouped for the eye. The grouping never changes which character a box holds." },
						{ name: "OtpInput invalid", type: "boolean", default: "false", description: "Marks the code invalid as one field — a code is right or wrong as a whole, so every box shows it together." },
						{ name: "OtpInput strings", type: "Partial<OtpInputStrings>", description: "fieldLabel names the field, and with it the first box, when nothing else labels it; slotLabel(position, length) names each box — “Character 2 of 6”." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
