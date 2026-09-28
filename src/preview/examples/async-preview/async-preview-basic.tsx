import { useRef, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { AsyncPreview, clearAsyncPreviewCache } from "themelia-ui/features/async-preview"

import { CustomerCard } from "./_shared"
import { CUSTOMERS, wait, type Customer } from "./data"

export default function AsyncPreviewBasic() {
	const [log, setLog] = useState<string[]>([])
	const callsRef = useRef(0)

	const record = (line: string) => setLog((lines) => [line, ...lines].slice(0, 6))

	const fetchCustomer = async (id: string, signal: AbortSignal, delay = 700) => {
		callsRef.current += 1
		record(`request #${callsRef.current} → ${id}`)
		await wait(delay, signal)
		return CUSTOMERS[id] ?? null
	}

	return (
		<Stack direction="horizontal" wrap align="center">
			<Stack direction="horizontal" wrap>
				{Object.values(CUSTOMERS).map((customer) => (
					<AsyncPreview.Root<Customer, { id: string }, "customer">
						key={customer.id}
						type="customer"
						context={{ id: customer.id }}
						cacheKey={`customer:${customer.id}`}
						onShow={({ context, signal }) => fetchCustomer(context.id, signal)}
					>
						<AsyncPreview.Trigger>{customer.name}</AsyncPreview.Trigger>
						<AsyncPreview.Content>
							<AsyncPreview.Loading />
							<AsyncPreview.Error />
							<AsyncPreview.Empty />
							<AsyncPreview.Body>
								{(data) => <CustomerCard customer={data as Customer} />}
							</AsyncPreview.Body>
						</AsyncPreview.Content>
					</AsyncPreview.Root>
				))}
			</Stack>

			<Stack gap="sm">
				<Stack direction="horizontal" gap="sm" align="center">
					<Button
						tone="neutral"
						appearance="outline"
						onClick={() => {
							clearAsyncPreviewCache()
							setLog([])
							callsRef.current = 0
						}}
					>
						Clear the cache
					</Button>
					<Text size="xs" type="secondary">
						Hover one twice — the second open makes no request.
					</Text>
				</Stack>
				{log.length > 0 && (
					<Stack gap="none">
						{log.map((line, index) => (
							<Text key={`${line}-${index}`} size="xs" type="secondary" numeric>
								{line}
							</Text>
						))}
					</Stack>
				)}
			</Stack>
		</Stack>
	)
}
