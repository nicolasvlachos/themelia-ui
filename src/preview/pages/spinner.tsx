import { Spinner } from "@/components/base/spinner"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

/** A captioned demo: a spinner has no content to tell the variants apart. */
function Demo({ caption, children }: { caption: string; children: React.ReactNode }) {
	return (
		<Stack gap="2xs" align="start">
			{children}
			<Text size="xs" type="secondary">{caption}</Text>
		</Stack>
	)
}

export function SpinnerPage() {
	return (
		<ComponentPage
			title="Spinner"
			summary="Indeterminate activity, as a ring with one transparent quarter. One element rather than an SVG, and it reads as motion at any size."
			importPath="@/components/base/spinner"
			exports={["Spinner"]}
		>
			<Example
				id="spinner"
				title="Spinner"
				description="A labelled spinner announces through role=status; an unlabelled one is decorative and hidden, because 'loading' with no context is noise."
				code={`<Spinner label="Saving…" />   {/* announced */}\n<Spinner />                   {/* decorative, aria-hidden */}`}
			>
				<Stack direction="horizontal" gap="2xl" align="end">
					<Demo caption='label="Saving…"'>
						<Spinner label="Saving…" />
					</Demo>
					<Demo caption="no label — hidden from assistive technology">
						<Spinner />
					</Demo>
				</Stack>
			</Example>

			<Example
				id="spinner-size"
				title="Size"
				description="The one place a size prop survives. Everything else in the kit scales from its content or the scale factor; a ring has neither, so the three steps are named."
				code={`<Spinner size="sm" />\n<Spinner size="md" />\n<Spinner size="lg" />`}
			>
				<Stack direction="horizontal" gap="2xl" align="end">
					<Demo caption='size="sm"'><Spinner size="sm" /></Demo>
					<Demo caption='size="md" — default'><Spinner size="md" /></Demo>
					<Demo caption='size="lg"'><Spinner size="lg" /></Demo>
				</Stack>
			</Example>

			<Example
				id="spinner-tone"
				title="Tone"
				description="The button tone contract, so a spinner inside or beside an action takes the action's colour rather than sitting on it in the primary hue."
				code={`<Spinner tone="neutral" />\n<Spinner tone="success" />`}
			>
				<Stack direction="horizontal" gap="2xl" align="end">
					<Demo caption='tone="primary" — default'><Spinner /></Demo>
					<Demo caption='tone="neutral"'><Spinner tone="neutral" /></Demo>
					<Demo caption='tone="success"'><Spinner tone="success" /></Demo>
					<Demo caption='tone="destructive"'><Spinner tone="destructive" /></Demo>
				</Stack>
			</Example>

			<Example id="spinner-api" title="API">
				<PropTable owner="Spinner"
					rows={[
						{ name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "The one place a size prop survives — a spinner has no content to scale with." },
						{ name: "tone", type: "SemanticTone", default: '"primary"', description: "Borrows the button tone contract, so a spinner beside an action matches it." },
						{ name: "label", type: "ReactNode", description: "Visible label beside the ring, and the announced status. Without one the spinner is decorative and hidden from assistive technology." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
