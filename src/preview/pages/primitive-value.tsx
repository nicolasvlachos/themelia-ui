import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveValuePage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-value/value"
				title="Value"
				description="Every primitive below is a Value underneath, which is why they all agree on what an empty value looks like."
			/>

			<Example id="value-rule" title="Absent is a state">
				<Callout label="Rule">
					A primitive given <code>null</code> or <code>undefined</code> renders the empty
					mark, not an empty string. A blank cell and a cell whose value is genuinely
					unknown look identical, and only one of them is a bug — the reader deserves to
					be able to tell.
				</Callout>
			</Example>

			<Example
				example="primitive-value/inline-list"
				title="Inline list"
				description="Intl.ListFormat knows where the conjunction goes and whether a comma precedes it. Spanish switches y to e before an /i/ sound; Japanese uses a particle. Three places in this kit joined user-visible lists with .join(', '), which is correct in no locale including English."
			/>

			<Example
				example="primitive-value/inline-list-locale"
				title="The same list, three locales"
				description="Nothing about the component changes between these — the separator, the conjunction and the serial comma are all the locale's decision."
			/>

			<Example id="value-api" title="Value API">
				<PropTable owner="Value" />
				<PropTable symbols={["SecondaryValue", "MutedValue", "MonoValue", "EmptyValue"]} />
			</Example>

			<Example id="inline-list-api" title="InlineList API">
				<PropTable owner="InlineList" />
			</Example>
		</ComponentPage>
	)
}
