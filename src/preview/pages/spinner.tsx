import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SpinnerPage() {
	return (
		<ComponentPage
			title="Spinner"
			summary="Indeterminate activity, as a ring with one transparent quarter. One element rather than an SVG, and it reads as motion at any size."
			importPath="@/components/base/spinner"
			exports={["Spinner"]}
		>
			<Example
				example="spinner/spinner"
				title="Spinner"
				description="A labelled spinner announces through role=status; an unlabelled one is decorative and hidden, because 'loading' with no context is noise."
			/>

			<Example
				example="spinner/spinner-size"
				title="Size"
				description="The one place a size prop survives. Everything else in the kit scales from its content or the scale factor; a ring has neither, so the three steps are named."
			/>

			<Example
				example="spinner/spinner-tone"
				title="Tone"
				description="The button tone contract, so a spinner inside or beside an action takes the action's colour rather than sitting on it in the primary hue."
			/>

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
