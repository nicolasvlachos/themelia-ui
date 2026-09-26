import { Button } from "themelia-ui/base/buttons"
import { useCopyToClipboard } from "themelia-ui/base/copyable"
import { Stack } from "themelia-ui/base/structure"

/** The hook on its own, driving an affordance `Copyable` does not offer. */
function ShareLink() {
	const { copied, copy } = useCopyToClipboard()
	const url = "https://northwind.example/invite/9f2c4b"

	return (
		<Button
			buttonStyle="outline"
			tone="neutral"
			onClick={() => void copy(url)}
		>
			{copied ? "Link copied" : "Copy invite link"}
		</Button>
	)
}

export default function UseCopyToClipboard() {
	return (
		<Stack direction="horizontal">
			<ShareLink />
		</Stack>
	)
}
