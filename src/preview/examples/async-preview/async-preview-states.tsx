import { useRef } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AsyncPreview } from "themelia-ui/features/async-preview"

import { CustomerCard } from "./_shared"
import { CUSTOMERS, wait, type Customer } from "./data"

export default function AsyncPreviewStates() {
	const failedOnce = useRef(false)

	return (
		<Stack direction="horizontal" gap="xl" wrap>
			<AsyncPreview.Root<Customer, null, "slow">
				type="slow"
				context={null}
				onShow={async ({ signal, setLoading }) => {
					setLoading({ label: "Reaching the billing service…" })
					await wait(2500, signal)
					return CUSTOMERS["c-1"]!
				}}
			>
				<AsyncPreview.Trigger>Slow, with its own label</AsyncPreview.Trigger>
				<AsyncPreview.Content>
					<AsyncPreview.Loading />
					<AsyncPreview.Body>
						{(data) => <CustomerCard customer={data as Customer} />}
					</AsyncPreview.Body>
				</AsyncPreview.Content>
			</AsyncPreview.Root>

			<AsyncPreview.Root<Customer, null, "failing">
				type="failing"
				context={null}
				onShow={async ({ signal }) => {
					await wait(600, signal)
					if (!failedOnce.current) {
						failedOnce.current = true
						throw new Error("502 from the billing service")
					}
					return CUSTOMERS["c-1"]!
				}}
			>
				<AsyncPreview.Trigger>Fails once, then recovers</AsyncPreview.Trigger>
				<AsyncPreview.Content>
					<AsyncPreview.Loading />
					<AsyncPreview.Error />
					<AsyncPreview.Body>{(data) => <CustomerCard customer={data as Customer} />}</AsyncPreview.Body>
				</AsyncPreview.Content>
			</AsyncPreview.Root>

			<AsyncPreview.Root<Customer, null, "failing-custom">
				type="failing-custom"
				context={null}
				onShow={async ({ signal }) => {
					await wait(600, signal)
					throw new Error("502 from the billing service")
				}}
			>
				<AsyncPreview.Trigger>Fails, with its own copy</AsyncPreview.Trigger>
				<AsyncPreview.Content>
					<AsyncPreview.Loading />
					<AsyncPreview.Error>
						{(state) => (
							<>
								<Text weight="medium">Billing is unreachable</Text>
								<Text size="xs" type="secondary">
									{(state.error as Error).message}
								</Text>
								<Button tone="neutral" buttonStyle="outline" onClick={state.refresh}>
									Try again
								</Button>
							</>
						)}
					</AsyncPreview.Error>
					<AsyncPreview.Body>{() => null}</AsyncPreview.Body>
				</AsyncPreview.Content>
			</AsyncPreview.Root>

			<AsyncPreview.Root<Customer, null, "missing">
				type="missing"
				context={null}
				onShow={async ({ signal }) => {
					await wait(500, signal)
					return null
				}}
			>
				<AsyncPreview.Trigger>Resolves to nothing</AsyncPreview.Trigger>
				<AsyncPreview.Content>
					<AsyncPreview.Loading />
					<AsyncPreview.Empty />
					<AsyncPreview.Body>{() => null}</AsyncPreview.Body>
				</AsyncPreview.Content>
			</AsyncPreview.Root>

			<AsyncPreview.Root<Customer, null, "static">
				type="static"
				context={null}
				data={CUSTOMERS["c-2"]!}
			>
				<AsyncPreview.Trigger>Already in hand</AsyncPreview.Trigger>
				<AsyncPreview.Content>
					<AsyncPreview.Body>
						{(data) => <CustomerCard customer={data as Customer} />}
					</AsyncPreview.Body>
				</AsyncPreview.Content>
			</AsyncPreview.Root>
		</Stack>
	)
}
