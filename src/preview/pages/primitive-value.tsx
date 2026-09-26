import { EmptyValue, InlineList, MonoValue, MutedValue, SecondaryValue, Value } from "@/components/primitives"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

const THREE = ["Alice", "Bob", "Carol"]

export function PrimitiveValuePage() {
	return (
		<ComponentPage
			title="Value & lists"
			summary="The two primitives for plain text rather than a typed value. Value renders one string and knows what an absent one looks like; InlineList joins several into one phrase, with the conjunction and commas the locale decides."
			importPath="@/components/primitives"
			exports={["Value", "SecondaryValue", "MutedValue", "MonoValue", "EmptyValue", "InlineList"]}
		>
			<Example
				id="value"
				title="Value"
				description="Every primitive below is a Value underneath, which is why they all agree on what an empty value looks like."
				stacked
				code={`<Value>Northwind Traders</Value>
<SecondaryValue>Supporting detail</SecondaryValue>
<MutedValue>Quieter still</MutedValue>
<MonoValue>req_8f21c440</MonoValue>
<EmptyValue />`}
			>
				<SpecimenList
					items={[
						{ code: `<Value>Northwind Traders</Value>`, value: <Value>Northwind Traders</Value> },
						{ code: `<SecondaryValue>Supporting detail</SecondaryValue>`, value: <SecondaryValue>Supporting detail</SecondaryValue> },
						{ code: `<MutedValue>Quieter still</MutedValue>`, value: <MutedValue>Quieter still</MutedValue> },
						{ code: `<MonoValue>req_8f21c440</MonoValue>`, value: <MonoValue>req_8f21c440</MonoValue> },
						{ code: `<EmptyValue />`, value: <EmptyValue /> },
					]}
				/>
			</Example>

			<Example id="value-rule" title="Absent is a state" stacked>
				<Callout label="Rule">
					A primitive given <code>null</code> or <code>undefined</code> renders the empty
					mark, not an empty string. A blank cell and a cell whose value is genuinely
					unknown look identical, and only one of them is a bug — the reader deserves to
					be able to tell.
				</Callout>
			</Example>

			<Example
				id="inline-list"
				title="Inline list"
				description="Intl.ListFormat knows where the conjunction goes and whether a comma precedes it. Spanish switches y to e before an /i/ sound; Japanese uses a particle. Three places in this kit joined user-visible lists with .join(', '), which is correct in no locale including English."
				stacked
				code={`<InlineList items={["Alice", "Bob", "Carol"]} />
<InlineList items={["red", "green", "blue"]} join="or" />
<InlineList items={items} max={2} />`}
			>
				<SpecimenList
					items={[
						{ code: `join="and"`, value: <InlineList items={THREE} /> },
						{ code: `join="or"`, value: <InlineList items={["red", "green", "blue"]} join="or" /> },
						{ code: `join="none"`, value: <InlineList items={THREE} join="none" /> },
						{ code: `max={2}`, value: <InlineList items={["a", "b", "c", "d"]} max={2} /> },
						{ code: `two items`, value: <InlineList items={["Alice", "Bob"]} /> },
						{ code: `one item`, value: <InlineList items={["Alice"]} /> },
						{ code: `<InlineList items={[]} />`, value: <InlineList items={[]} /> },
					]}
				/>
			</Example>

			<Example
				id="inline-list-locale"
				title="The same list, three locales"
				description="Nothing about the component changes between these — the separator, the conjunction and the serial comma are all the locale's decision."
				stacked
				code={`<InlineList items={names} locale="en-GB" />
<InlineList items={names} locale="es-ES" />
<InlineList items={names} locale="ja-JP" />`}
			>
				<SpecimenList
					items={[
						{ code: `en-GB`, value: <InlineList items={THREE} locale="en-GB" /> },
						{ code: `en-US`, value: <InlineList items={THREE} locale="en-US" /> },
						{ code: `es-ES`, value: <InlineList items={THREE} locale="es-ES" /> },
						{ code: `de-DE`, value: <InlineList items={THREE} locale="de-DE" /> },
						{ code: `ja-JP`, value: <InlineList items={THREE} locale="ja-JP" /> },
					]}
				/>
			</Example>

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
