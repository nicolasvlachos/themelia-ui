import { useState } from "react"

import {
	SeoListing,
	calculateSeoScore,
	type SeoScoreInput,
} from "themelia-ui/admin/patterns/commerce"
import { FormField } from "themelia-ui/base/forms"
import { AdaptiveGrid, Stack } from "themelia-ui/base/structure"
import { Input, Textarea } from "themelia-ui/base/text-inputs"
import { ActionDialog } from "themelia-ui/features/overlays"

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

export default function CatalogueSeo() {
	return (
		<AdaptiveGrid minColumnWidth="lg" gap="xl" align="start">
			<ListingDemo initial={LISTING} />
			{/* Scored outside the card and handed in — the seam an editor uses. */}
			<ListingDemo initial={WEAK_LISTING} />
		</AdaptiveGrid>
	)
}
