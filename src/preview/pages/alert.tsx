import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function AlertPage() {
	return (
		<ComponentPage>
			<Example
				example="alert/alert"
				title="Alert"
				description="A tinted surface carrying its own hue: a low-alpha fill and a slightly stronger border. The text does not take the hue — it stays card-foreground in every tone, and only the leading icon is coloured, which is what keeps every tone legible in both themes. The first three carry no glyph because none is conventional: there is no icon for emphasis, and none for a fact."
			/>

			<Example
				example="alert/alert-layout"
				title="Alert layout"
				description="The layout reconfigures from its own content: the leading glyph turns the grid into two columns and pushes the title across; an action reserves inline space so text never runs under it. The glyph comes from the tone — pass icon to replace it, or icon={false} to drop it. Passing one as a CHILD instead renders it on top of the tone's own, in the same grid cell."
			/>

			<Example id="alert-accessibility" title="Accessibility">
				<Callout>
					Only a <code>destructive</code> alert gets <code>role="alert"</code>, which
					interrupts a screen reader mid-sentence. Every other tone uses{" "}
					<code>role="status"</code> and is announced at the next pause, because cutting
					someone off to tell them a save succeeded is worse than waiting a moment.
				</Callout>
			</Example>

			<Example id="alert-api" title="API">
				<PropTable owners={["Alert", "AlertMetadata"]} />
				<PropTable symbols={["AlertTitle", "AlertDescription", "AlertAction"]} />
			</Example>
		</ComponentPage>
	)
}
