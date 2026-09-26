import { Initials, Name } from "@/components/primitives"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

export function PrimitiveNamePage() {
	return (
		<ComponentPage
			title="Names & initials"
			summary="A person’s name, normalised for display, and the initials derived from it. They share a page because they read the same value: Initials is computed from the name rather than stored beside it, so an avatar and the label next to it cannot disagree."
			importPath="@/components/primitives"
			exports={["Name", "formatName", "Initials", "formatInitials"]}
		>
			<Example
				id="name"
				title="Name"
				description="Whitespace is collapsed and the parts are ordered by the format asked for. The stored value is never rewritten — this is a rendering, not a migration."
				stacked
				code={`<Name value="Jane McDonald" />
<Name value="  jane   mcdonald " />
<Name value="JANE MCDONALD" force />
<Name value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Name value="Jane McDonald" />`, value: <Name value="Jane McDonald" /> },
						{ code: `<Name value="  jane   mcdonald " />`, value: <Name value="  jane   mcdonald " /> },
						{ code: `<Name value="JANE MCDONALD" force />`, value: <Name value="JANE MCDONALD" force /> },
						{ code: `<Name value={null} />`, value: <Name value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="initials"
				title="Initials"
				description="The strategy decides which characters are taken — first and last, the first two words, the first letter alone. Deriving rather than storing is the whole point: a name that is corrected corrects its initials with it."
				stacked
				code={`<Initials value="Jane McDonald" />
<Initials value="Mei Chen" />
<Initials value="Jane McDonald" maxCharacters={1} />
<Initials value="Ana Sofia Reyes" strategy="first-words" />
<Initials value="Ana Sofia Reyes" maxCharacters={3} />
<Initials value="—" fallback="?" />
<Initials value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Initials value="Jane McDonald" />`, value: <Initials value="Jane McDonald" /> },
						{ code: `<Initials value="Mei Chen" />`, value: <Initials value="Mei Chen" /> },
						{ code: `<Initials value="Jane McDonald" maxCharacters={1} />`, value: <Initials value="Jane McDonald" maxCharacters={1} /> },
						{ code: `<Initials value="Ana Sofia Reyes" strategy="first-words" />`, value: <Initials value="Ana Sofia Reyes" strategy="first-words" /> },
						{ code: `<Initials value="Ana Sofia Reyes" maxCharacters={3} />`, value: <Initials value="Ana Sofia Reyes" maxCharacters={3} /> },
						{ code: `<Initials value="—" fallback="?" />`, value: <Initials value="—" fallback="?" /> },
						{ code: `<Initials value={null} />`, value: <Initials value={null} /> },
					]}
				/>
			</Example>

			<Example id="name-api" title="Name API">
				<PropTable owner="Name"
					rows={[
						{ name: "value", type: "string | null", description: "The whole name, however it was stored." },
						{ name: "force", type: "boolean", description: "Title-cases a name that already looks INTENTIONALLY cased. A name arriving all-shouting or all-lowercase is re-cased without it — those two carry no intent to preserve. Off by default, because a name is the one field where the stored casing is usually deliberate: force is what overrides that judgement. Hyphens and apostrophes each take a capital (jean-luc → Jean-Luc, o'brien → O'Brien); an intercap does not, so mcdonald becomes Mcdonald — Mc, Mac and van der have no rule that is right for every name carrying them." },
						{ name: "formatName()", type: "(input, options) => string", description: "The same normalisation outside React — for a sort key, an export, a document title." },
					]}
				/>
			</Example>

			<Example id="initials-api" title="Initials API">
				<PropTable owner="Initials"
					rows={[
						{ name: "value", type: "string | null", description: "The name to derive from." },
						{ name: "strategy", type: '"first-last" | "first-words"', description: "First plus last word by default; first-words keeps the leading N instead." },
						{ name: "fallback", type: "string", description: "Returned when the name has no usable letter or number at all." },
						{ name: "maxCharacters", type: "1 | 2 | 3", description: "How many characters are kept." },
						{ name: "formatInitials()", type: "(input, options) => string", description: "The same derivation outside React." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
