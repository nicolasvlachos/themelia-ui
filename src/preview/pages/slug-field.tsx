import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import { Input, SlugField } from "@/components/base/text-inputs"
import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

function SlugFieldDemo() {
	const [title, setTitle] = useState("Northwind Traders — Q4 Report & Notes")

	return (
		<Stack gap="lg" style={MEASURE.field}>
			<FormField label="Title">
				<Input value={title} onChange={(event) => setTitle(event.target.value)} />
			</FormField>
			<FormField label="URL" helperText="Derived from the title. Accents fold, punctuation collapses.">
				<SlugField value={title} prefix="acme.com/" />
			</FormField>
		</Stack>
	)
}

export function SlugFieldPage() {
	return (
		<ComponentPage
			title="Slug field"
			summary="A URL slug derived from another field. Accents fold, punctuation collapses, and the prefix is chrome rather than part of the value."
			importPath="@/components/base/text-inputs"
			exports={["SlugField"]}
		>
			<Example
				id="slug-field"
				title="SlugField"
				description="A read-only mirror of another field. Read-only rather than editable-with-sync: a slug that both follows the title and accepts edits has to decide which wins on every keystroke, and every answer to that surprises someone."
				stacked
				code={`<SlugField value={title} prefix="acme.com/" />`}
			>
				<SlugFieldDemo />
			</Example>

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
