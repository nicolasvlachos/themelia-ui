import { useState } from "react"

import {
	BookingCard, InventorySection, SeoListing, VendorProfile,
	calculateSeoScore,
	type InventorySectionValue, type SeoScoreInput,
} from "@/components/admin/patterns/commerce"
import { Badge } from "@/components/base/badge"
import { ContentBlock } from "@/components/base/display"
import { FormField } from "@/components/base/forms"
import { AdaptiveGrid, Stack } from "@/components/base/structure"
import { Input, Textarea } from "@/components/base/text-inputs"
import { toast } from "@/components/base/toaster"
import { ActionDialog } from "@/components/features/overlays"
import { Money, Number as NumberValue } from "@/components/primitives"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const LISTING = {
	title: "Merino crew neck sweater — soft, breathable, machine washable",
	description:
		"A midweight merino crew neck that holds its shape, resists odour, and washes at 30°C. Ships free in the EU, returns accepted for 60 days.",
	permalink: "https://northwind.example/products/merino-crew-neck",
	baseUrl: "https://northwind.example",
	keyword: "merino crew neck",
}

/* A deliberately weak listing, so both ends of the scale are visible on one page. */
const WEAK_LISTING = {
	title: "Sweater",
	description: "A sweater.",
	permalink: "http://northwind.example/p/SKU_44172?ref=home",
	baseUrl: "http://northwind.example",
}

const INVENTORY: InventorySectionValue = {
	sku: "MRN-CRW-M-CHR",
	barcode: "5012345678900",
	trackQuantity: true,
	available: "84",
	committed: "12",
	incoming: "60",
	lowStockThreshold: "20",
	inventoryPolicy: "deny",
	binLocation: "A-14-3",
	requiresShipping: true,
	weight: "0.42",
	countryOfOrigin: "Portugal",
	hsCode: "6110.11",
	tags: ["knitwear", "core", "autumn"],
}

function ListingDemo({ initial }: { initial: SeoScoreInput }) {
	const [listing, setListing] = useState(initial)
	const [draft, setDraft] = useState(initial)
	const [open, setOpen] = useState(false)
	return (
		<>
			<SeoListing
				listing={listing}
				score={calculateSeoScore(listing)}
				onEdit={() => { setDraft(listing); setOpen(true) }}
			/>
			<ActionDialog
				open={open}
				onOpenChange={setOpen}
				title="Edit search appearance"
				description="Update the title, description, and address shown in the preview."
				strings={{ confirm: "Save changes" }}
				onConfirm={() => setListing(draft)}
			>
				<Stack gap="lg">
					<FormField label="Page title">
						<Input value={draft.title ?? ""} onChange={event => setDraft({ ...draft, title: event.target.value })} />
					</FormField>
					<FormField label="Description">
						<Textarea value={draft.description ?? ""} onChange={event => setDraft({ ...draft, description: event.target.value })} />
					</FormField>
					<FormField label="Permalink">
						<Input value={draft.permalink ?? ""} onChange={event => setDraft({ ...draft, permalink: event.target.value })} />
					</FormField>
					<FormField label="Site address">
						<Input value={draft.baseUrl ?? ""} onChange={event => setDraft({ ...draft, baseUrl: event.target.value })} />
					</FormField>
				</Stack>
			</ActionDialog>
		</>
	)
}

function InventoryDemo() {
	const [value, setValue] = useState(INVENTORY)
	return (
		<InventorySection
			value={value}
			onFieldChange={({ field, value: next }) => setValue((current) => ({ ...current, [field]: next }))}
		/>
	)
}

export function BlocksCataloguePage() {
	return (
		<ComponentPage
			title="Catalogue & partners"
			summary="Product search appearance, stock management, supplier profiles, and booking details. Structured for everyday catalogue operations."
			importPath="themelia-ui/admin/patterns/commerce"
			exports={["SeoListing", "calculateSeoScore", "InventorySection", "VendorProfile", "BookingCard"]}
		>
			<Example
				id="catalogue-seo"
				title="SeoListing"
				description="A search-result preview and a compact quality checklist. Edit either listing to change its content and recalculate the score."
				stacked
				code={`import { calculateSeoScore } from "themelia-ui/admin/patterns/commerce"

const score = calculateSeoScore({ title, description, permalink, baseUrl, keyword })
<SeoListing listing={listing} score={score} onEdit={edit} />`}
			>
				<AdaptiveGrid minColumnWidth="lg" gap="xl" align="start">
					<ListingDemo initial={LISTING} />
					{/* Scored outside the card and handed in — the seam an editor uses. */}
					<ListingDemo initial={WEAK_LISTING} />
				</AdaptiveGrid>
			</Example>

			<Example
				id="catalogue-inventory"
				title="InventorySection"
				description="Stock levels at a glance, followed by grouped product, tracking, location, shipping, and customs fields. Edits update the controlled record; toggling tracking preserves its quantities."
				stacked
				code={`<InventorySection
  value={value}
  sections={["summary", "identity", "tracking"]}
  onFieldChange={({ field, value }) => update(field, value)}
/>`}
			>
				<Stack maxWidth="40rem" gap="none">
					<InventoryDemo />
				</Stack>
			</Example>

			<Example
				id="catalogue-vendor"
				title="VendorProfile"
				description="Supplier identity, operating facts, and performance in distinct sections. Switch tabs to compare performance; action callbacks belong to your application."
				stacked
				code={`<VendorProfile name="Northwind Traders" earnings="48,200.00 EUR" metrics={metrics} stats={stats} />`}
			>
				<AdaptiveGrid minColumnWidth="lg" gap="xl" align="start">
					<ContentBlock surface="bordered">
						<VendorProfile
							name="Northwind Traders"
							role="Knitwear · Portugal"
							verified
							earnings="48,200.00 EUR"
							metrics={[
								{ id: "1", label: "Lead time", value: "6 days" },
								{ id: "2", label: "Fill rate", value: "98.2%" },
								{ id: "3", label: "Open disputes", value: "0" },
							]}
							stats={[
								{ id: "1", label: "On-time", value: "96%", change: "+2pp", changeTone: "success" },
								{ id: "2", label: "Returns", value: "1.8%", change: "+0.4pp", changeTone: "warning" },
								{ id: "3", label: "Orders", value: <NumberValue value={1284} size="inherit" weight="semibold" /> },
								{ id: "4", label: "Rating", value: "4.7 / 5" },
							]}
							onMessage={() => toast("Supplier selected", { description: "Ready to start a conversation." })}
							onHire={() => toast("Supplier selected", { description: "Ready to start onboarding." })}
						/>
					</ContentBlock>
					<ContentBlock surface="bordered">
						<VendorProfile
							name="Bansko Textiles"
							role="Cut and sew · Bulgaria"
							metrics={[
								{ id: "1", label: "Lead time", value: "11 days" },
								{ id: "2", label: "Fill rate", value: "91.0%" },
							]}
							onMessage={() => toast("Supplier selected", { description: "Ready to start a conversation." })}
						/>
					</ContentBlock>
				</AdaptiveGrid>
			</Example>

			<Example
				id="catalogue-booking"
				title="BookingCard"
				description="Reservation identity and status, paired booking facts, and a separate note and action."
				stacked
				code={`<BookingCard title="Reservation #4417" details={details} actionLabel="Open booking" onAction={open} />`}
			>
				<Stack maxWidth="36rem" gap="none">
					<BookingCard
						title="Reservation #4417"
						description="Studio session, two hours"
						status={<Badge tone="success">Confirmed</Badge>}
						details={[
							{ id: "date", label: "Date", value: "02 Sep 2026, 09:30" },
							{ id: "customer", label: "Customer", value: "Alice Mercer" },
							{ id: "room", label: "Room", value: "Studio B" },
							{ id: "amount", label: "Amount", value: <Money amount={120} currency="EUR" /> },
							{ id: "note", label: "Note", value: "Needs the tall backdrop stand.", fullWidth: true },
						]}
						actionLabel="Open booking"
						onAction={() => toast("Open reservation #4417 requested")}
					/>
				</Stack>
			</Example>

			<Example id="catalogue-props" title="Props">
				<Callout>
					<code>InventorySection</code> never validates. What counts as a valid SKU, weight
					or HS code is the consumer's rule, and a component that guessed would fight them.
					It reports edits; deciding whether one is allowed stays at the call site.
				</Callout>
				<PropTable
					rows={[
						{ name: "SeoListing listing", type: "SeoScoreInput", required: true, description: "title, description, permalink, baseUrl, keyword, and optional limits. Scored on render unless a score is supplied." },
						{ name: "SeoListing score", type: "SeoScore", description: "A score computed elsewhere — by an editor scoring as the user types. Without it the card scores the listing itself." },
						{ name: "calculateSeoScore", type: "(input) => SeoScore", description: "Plain function, no React. Returns the total, a status, and a per-check breakdown with the measured lengths." },
						{ name: "InventorySection value", type: "InventorySectionValue", required: true, description: "sku, barcode, trackQuantity, available, committed, incoming, lowStockThreshold, inventoryPolicy, binLocation, requiresShipping, weight, countryOfOrigin, hsCode, tags." },
						{ name: "InventorySection onFieldChange", type: "({ field, value, previousValue }) => void", description: "Reports what it replaced as well as what it is now — an undo stack that has to remember that itself is one that gets it wrong once." },
						{ name: "InventorySection sections", type: "InventorySectionName[]", default: "all", description: "Narrows what is drawn, so one surface serves a simple product, a variant and a location record without forking." },
						{ name: "VendorProfile metrics / stats", type: "VendorMetric[] / VendorStat[]", description: "Supplying both gives tabs; supplying either alone renders that view bare." },
						{ name: "VendorProfile view / onViewChange", type: "VendorView / (view) => void", description: "Controlled. Uncontrolled it opens on whichever view has data." },
						{ name: "BookingCard details", type: "BookingDetail[]", required: true, description: "Rendered as a real <dl>, so a screen reader pairs each value with its own label. fullWidth spans the row and gets its own ground." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
