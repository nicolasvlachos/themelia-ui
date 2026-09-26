import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area"
import { renderToReadableStream } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { CSPProvider } from "./index"

async function renderBaseUiStyle(props: { nonce?: string; disableStyleElements?: boolean }) {
	const renderOptions = props.nonce
		? ({ nonce: { script: props.nonce, style: props.nonce } } as unknown as Parameters<
				typeof renderToReadableStream
			>[1])
		: undefined
	const stream = await renderToReadableStream(
		<CSPProvider {...props}>
			<BaseScrollArea.Root>
				<BaseScrollArea.Viewport>
					<BaseScrollArea.Content>Scrollable content</BaseScrollArea.Content>
				</BaseScrollArea.Viewport>
			</BaseScrollArea.Root>
		</CSPProvider>,
		renderOptions,
	)
	await stream.allReady
	return new Response(stream).text()
}

describe("CSPProvider", () => {
	it("propagates a nonce to inline styles created by Base UI", async () => {
		const markup = await renderBaseUiStyle({ nonce: "request-nonce" })

		expect(markup).toContain('nonce="request-nonce"')
		expect(markup).toContain("base-ui-disable-scrollbar")
	})

	it("can suppress Base UI style elements for a stylesheet-only CSP", async () => {
		const markup = await renderBaseUiStyle({ disableStyleElements: true })

		expect(markup).not.toContain("<style")
	})
})
