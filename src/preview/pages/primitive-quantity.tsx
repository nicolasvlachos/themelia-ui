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
				<PropTable
					rows={[
						{ name: "Quantity value", type: "number | null", description: "The count." },
						{ name: "Quantity unit", type: "PluralForms | string", description: "The noun in the forms the locale may need — one, other, and the zero/two/few/many some languages select. A bare string is used for every form." },
						{ name: "Quantity zeroLabel", type: "ReactNode", description: "Replaces the whole thing at zero — \"no items\" rather than \"0 items\". Off by default: in a column the zero is the value being reported." },
						{ name: "Measure value", type: "number | null", description: "The amount." },
						{ name: "Measure unit", type: "string", description: "A CSS-style unit identifier — kilogram, meter, liter, celsius, byte." },
						{ name: "Measure unitDisplay", type: '"short" | "narrow" | "long"', default: '"short"', description: "2.5 kg, 2.5kg, or 2.5 kilograms." },
					]}
				/>
			</Example>

			<Example id="dimensions-api" title="Dimensions API">
				<PropTable owner="Dimensions"
					rows={[
						{ name: "width / height / depth", type: "number | null", description: "The parts. depth is optional — two values render as a plane." },
						{ name: "unit", type: "ReactNode", description: "Appended once, not per part." },
						{ name: "separator", type: "ReactNode", description: "Between the parts. A multiplication sign, not the letter x." },
						{ name: "formatDimensions()", type: "(parts, options) => string", description: "The same joining outside React." },
					]}
				/>
			</Example>

			<Example id="file-size-api" title="FileSize API">
				<PropTable owner="FileSize"
					rows={[
						{ name: "value", type: "number | null", description: "The size. Bytes unless from says otherwise." },
						{ name: "from", type: "FileSizeUnit", description: "The unit value is given in. Converted with the same base, so from=\"megabytes\" means 2^20 under binary and 10^6 under decimal." },
						{ name: "base", type: '"binary" | "decimal" | "iec"', default: '"binary"', description: "Which base and which labels. binary divides by 1024 and labels it MB — the pairing Windows and most file managers show, chosen so a size agrees with the machine it describes rather than with SI. decimal is SI-correct and what Apple platforms and storage vendors use. iec is strictly correct. The default does not move, so nothing already shipped changes." },
						{ name: "align", type: '"left" | "center" | "right"', description: "For a size given a box of its own. A COLUMN of sizes is aligned by the column — <TableCell align=\"end\"> — because the primitive is a span, and blockifying it to align would break the text runs it also sits in." },
						{ name: "formatFileSize()", type: "(value, options) => string", description: "The same formatting outside React." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
