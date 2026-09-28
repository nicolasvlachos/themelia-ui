import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { toast } from "themelia-ui/base/toaster"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function ToastPromise() {
	return (
		<Stack direction="horizontal" gap="sm" wrap>
			<Button
				appearance="outline"
				tone="neutral"
				onClick={() =>
					void toast.promise(wait(1800), {
						loading: "Saving invoice…",
						success: "Invoice saved",
						error: "Could not save",
					})
				}
			>
				Resolves
			</Button>
			<Button
				appearance="outline"
				tone="neutral"
				onClick={() =>
					void toast
						.promise(wait(1800).then(() => Promise.reject(new Error("timeout"))), {
							loading: "Saving invoice…",
							success: "Invoice saved",
							error: (error) => `Could not save: ${(error as Error).message}`,
						})
						.catch(() => {})
				}
			>
				Rejects
			</Button>
		</Stack>
	)
}
