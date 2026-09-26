import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function KbdPage() {
	return (
		<ComponentPage>
			<Example
				example="kbd/kbd"
				title="Kbd"
				description="A key or a chord, as the browser's own <kbd>. Pass a chord as one string rather than nesting three of these — a screen reader announcing “K B D command K B D K” is worse than the plain text."
			/>

			<Example id="kbd-api" title="API">
				<PropTable symbols={["Kbd", "KbdGroup"]} />
			</Example>
		</ComponentPage>
	)
}
