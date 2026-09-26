import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CopyablePage() {
	return (
		<ComponentPage>
			<Example
				example="copyable/copyable"
				title="Copyable"
				description="The value stays passive and the copy button is its sibling. Wrapping the value in a button would nest one interactive element inside another the moment the value is an Email or a Url."
			/>

			<Example
				example="copyable/use-copy-to-clipboard"
				title="useCopyToClipboard"
				description="The behaviour without the markup, for an affordance that is not a value with a button beside it — a share action, a code block, a menu item. It owns the write, the confirmation window and the failure — the part every surface that writes its own gets slightly wrong."
			/>

			<Example id="copyable-api" title="API">
				<PropTable owner="Copyable" />
				<PropTable symbols={["useCopyToClipboard"]} />
			</Example>
		</ComponentPage>
	)
}
