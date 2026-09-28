import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { QRCode } from "themelia-ui/base/qr-code"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { Input } from "themelia-ui/base/text-inputs"


export default function QrCode() {
	const [qrValue, setQrValue] = useState("https://example.com/invoice/4417")

	return (
		<Stack direction="horizontal" align="start" wrap>
			<Stack style={{ maxWidth: "26rem", width: "100%" }}>
				<FormField label="Encoded value">
					<Input value={qrValue} onChange={(event) => setQrValue(event.target.value)} />
				</FormField>
				<FormField label="Empty" helperText="An empty value renders nothing at all, unless an emptyState is given.">
					<Input value="" readOnly />
				</FormField>
			</Stack>
			{/* Captioned, so each grid is attributable to its setting. */}
			<Stack direction="horizontal" wrap align="start">
				{[
					{ node: <QRCode value={qrValue} label="Invoice link" />, caption: 'robustness="M" — default' },
					{ node: <QRCode value={qrValue} robustness="H" label="Invoice link, high correction" />, caption: 'robustness="H" — denser grid' },
					{ node: <QRCode value="" emptyState="No link yet" />, caption: "empty, with an emptyState" },
				].map((item) => (
					<Stack key={item.caption} gap="sm" align="start">
						{item.node}
						<Text size="xs" type="secondary">{item.caption}</Text>
					</Stack>
				))}
			</Stack>
		</Stack>
	)
}
