import { useRef, useState } from "react"

import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/base/table"
import { Text } from "@/components/base/typography"
import { AsyncPreview, PreviewTriggerCell, clearAsyncPreviewCache } from "@/components/features"
import { Email, Money, RelativeTime, formatInitials } from "@/components/primitives"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

interface Customer {
	id: string
	name: string
	email: string
	plan: string
	spend: number
	lastSeen: string
}

const CUSTOMERS: Record<string, Customer> = {
	"c-1": { id: "c-1", name: "Northwind Traders", email: "ops@northwind.test", plan: "Scale", spend: 48_200, lastSeen: "2026-08-27T09:12:00Z" },
	"c-2": { id: "c-2", name: "Contoso Ltd", email: "billing@contoso.test", plan: "Team", spend: 12_400, lastSeen: "2026-08-25T16:40:00Z" },
	"c-3": { id: "c-3", name: "Fabrikam Inc", email: "hello@fabrikam.test", plan: "Starter", spend: 1_950, lastSeen: "2026-08-20T11:05:00Z" },
}

const ROWS = [
	{ id: "c-1", reference: "INV-4417", note: "" },
	{ id: "c-2", reference: "INV-4418", note: "" },
	{ id: "c-3", reference: "INV-4419", note: "" },
	{ id: null, reference: "INV-4420", note: "Imported without a customer record" },
]

const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		const timer = setTimeout(resolve, ms)
		signal?.addEventListener("abort", () => {
			clearTimeout(timer)
			reject(new DOMException("Aborted", "AbortError"))
		})
	})

function CustomerCard({ customer }: { customer: Customer }) {
	return (
		<Stack gap="md">
			<Stack direction="horizontal" gap="sm" align="center">
				<Avatar>
					<AvatarFallback>{formatInitials(customer.name)}</AvatarFallback>
				</Avatar>
				<Stack gap="none">
					<Text weight="medium">{customer.name}</Text>
					<Email value={customer.email} />
				</Stack>
			</Stack>
			<Stack direction="horizontal" gap="sm" align="center" wrap>
				<Badge tone="neutral">{customer.plan}</Badge>
				<Money amount={customer.spend} currency="USD" size="sm" />
				<Text size="xs" type="secondary">
					seen <RelativeTime value={customer.lastSeen} size="xs" type="inherit" />
				</Text>
			</Stack>
		</Stack>
	)
}

export function AsyncPreviewPage() {
	const [log, setLog] = useState<string[]>([])
	const callsRef = useRef(0)
	const failedOnce = useRef(false)

	const record = (line: string) => setLog((lines) => [line, ...lines].slice(0, 6))

	const fetchCustomer = async (id: string, signal: AbortSignal, delay = 700) => {
		callsRef.current += 1
		record(`request #${callsRef.current} → ${id}`)
		await wait(delay, signal)
		return CUSTOMERS[id] ?? null
	}

	return (
		<ComponentPage
			title="Async preview"
			summary="A popover that fetches when it opens. The kit owns the surface, the trigger, the four states, and the three things that make hover-fetching hard to get right — aborting, racing, and refetching what it already has. The consumer owns the request and what a record looks like."
			importPath="@/components/features/async-preview"
			exports={["AsyncPreview", "PreviewTriggerCell", "useAsyncPreview", "createAsyncPreview",
				"AsyncPreviewRoot", "AsyncPreviewTrigger", "AsyncPreviewContent", "AsyncPreviewBody", "AsyncPreviewLoading", "AsyncPreviewError", "AsyncPreviewEmpty", "AsyncPreviewState", "useAsyncPreviewContext",
			]}
		>
			<Example
				id="async-preview-basic"
				title="Fetching on open"
				description="onShow receives a signal and returns the record. Everything else — the spinner, the retry, the empty case — is already written, so a preview is the fetch plus what the record looks like."
				code={`<AsyncPreview.Root
  type="customer"
  context={{ id }}
  cacheKey={\`customer:\${id}\`}
  onShow={({ context, signal }) => getCustomer(context.id, signal)}
>
  <AsyncPreview.Trigger>Northwind Traders</AsyncPreview.Trigger>
  <AsyncPreview.Content>
    <AsyncPreview.Loading />
    <AsyncPreview.Error />
    <AsyncPreview.Empty />
    <AsyncPreview.Body>{(customer) => <CustomerCard customer={customer} />}</AsyncPreview.Body>
  </AsyncPreview.Content>
</AsyncPreview.Root>`}
			>
				<Stack direction="horizontal" gap="xl" wrap>
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
							buttonStyle="outline"
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
			</Example>

			<Example
				id="async-preview-states"
				title="The four states"
				description="idle before the first open, then one of loading, success, error, empty. A fetch that resolves to null or undefined is empty, not failed — “we looked and there is nothing” is a different sentence from “we could not look”, and a preview that conflates them sends the reader to check a record that is fine."
				code={`// null → empty, thrown → error
onShow={async ({ signal }) => {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(response.statusText)
  return (await response.json()) ?? null
}}`}
			>
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
			</Example>

			<Example
				id="preview-trigger-cell"
				title="PreviewTriggerCell"
				description="The trigger shaped for a table cell. It renders a button only when there is a preview to open — the last row has no customer, so it keeps the column's rhythm with no caret, no pointer, and no popup ARIA. A column where nine rows are clickable and the tenth only looks clickable is a column a reader stops trusting."
				stacked
				code={`<PreviewTriggerCell
  value={row.customerName}
  secondary={row.reference}
  hasPreview={row.customerId !== null}
  disabledReason="Imported without a customer record"
/>`}
			>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Customer</TableHead>
							<TableHead>Reference</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ROWS.map((row) => {
							const customer = row.id ? CUSTOMERS[row.id] : undefined
							return (
								<TableRow key={row.reference}>
									<TableCell>
										{customer ? (
											<AsyncPreview.Root<Customer, { id: string }, "customer">
												type="customer"
												context={{ id: customer.id }}
												cacheKey={`cell:${customer.id}`}
												onShow={({ context, signal }) => fetchCustomer(context.id, signal, 450)}
											>
												<AsyncPreview.Trigger>
													{() => (
														<PreviewTriggerCell
															value={customer.name}
															secondary={customer.email}
															badge={{ label: customer.plan }}
														/>
													)}
												</AsyncPreview.Trigger>
												<AsyncPreview.Content>
													<AsyncPreview.Loading />
													<AsyncPreview.Error />
													<AsyncPreview.Empty />
													<AsyncPreview.Body>
														{(data) => <CustomerCard customer={data as Customer} />}
													</AsyncPreview.Body>
												</AsyncPreview.Content>
											</AsyncPreview.Root>
										) : (
											<PreviewTriggerCell
												value={null}
												hasPreview={false}
												disabledReason={row.note}
											/>
										)}
									</TableCell>
									<TableCell>{row.reference}</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</Example>

			<Example id="async-preview-rule" title="What the hook handles for you" stacked>
				<Callout label="Rule">
					Three things, and they are the reason this is not a <code>useEffect</code> in a
					popover. <strong>Abort</strong>: the preview closes or changes record, the request is cancelled,
					and the rejection is swallowed rather than shown as an error.{" "}
					<strong>Race</strong>: two rows hovered in quick succession resolve out of order,
					and every response is checked against a request id before it writes state — so
					the second row never shows the first row&rsquo;s record. <strong>Repeat</strong>:
					a module-scope cache keyed by <code>cacheKey</code> serves a repeated hover
					without a request. No <code>cacheKey</code>, no cache — which is right for a
					preview whose context does not identify a record.
				</Callout>
			</Example>

			<Example id="async-preview-api" title="API">
				<PropTable owner="useAsyncPreview"
					rows={[
						{ name: "type", type: "string", description: "Names the kind of record. Passed back to onShow so one fetcher can serve several types." },
						{ name: "context", type: "TContext", description: "Whatever the fetcher needs — usually an id. Handed to onShow unchanged." },
						{ name: "onShow / data", type: "(args) => Promise<TData | null> / TData | null", description: "Supply one. `data` is the static form: same component, same states, no request, for a row that already loaded what the preview shows." },
						{ name: "cacheKey", type: "string", description: "Identifies the record and enables the cache. Change it when the record changes; absent means each open fetches or consumes its hover prefetch." },
						{ name: "cachePolicy", type: '"cache-first" | "always"', default: '"cache-first"', description: "`always` refetches on every open — for a value that changes while the reader is on the page." },
						{ name: "staleTime", type: "number", default: "300_000", description: "How long a cache entry counts as fresh, in ms. Entries are evicted on read; nothing wakes up on a timer." },
						{ name: "setLoading / setMeta", api: ["AsyncPreviewShowArgs.setLoading", "AsyncPreviewShowArgs.setMeta"], type: "(value) => void", description: "Given to onShow. setLoading reports a slow step — “Decrypting…” — without resolving; setMeta carries a count or a permission alongside the record." },
						{ name: "prefetchOnHover", api: "AsyncPreviewTrigger.prefetchOnHover", type: "boolean", default: "true", description: "On the Trigger. Starts the fetch on pointer-enter, once per record. Not on focus: prefetching for every trigger a keyboard user tabs past would fire a request per row." },
						{ name: "Body children", api: "AsyncPreviewBody.children", type: "(data, state) => ReactNode", description: "Runs only in the success state, with data non-null — so `data.name` needs no guard." },
						{ name: "Loading / Error / Empty children", api: ["AsyncPreviewLoading.children", "AsyncPreviewError.children", "AsyncPreviewEmpty.children"], type: "ReactNode | (state) => ReactNode", description: "Replaces the default. The function form is what an error slot wants — it is the only way to show the error." },
						{ name: "clearAsyncPreview\u00adCache", api: "clearAsyncPreviewCache", type: "(cacheKey?: string) => void", description: "One key, or everything. Call it after a mutation invalidates a record." },
						{ name: "createAsync\u00adPreview()", api: "createAsyncPreview", type: "<TData, TContext, TType>() => parts", description: "Binds the generics once for a record shape used in more than one place, instead of restating them at every part." },
						{ name: "hasPreview / disabledReason", api: ["PreviewTriggerCell.hasPreview", "PreviewTriggerCell.disabledReason"], type: "boolean / ReactNode", description: "On PreviewTriggerCell. Off renders an inert span with the same rhythm. A reason becomes a tooltip on it." },
						{ name: "AsyncPreviewRoot / AsyncPreviewTrigger / AsyncPreviewContent / AsyncPreviewBody", type: "component", description: "The compound over useAsyncPreview. Compound rather than one `renderPreview` prop because the four states want four different shapes, and a single render prop makes the caller branch on all of them every time." },
						{ name: "AsyncPreviewLoading / AsyncPreviewError / AsyncPreviewEmpty / AsyncPreviewState", type: "component", description: "One per state, so each is styled where it is written. AsyncPreviewState is the escape hatch for a caller who genuinely wants to branch themselves." },
						{ name: "useAsyncPreviewContext", type: "hook", description: "The current state and data, for a part rendered outside the provided ones \u2014 a footer that counts results, a header that names what is loading." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
