import { Button } from "themelia-ui/base/buttons"

export default function State() {
	return (
		<>
			<Button>Save changes</Button>
			<Button loading>Save changes</Button>
			<Button disabled>Disabled</Button>
			<Button tone="neutral" buttonStyle="outline" loading>
				Loading
			</Button>
		</>
	)
}
