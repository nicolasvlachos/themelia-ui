import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SlugFieldPage() {
	return (
		<ComponentPage>
			<Example
				example="slug-field/slug-field"
				title="SlugField"
				description="A read-only mirror of another field. Read-only rather than editable-with-sync: a slug that both follows the title and accepts edits has to decide which wins on every keystroke, and every answer to that surprises someone."
			/>

			<Example id="slug-api" title="API">
				<PropTable owner="SlugField"
					rows={[
						{ name: "value", type: "string", description: "The source text. The field shows its slugified form." },
						{ name: "prefix", type: "ReactNode", description: "The domain or path shown before the slug. Not part of the value." },
						{ name: "slugify", type: "SlugifyOptions", description: "Separator, case, and which characters survive." },
						{ name: "transform", type: "(value: string) => string", description: "Replaces the slugifier. The default lower-cases, strips accents and collapses runs to a single dash." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
