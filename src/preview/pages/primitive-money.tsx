import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveMoneyPage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-money/money"
				title="Money"
				description="The amount and the currency stay in separate channels all the way to the render — joining them into a string is where a EUR total ends up printed with a dollar sign. The decimal count comes from the currency's own Intl convention, which is why JPY has none and the others have two."
			/>

			<Example
				example="primitive-money/money-unit"
				title="Minor units"
				description="A great many APIs store money in minor units to avoid float error. Dividing by a hundred at the call site is where a currency with a different exponent goes wrong: JPY has no minor unit, so its scale is 1, and KWD has three digits, so its scale is 1000. The DISPLAYED decimal count is separate again — it comes from the currency's own Intl convention, which is why the yen below shows none."
			/>

			<Example
				example="primitive-money/money-format"
				title="How the amount is written"
				description="Three shapes for the same number. with-symbol uses Intl's own placement, which differs by locale and by currency and is exactly the thing a hand-rolled formatter gets wrong."
			/>

			<Example
				example="primitive-money/money-dual"
				title="Two currencies"
				description="A converted value beside the first, for a store that prices in one currency and settles in another. Passing `secondary` is the request; the emphasis decides how loud the second value is, and the layout decides whether it sits beside or under."
			/>

			<Example
				example="primitive-money/money-provider"
				title="Decided once, not per amount"
				description="A store's currency policy is one decision, and every price on the page follows it. The provider carries the default code, the display code, the format mode, and the layout — so a call site passes an amount and a conversion, never a policy."
			/>

			<Example id="money-rule" title="Policy narrows, never widens">
				<Callout label="Rule">
					A scope can hide a second value, restyle it, or move it. It cannot conjure one:
					<code>secondary</code> is an amount the caller converted, and there is nothing for
					the provider to invent it from. Turning dual pricing on therefore never makes
					single-currency call sites sprout a second number out of nowhere.
				</Callout>
			</Example>

			<Example id="money-api" title="API">
				<PropTable owners={["Money", "MoneyConfig"]} />
			</Example>
		</ComponentPage>
	)
}
