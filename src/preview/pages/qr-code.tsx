import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function QRCodePage() {
	return (
		<ComponentPage
			title="QR code"
			summary="A scannable symbol drawn in the theme's own colours, as SVG so it scales and prints without blurring."
			importPath="@/components/base/qr-code"
			exports={["QRCode"]}
		>
			<Example
				example="qr-code/qr-code"
				title="QRCode"
				description="Drawn in the theme's foreground and background rather than fixed black-on-white, so it reads as part of the page and stays legible when the theme flips."
				stacked
			/>

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
