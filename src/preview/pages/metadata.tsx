import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MetadataPage() {
	return (
		<ComponentPage>
			<Example
				example="metadata/metadata-grid"
				title="grid"
				description="Label above value, flowed into columns. The default, and the right one for a detail panel — the eye scans labels down a column and finds values beside them. columns is a ceiling, not a fixed number: four columns on a phone is four columns of one word each, so the list steps down at the widths where each still holds a readable value."
			/>

			<Example
				example="metadata/metadata-rows"
				title="rows"
				description="A two-column definition list — a real <dl>, so a screen reader announces it as one. For a long list of facts whose labels vary in length, which a grid makes ragged. Labels and values share proportional columns, so they stay aligned while wrapping to fit narrow panels."
			/>

			<Example
				example="metadata/metadata-inline"
				title="inline"
				description="Label, colon, value, running along one line and wrapping. For the summary strip under a title. The separator between facts is drawn between them and never after the last one — a trailing middle dot reads as a fact that failed to load."
			/>

			<Example
				example="metadata/metadata-density"
				title="density"
				description="compact tightens the rhythm and drops the value a size, for a side panel or an inspector where the facts support the content rather than being it."
			/>

			<Example id="metadata-kinds" title="The value kinds">
				<Callout label="Rule">
					A value is a <strong>node</strong> or a <strong>descriptor</strong>. A descriptor
					names the kind — <code>text</code>, <code>mono</code>, <code>email</code>,{" "}
					<code>phone</code>, <code>url</code>, <code>link</code>, <code>date</code>,{" "}
					<code>time</code>, <code>datetime</code>, <code>money</code>,{" "}
					<code>badge</code>, <code>node</code>, <code>empty</code> — and each exposes only
					the fields its primitive consumes, so <code>pattern</code> on a money fact is a
					type error rather than a silently ignored prop.
				</Callout>
				<Text size="sm" type="secondary">
					The temporal kinds take a <code>pattern</code> and nothing else: the locale and
					the default pattern come from the scope&rsquo;s dates config, so one fact does not
					get to disagree with the surface it sits on about how a date is written. Money is
					the same — the symbol, the currency display, and the fraction digits are the
					scope&rsquo;s policy.
				</Text>
			</Example>

			<Example id="metadata-api" title="MetadataList API">
				<PropTable owners={["MetadataList", "MetadataListItem"]} />
			</Example>

		</ComponentPage>
	)
}
