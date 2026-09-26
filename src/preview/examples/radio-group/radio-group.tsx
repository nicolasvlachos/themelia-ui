import { Radio, RadioGroup } from "themelia-ui/base/choice-inputs"

export default function RadioGroupExample() {
	return (
		<RadioGroup name="demo-shipping">
			<Radio label="Standard — 3 to 5 days" value="standard" defaultChecked />
			<Radio label="Express — next day" value="express" />
			<Radio label="Overnight" value="overnight" />
			<Radio label="Pickup (unavailable)" value="pickup" disabled />
		</RadioGroup>
	)
}
