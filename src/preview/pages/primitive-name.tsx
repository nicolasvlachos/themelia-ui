import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveNamePage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-name/name"
				title="Name"
				description="Whitespace is collapsed and the parts are ordered by the format asked for. The stored value is never rewritten — this is a rendering, not a migration."
			/>

			<Example
				example="primitive-name/initials"
				title="Initials"
				description="The strategy decides which characters are taken — first and last, the first two words, the first letter alone. Deriving rather than storing is the whole point: a name that is corrected corrects its initials with it."
			/>

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
