import { Slider } from "themelia-ui/base/value-inputs"

export default function SliderBare() {
	return (
		<div style={{ maxWidth: "20rem" }}>
			<Slider defaultValue={40} aria-label="Zoom" />
		</div>
	)
}
