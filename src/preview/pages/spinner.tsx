import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SpinnerPage() {
	return (
		<ComponentPage>
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
				<PropTable owner="Spinner" />
			</Example>
		</ComponentPage>
	)
}
