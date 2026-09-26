import { Button } from "@/components/base/buttons"
import { Card } from "@/components/base/cards"
import { Copyable, useCopyToClipboard } from "@/components/base/copyable"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { Email, MonoValue } from "@/components/primitives"

import { MEASURE } from "../partials/measures"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

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

export function CopyablePage() {
	return (
		<ComponentPage
			title="Copyable"
			summary="A value with a copy button. It confirms in place and raises a toast, because a copy that gives no feedback is indistinguishable from one that failed."
			importPath="@/components/base/copyable"
			exports={["Copyable", "useCopyToClipboard"]}
		>
			<Example
				id="copyable"
				title="Copyable"
				description="The value stays passive and the copy button is its sibling. Wrapping the value in a button would nest one interactive element inside another the moment the value is an Email or a Url."
				stacked
				code={`{/* truncate keeps the button in view however long the value is */}
<Copyable value="sk_live_9f2c…" mono truncate />
<Copyable value="jane@example.com" displayValue={<Email value="jane@example.com" />} />`}
			>
				<Card surface="bordered" style={MEASURE.field}>
					<Stack gap="md">
						<Stack gap="2xs">
							<Text size="xs" type="secondary">
								API key
							</Text>
							<Copyable value="key_live_9f2c4b1e77a0d3f8b6c5a41d0e73b28c9f4610d7" mono truncate />
						</Stack>
						<Stack gap="2xs">
							<Text size="xs" type="secondary">
								Billing contact
							</Text>
							<Copyable
								value="jane@northwind.example"
								displayValue={<Email value="jane@northwind.example" />}
							/>
						</Stack>
						<Stack gap="2xs">
							<Text size="xs" type="secondary">
								Workspace id
							</Text>
							<Copyable
								value="ws_01J8Z9K2QW"
								displayValue={<MonoValue>ws_01J8Z9K2QW</MonoValue>}
							/>
						</Stack>
					</Stack>
				</Card>
			</Example>

			<Example
				id="use-copy-to-clipboard"
				title="useCopyToClipboard"
				description="The behaviour without the markup, for an affordance that is not a value with a button beside it — a share action, a code block, a menu item. It owns the write, the confirmation window and the failure, which is the part five surfaces in this kit each used to write out and each got slightly wrong."
				code={`const { copied, copy } = useCopyToClipboard()

<Button onClick={() => void copy(url)}>
  {copied ? "Link copied" : "Copy invite link"}
</Button>`}
			>
				<ShareLink />
			</Example>

			<Example id="copyable-api" title="API">
				<PropTable owner="Copyable"
					rows={[
						{ name: "value", type: "string", description: "What lands on the clipboard." },
						{ name: "displayValue", type: "ReactNode", description: "Shown instead of the raw value. A rich node is rendered as-is." },
						{ name: "truncate", type: "boolean", default: "false", description: "Ellipsises the value at the width the caller allots, keeping the button in view." },
						{ name: "silent", type: "boolean", default: "false", description: "Suppresses both toasts. The copied state on the control is the confirmation then." },
						{ name: "mono", type: "boolean", default: "false", description: "Tabular, monospaced figures — for a key or an id, where one character matters." },
						{ name: "compact", type: "boolean", default: "false", description: "Sizes the trigger to the TEXT rather than to a control. A copy button is 36px tall, which is right beside a field and wrong inside a list row where the value is a description under a title: at full height the affordance is twice the height of the line it belongs to and the row's rhythm bends around it. Every behaviour is unchanged; what it gives up is the pointer target a standalone control is entitled to." },
						{ name: "strings", type: "Partial<CopyableStrings>", description: "Overrides this control's own copy. The name changes between `copy` and `copied`, because the confirmation IS the name for a screen reader." },
						{ name: "onCopy / onError", type: "() => void / (error) => void", description: "The clipboard can refuse — an insecure origin, a denied permission — and a copy that fails silently is worse than one that never offered." },
						{ name: "buttonProps", type: "ButtonProps", description: "Passed to the copy control, for a tone or a size that suits the surface." },
						{ name: "useCopyToClipboard()", type: "{ copied, copy }", description: "The hook this component is built on. `copy(value)` resolves true or false rather than rejecting. Takes `confirmMs`, `onCopy`, `onError`, and `write` — a destination for where `navigator.clipboard` is absent." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
