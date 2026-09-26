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
				<PropTable
					rows={[
						{ name: "Kbd", type: "component", description: "One key, or one chord pressed together written as a single string — “⌘K”, not three caps. Every native kbd attribute passes through." },
						{ name: "KbdGroup", type: "component", description: "Several Kbd in a row, for a sequence pressed one after another — “G then I”. The caps sit further apart than the characters inside one, and that gap is what tells a reader the keys are pressed in turn rather than together." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
