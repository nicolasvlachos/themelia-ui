import { Money } from "@/components/primitives"
import { Text } from "@/components/base/typography"
import { UIProvider } from "@/lib/ui-provider"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

export function PrimitiveMoneyPage() {
	return (
		<ComponentPage
			title="Money"
			summary="An amount and its currency, formatted for a locale — and optionally beside a converted second value. Never a number formatted by hand: a currency has a position, a separator, and a decimal count that all differ by locale."
			importPath="@/components/primitives"
			exports={["Money"]}
		>
			<Example
				id="money"
				title="Money"
				description="The amount and the currency stay in separate channels all the way to the render — joining them into a string is where a EUR total ends up printed with a dollar sign. The decimal count comes from the currency's own Intl convention, which is why JPY has none and the others have two."
				stacked
				code={`<Money amount={1299.5} currency="EUR" />
<Money amount={1299.5} currency="USD" />
<Money amount={-42} currency="GBP" />
<Money amount={0} currency="JPY" />
<Money amount={null} currency="EUR" />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `<Money amount={1299.5} currency="EUR" />`, value: <Money amount={1299.5} currency="EUR" /> },
						{ code: `<Money amount={1299.5} currency="USD" />`, value: <Money amount={1299.5} currency="USD" /> },
						{ code: `<Money amount={-42} currency="GBP" />`, value: <Money amount={-42} currency="GBP" /> },
						{ code: `<Money amount={0} currency="JPY" />`, value: <Money amount={0} currency="JPY" /> },
						{ code: `<Money amount={null} currency="EUR" />`, value: <Money amount={null} currency="EUR" /> },
					]}
				/>
			</Example>

			<Example
				id="money-unit"
				title="Minor units"
				description="A great many APIs store money in minor units to avoid float error. Dividing by a hundred at the call site is where a currency with a different exponent goes wrong: JPY has no minor unit, so its scale is 1, and KWD has three digits, so its scale is 1000. The DISPLAYED decimal count is separate again — it comes from the currency's own Intl convention, which is why the yen below shows none."
				stacked
				code={`<Money amount={129950} currency="EUR" unit="minor" />
<Money amount={1299} currency="JPY" unit="minor" minorUnitScale={1} />
<Money amount={129950} currency="KWD" unit="minor" minorUnitScale={1000} />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `<Money amount={129950} currency="EUR" unit="minor" />`, value: <Money amount={129950} currency="EUR" unit="minor" /> },
						{ code: `<Money amount={1299} currency="JPY" unit="minor" minorUnitScale={1} />`, value: <Money amount={1299} currency="JPY" unit="minor" minorUnitScale={1} /> },
						{ code: `<Money amount={129950} currency="KWD" unit="minor" minorUnitScale={1000} />`, value: <Money amount={129950} currency="KWD" unit="minor" minorUnitScale={1000} /> },
					]}
				/>
			</Example>

			<Example
				id="money-format"
				title="How the amount is written"
				description="Three shapes for the same number. with-symbol uses Intl's own placement, which differs by locale and by currency and is exactly the thing a hand-rolled formatter gets wrong."
				stacked
				code={`<Money amount={1299.5} currency="EUR" formatMode="with-symbol" />
<Money amount={1299.5} currency="EUR" formatMode="with-code" />
<Money amount={1299.5} currency="EUR" formatMode="decimal" />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `formatMode="with-symbol"  (default)`, value: <Money amount={1299.5} currency="EUR" formatMode="with-symbol" /> },
						{ code: `formatMode="with-code"`, value: <Money amount={1299.5} currency="EUR" formatMode="with-code" /> },
						{ code: `formatMode="decimal"`, value: <Money amount={1299.5} currency="EUR" formatMode="decimal" /> },
					]}
				/>
			</Example>

			<Example
				id="money-dual"
				title="Two currencies"
				description="A converted value beside the first, for a store that prices in one currency and settles in another. Passing `secondary` is the request; the emphasis decides how loud the second value is, and the layout decides whether it sits beside or under."
				stacked
				code={`<Money
  amount={1299.5}
  currency="EUR"
  secondary={{ amount: 1416.2, currency: "USD" }}
/>`}
			>
				<SpecimenList
					items={[
						{
							code: `secondaryEmphasis="discrete"  (default)`,
							value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} />,
						},
						{
							code: `secondaryEmphasis="muted"`,
							value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} secondaryEmphasis="muted" />,
						},
						{
							code: `secondaryEmphasis="match"`,
							value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} secondaryEmphasis="match" />,
						},
						{
							code: `separator={<>→</>}`,
							value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} separator="→" />,
						},
						{
							code: `layout="stacked"`,
							value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} layout="stacked" />,
						},
						{
							code: `secondaryEmphasis="hidden"`,
							value: <Money amount={1299.5} currency="EUR" secondary={{ amount: 1416.2, currency: "USD" }} secondaryEmphasis="hidden" />,
						},
					]}
				/>
			</Example>

			<Example
				id="money-provider"
				title="Decided once, not per amount"
				description="A store's currency policy is one decision, and every price on the page follows it. The provider carries the default code, the display code, the format mode, and the layout — so a call site passes an amount and a conversion, never a policy."
				stacked
				code={`<UIProvider
  config={{
    formatting: { locale: "de-DE" },
    money: {
      defaultCurrency: "EUR",
      displayCurrency: "USD",
      dualPricingEnabled: true,
      displayMode: "dynamic",
      layout: "stacked",
    },
  }}
>
  <Money amount={1299.5} secondary={{ amount: 1416.2 }} />
</UIProvider>`}
			>
				<UIProvider
					config={{
						formatting: { locale: "de-DE" },
						money: {
							defaultCurrency: "EUR",
							displayCurrency: "USD",
							dualPricingEnabled: true,
							displayMode: "dynamic",
							layout: "stacked",
						},
					}}
				>
					<SpecimenList
						items={[
							{
								code: `<Money amount={1299.5} secondary={{ amount: 1416.2 }} />`,
								value: <Money amount={1299.5} secondary={{ amount: 1416.2 }} />,
							},
							{
								code: `<Money amount={1299.5} />   {/* no conversion given */}`,
								value: <Money amount={1299.5} />,
							},
							{
								code: `<Money amount={1299.5} secondary={{ amount: 1299.5, currency: "EUR" }} />`,
								value: <Money amount={1299.5} secondary={{ amount: 1299.5, currency: "EUR" }} />,
							},
						]}
					/>
				</UIProvider>
				<Text size="xs" type="secondary">
					German locale, so the group separator is a dot and the symbol trails the number.
					The third row is <code>dynamic</code> at work: both codes are EUR, so the pair
					would say the same thing twice and only one value renders.
				</Text>
			</Example>

			<Example id="money-rule" title="Policy narrows, never widens" stacked>
				<Callout label="Rule">
					A scope can hide a second value, restyle it, or move it. It cannot conjure one:
					<code>secondary</code> is an amount the caller converted, and there is nothing for
					the provider to invent it from. Turning dual pricing on therefore never makes
					single-currency call sites sprout a second number out of nowhere.
				</Callout>
			</Example>

			<Example id="money-api" title="API">
				<PropTable owner="Money"
					rows={[
						{ name: "amount / currency", type: "number | string | null / string", description: "The amount and its ISO code, in separate channels. A string amount is parsed by POSITION — whichever of , or . appears last is the decimal point — so a value that came back through a European locale does not parse a thousand times too large." },
						{ name: "unit / minorUnitScale", type: '"major" | "minor" / number', default: '"major" / 100', description: "The unit the amount ARRIVES in. Set minorUnitScale for a currency whose exponent is not two." },
						{ name: "formatMode", type: '"with-symbol" | "with-code" | "decimal"', default: '"with-symbol"', description: "How the amount is written. Falls back to the scope's money.formatMode." },
						{ name: "locale", type: "string", description: "Overrides the scope's locale for this value." },
						{ name: "secondary", type: "MoneyValue | null", description: "A converted amount shown beside the first. Passing it is the request for the pair; the scope's policy can narrow that but never widen it." },
						{ name: "displayMode", type: '"dual" | "dynamic" | "primary-only"', description: "Whether the pair shows. dynamic shows it only when the two codes actually differ." },
						{ name: "layout", type: '"inline" | "stacked"', description: "Beside, or under. Falls back to the scope's money.layout." },
						{ name: "secondaryEmphasis", type: '"discrete" | "muted" | "match" | "hidden"', default: '"discrete"', description: "How loud the second value is against the first." },
						{ name: "separator", type: "ReactNode", default: '"·"', description: "Between the two, inline. It is aria-hidden — read aloud, the mark between two amounts is punctuation for the eye." },
						{ name: "UIProvider money", api: "UIProvider.config.money", type: "MoneyConfig", description: "defaultCurrency, displayCurrency, dualPricingEnabled, displayMode, layout, formatMode — the store's policy, decided once." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
