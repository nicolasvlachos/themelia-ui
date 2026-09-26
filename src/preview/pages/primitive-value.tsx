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
				<PropTable owner="Value"
					rows={[
						{ name: "children", type: "ReactNode", description: "The value. null or undefined renders the empty mark." },
						{ name: "SecondaryValue / MutedValue", type: "component", description: "The same value, one and two steps quieter." },
						{ name: "MonoValue", type: "component", description: "Tabular figures and a mono face, for ids and codes that are compared by eye." },
						{ name: "EmptyValue", type: "component", description: "The empty mark on its own." },
					]}
				/>
			</Example>

			<Example id="inline-list-api" title="InlineList API">
				<PropTable owner="InlineList"
					rows={[
						{ name: "items", type: "readonly string[] | null", description: "Strings, not nodes: Intl.ListFormat formats text, and falling back to a hand join for nodes would quietly lose the locale rules. A row of badges is a Stack with a gap." },
						{ name: "join", type: '"and" | "or" | "none"', default: '"and"', description: "Not called type — every other primitive spends that word on the text tone. \"none\" is for lists that are not prose, where a trailing \"and\" reads as a claim the data is not making." },
						{ name: "joinStyle", type: '"long" | "short" | "narrow"', default: '"long"', description: "Not called style, which is the DOM attribute and would have shadowed it." },
						{ name: "max", type: "number", description: "Shows at most this many, then a count of the rest. The overflow goes INSIDE the list so the conjunction still lands correctly — \"Alice, Bob and 3 more\"." },
						{ name: "strings", type: "Partial<InlineListStrings>", description: "more(count), which names the truncated remainder." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
