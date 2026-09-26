import { Dimensions, FileSize, Measure, Quantity } from "@/components/primitives"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

const ITEM = { one: "item", other: "items" }
const PERSON = { one: "person", other: "people" }

export function PrimitiveQuantityPage() {
	return (
		<ComponentPage
			title="Measures: quantity, dimensions & file size"
			summary="A number and the unit it is counted or measured in: a quantity of things, a physical measure, a size in two or three dimensions, a size in bytes. Each keeps the number apart from the unit until render, so the part that goes wrong by hand — the plural, the unit’s abbreviation, the multiplication sign, which megabyte — is decided in one place."
			importPath="@/components/primitives"
			exports={["Quantity", "Measure", "Dimensions", "formatDimensions", "FileSize", "formatFileSize"]}
		>
			<Example
				id="quantity"
				title="Quantity"
				description="Intl.PluralRules picks the form and the caller supplies the words, because person/people is not derivable and no amount of suffixing gets there. English selects 'one' for exactly 1, so 0 and 1.5 both take the plural — which a count === 1 check gets right by accident and gets wrong in half the languages it will run in."
				stacked
				code={`<Quantity value={1} unit={{ one: "item", other: "items" }} />
<Quantity value={0} unit={ITEM} zeroLabel="no items" />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `value={1}`, value: <Quantity value={1} unit={ITEM} /> },
						{ code: `value={3}`, value: <Quantity value={3} unit={ITEM} /> },
						{ code: `value={1.5}`, value: <Quantity value={1.5} unit={ITEM} /> },
						{ code: `value={1} person`, value: <Quantity value={1} unit={PERSON} /> },
						{ code: `value={4} person`, value: <Quantity value={4} unit={PERSON} /> },
						{ code: `zeroLabel`, value: <Quantity value={0} unit={ITEM} zeroLabel="no items" /> },
						{ code: `<Quantity value={null} />`, value: <Quantity value={null} unit={ITEM} /> },
					]}
				/>
			</Example>

			<Example
				id="measure"
				title="Measure"
				description="The unit identifier goes to Intl, which owns both the abbreviation and where it sits — English writes 2.5 kg and French writes 2,5 kg, and neither is a string to assemble here. A unit Intl does not know degrades to the bare number rather than throwing."
				stacked
				code={`<Measure value={2.5} unit="kilogram" />
<Measure value={2.5} unit="kilogram" unitDisplay="long" />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `unit="kilogram"`, value: <Measure value={2.5} unit="kilogram" /> },
						{ code: `unitDisplay="narrow"`, value: <Measure value={2.5} unit="kilogram" unitDisplay="narrow" /> },
						{ code: `unitDisplay="long"`, value: <Measure value={2.5} unit="kilogram" unitDisplay="long" /> },
						{ code: `unit="meter"`, value: <Measure value={180} unit="meter" /> },
						{ code: `unit="celsius"`, value: <Measure value={21.5} unit="celsius" /> },
						{ code: `unit="day"`, value: <Measure value={14} unit="day" /> },
						{ code: `unknown unit`, value: <Measure value={2.5} unit="bananas" /> },
					]}
				/>
			</Example>

			<Example
				id="dimensions"
				title="Dimensions"
				description="The parts stay separate all the way to the render, so a shipping calculation reads numbers rather than parsing back out of “30 × 20 × 12 cm”. Only the display joins them."
				stacked
				code={`<Dimensions width={30} height={20} unit="cm" />
<Dimensions width={30} height={20} depth={12} unit="cm" />
<Dimensions width={1920} height={1080} unit="px" />
<Dimensions width={null} height={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Dimensions width={30} height={20} unit="cm" />`, value: <Dimensions width={30} height={20} unit="cm" /> },
						{ code: `<Dimensions width={30} height={20} depth={12} unit="cm" />`, value: <Dimensions width={30} height={20} depth={12} unit="cm" /> },
						{ code: `<Dimensions width={1920} height={1080} unit="px" />`, value: <Dimensions width={1920} height={1080} unit="px" /> },
						{ code: `<Dimensions width={null} height={null} />`, value: <Dimensions width={null} height={null} /> },
					]}
				/>
			</Example>

			<Example
				id="file-size"
				title="File size"
				description="The unit is chosen from the magnitude and the precision from the unit, which is the pair that hand-written formatters get half right. from names the unit the value ARRIVES in, for an API that already reports kilobytes."
				stacked
				code={`<FileSize value={512} />
<FileSize value={1_100_000} />
<FileSize value={85_800_000} />
<FileSize value={4_100_000_000} />
<FileSize value={null} />`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `<FileSize value={512} />`, value: <FileSize value={512} /> },
						{ code: `<FileSize value={1_100_000} />`, value: <FileSize value={1_100_000} /> },
						{ code: `<FileSize value={85_800_000} />`, value: <FileSize value={85_800_000} /> },
						{ code: `<FileSize value={4_100_000_000} />`, value: <FileSize value={4_100_000_000} /> },
						{ code: `<FileSize value={null} />`, value: <FileSize value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="file-size-base"
				title="Which megabyte"
				description="A file size has a base and a set of labels, and only some pairings mean anything. binary — the default — divides by 1024 and labels it MB: not correct under either standard, and what Windows and most file managers show, so the number matches the one beside it in the reader's own file browser. decimal is SI-correct and what macOS, iOS and every storage vendor use. iec is strictly correct and reads as a typo to almost everyone outside engineering. Same file, three true answers."
				stacked
				code={`<FileSize value={1_100_000} />                    {/* 1 MB */}
<FileSize value={1_100_000} base="decimal" />    {/* 1.1 MB */}
<FileSize value={1_100_000} base="iec" />        {/* 1 MiB */}`}
			>
				<SpecimenList
					numeric
					items={[
						{ code: `binary — the default`, value: <FileSize value={85_800_000} /> },
						{ code: `base="decimal"`, value: <FileSize value={85_800_000} base="decimal" /> },
						{ code: `base="iec"`, value: <FileSize value={85_800_000} base="iec" /> },
					]}
				/>
			</Example>

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
