import { VisuallyHidden } from "themelia-ui/base/display"
import { Text } from "themelia-ui/base/typography"

export default function VisuallyHiddenExample() {
	return (
		<Text size="sm" type="secondary">
			This sentence has a hidden note for screen readers.
			<VisuallyHidden> Only assistive technology reads this.</VisuallyHidden>
		</Text>
	)
}
