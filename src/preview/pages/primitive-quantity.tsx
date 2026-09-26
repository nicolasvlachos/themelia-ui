import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveQuantityPage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-quantity/quantity"
				title="Quantity"
				description="Intl.PluralRules picks the form and the caller supplies the words, because person/people is not derivable and no amount of suffixing gets there. English selects 'one' for exactly 1, so 0 and 1.5 both take the plural — which a count === 1 check gets right by accident and gets wrong in half the languages it will run in."
			/>

			<Example
				example="primitive-quantity/measure"
				title="Measure"
				description="The unit identifier goes to Intl, which owns both the abbreviation and where it sits — English writes 2.5 kg and French writes 2,5 kg, and neither is a string to assemble here. A unit Intl does not know degrades to the bare number rather than throwing."
			/>

			<Example
				example="primitive-quantity/dimensions"
				title="Dimensions"
				description="The parts stay separate all the way to the render, so a shipping calculation reads numbers rather than parsing back out of “30 × 20 × 12 cm”. Only the display joins them."
			/>

			<Example
				example="primitive-quantity/file-size"
				title="File size"
				description="The unit is chosen from the magnitude and the precision from the unit, which is the pair that hand-written formatters get half right. from names the unit the value ARRIVES in, for an API that already reports kilobytes."
			/>

			<Example
				example="primitive-quantity/file-size-base"
				title="Which megabyte"
				description="A file size has a base and a set of labels, and only some pairings mean anything. binary — the default — divides by 1024 and labels it MB: not correct under either standard, and what Windows and most file managers show, so the number matches the one beside it in the reader's own file browser. decimal is SI-correct and what macOS, iOS and every storage vendor use. iec is strictly correct and reads as a typo to almost everyone outside engineering. Same file, three true answers."
			/>

			<Example id="quantity-api" title="Quantity and Measure API">
				<PropTable owners={["Quantity", "Measure"]} />
			</Example>

			<Example id="dimensions-api" title="Dimensions API">
				<PropTable owner="Dimensions" />
				<PropTable symbols={["formatDimensions"]} />
			</Example>

			<Example id="file-size-api" title="FileSize API">
				<PropTable owner="FileSize" />
				<PropTable symbols={["formatFileSize"]} />
			</Example>
		</ComponentPage>
	)
}
