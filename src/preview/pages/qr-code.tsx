import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function QRCodePage() {
	return (
		<ComponentPage>
			<Example
				example="qr-code/qr-code"
				title="QRCode"
				description="Drawn in the theme's foreground and background rather than fixed black-on-white, so it reads as part of the page and stays legible when the theme flips."
			/>

			<Example id="qr-api" title="API">
				<PropTable owner="QRCode" />
			</Example>
		</ComponentPage>
	)
}
