import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { QRCode } from "@/components/base/qr-code"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { Input } from "@/components/base/text-inputs"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function QRCodePage() {
	const [qrValue, setQrValue] = useState("https://example.com/invoice/4417")

	return (
		<ComponentPage
			title="QR code"
			summary="A scannable symbol drawn in the theme's own colours, as SVG so it scales and prints without blurring."
			importPath="@/components/base/qr-code"
			exports={["QRCode"]}
		>
			<Example
				id="qr-code"
				title="QRCode"
				description="Drawn in the theme's foreground and background rather than fixed black-on-white, so it reads as part of the page and stays legible when the theme flips."
				stacked
				code={`<QRCode value={url} robustness="M" />`}
			>
				<Stack direction="horizontal" gap="xl" align="start" wrap>
					<Stack gap="lg" style={MEASURE.field}>
						<FormField label="Encoded value">
							<Input value={qrValue} onChange={(event) => setQrValue(event.target.value)} />
						</FormField>
						<FormField label="Empty" helperText="An empty value renders nothing at all, unless an emptyState is given.">
							<Input value="" readOnly />
						</FormField>
					</Stack>
					{/* Captioned, so each grid is attributable to its setting. */}
					<Stack direction="horizontal" gap="lg" wrap align="start">
						{[
							{ node: <QRCode value={qrValue} label="Invoice link" />, caption: 'robustness="M" — default' },
							{ node: <QRCode value={qrValue} robustness="H" label="Invoice link, high correction" />, caption: 'robustness="H" — denser grid' },
							{ node: <QRCode value="" emptyState="No link yet" />, caption: "empty, with an emptyState" },
						].map((item) => (
							<Stack key={item.caption} gap="2xs" align="start">
								{item.node}
								<Text size="xs" type="secondary">{item.caption}</Text>
							</Stack>
						))}
					</Stack>
				</Stack>
			</Example>

			<Example id="qr-api" title="API">
				<PropTable owner="QRCode"
					rows={[
						{ name: "value", type: "string", description: "What the symbol encodes. An empty value renders the placeholder, or nothing at all unless emptyState is given." },
						{ name: "robustness", type: '"L" | "M" | "Q" | "H"', default: '"M"', description: "How much can be obscured and still decode — roughly 7, 15, 25, 30%. Higher needs a denser grid." },
						{ name: "foreground / background", type: "string", description: "Overrides the theme colours. Any CSS colour; converted to hex for the encoder." },
						{ name: "label", type: "string", description: "Announced in place of the symbol, which is meaningless to a screen reader." },
						{ name: "placeholder / emptyState", type: "ReactNode", description: "Shown while encoding or on failure, and when there is nothing to encode." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
