import { useDeferredValue, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/base/badge"
import { Empty } from "@/components/base/feedback"
import { PillRadioGroup } from "@/components/base/choice-inputs"
import { AdaptiveGrid, Stack } from "@/components/base/structure"
import { NativeSelect, SearchInput } from "@/components/base/text-inputs"
import { Heading, Text } from "@/components/base/typography"

import gallery from "../generated/gallery.json"
import styles from "../preview.module.css"

/**
 * Every component on one page, each card with its page summary and the family's
 * `chooseWhen` / `avoidWhen` guidance.
 */
type Card = (typeof gallery.cards)[number]

/* Bottom to top; `foundation` (provider, form contract) last, beside the stack. */
const LAYER_ORDER = [
	"typography",
	"primitives",
	"base",
	"layout",
	"features",
	"patterns",
	"admin",
	"foundation",
]

const LAYERS = LAYER_ORDER.filter((layer) => gallery.cards.some((card) => card.layer === layer))
const LAYER_OPTIONS = [
	{ value: "all", label: `All (${gallery.cards.length})` },
	...LAYERS.map((id) => ({
		value: id,
		label: `${id} (${gallery.cards.filter((card) => card.layer === id).length})`,
	})),
]

/*
 * Words that match everything and therefore mean nothing here.
 *
 * A purpose is phrased as a sentence — "pick one of several", "a status on a row" — and
 * without this the short connectives outscore the words that carry the question: "one",
 * "of" and "on" appear in most summaries, so the query returned File upload and Phone for
 * a question about radio groups. Dropped rather than down-weighted, because their score
 * is noise at any weight.
 */
const STOPWORDS = new Set([
	"a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has", "have", "in",
	"into", "is", "it", "its", "of", "on", "or", "that", "the", "their", "them", "then", "there",
	"these", "they", "this", "to", "was", "were", "when", "which", "with", "you", "your",
])

export function GalleryPage() {
	const [query, setQuery] = useState("")
	const [layer, setLayer] = useState("all")

	/*
	 * Deferred, so typing stays responsive while the card set re-filters. The input keeps its
	 * own value — only the LIST lags, which is the trade this hook exists to make.
	 */
	const deferred = useDeferredValue(query)

	const matches = useMemo(() => {
		const terms = deferred
			.toLowerCase()
			.split(/\s+/)
			.filter((term) => term.length > 1 && !STOPWORDS.has(term))

		const inLayer = gallery.cards.filter((card) => layer === "all" || card.layer === layer)
		if (terms.length === 0) return inLayer

		/*
		 * Scored, not filtered on every term.
		 *
		 * Requiring all of them made a plain-English question return nothing: "pick one of
		 * several" needs four words in one card, and the empty state was suggesting exactly
		 * that phrasing. A purpose is the thing a reader can express before they know the
		 * name, so a term that misses should cost a card its place in the order rather than
		 * its place in the list.
		 *
		 * Same weights as `scripts/find-component.mjs`, so the page and the CLI answer the
		 * same question the same way.
		 */
		const norm = (value: string) => value.toLowerCase().replace(/[-_]/g, " ")

		const scored = inLayer
			.map((card) => {
				let score = 0
				for (const term of terms) {
					if (card.exports.some((name) => norm(name) === term)) score += 14
					else if (card.exports.some((name) => norm(name).includes(term))) score += 6
					if (norm(card.title) === term) score += 10
					else if (norm(card.title).includes(term)) score += 5
					if (card.keywords.some((word) => norm(word) === term)) score += 6
					else if (card.keywords.some((word) => norm(word).includes(term))) score += 3
					if (card.summary && norm(card.summary).includes(term)) score += 2
					if (card.chooseWhen && norm(card.chooseWhen).includes(term)) score += 2
					if (norm(card.import).includes(term)) score += 1
				}
				return { card, score }
			})
			.filter((entry) => entry.score > 0)

		scored.sort((a, b) => b.score - a.score || a.card.title.localeCompare(b.card.title))
		return scored.map((entry) => entry.card)
	}, [deferred, layer])

	return (
		<>
			<section className={styles.hero}>
				<Heading level={1} size="2xl">
					Components
				</Heading>
				<div style={{ marginTop: "var(--space-lg)" }}>
					<Text type="secondary" size="lg">
						{gallery.cards.length} documented pages, each with the line that says when to
						reach for it — and when not to.
					</Text>
				</div>
			</section>

			<section className={styles.section}>
				<Stack gap="md">
					<SearchInput
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						onClear={() => setQuery("")}
						placeholder="Filter by name, purpose or import path"
						aria-label="Filter components"
					/>

					<div className={styles.galleryLayerPills}>
						<PillRadioGroup
							value={layer}
							/* The group can clear to null; the gallery's cleared state is "all". */
							onValueChange={(next) => setLayer(next ?? "all")}
							aria-label="Filter by layer"
							options={LAYER_OPTIONS}
						/>
					</div>
					<NativeSelect
						value={layer}
						onChange={(event) => setLayer(event.target.value)}
						aria-label="Filter by layer"
						className={styles.galleryLayerSelect}
					>
						{LAYER_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</NativeSelect>

					{/*
					 * Announced, because filtering is a change a sighted reader sees and nobody
					 * else does. `aria-live` on the count rather than on the grid: re-reading every
					 * card titles on every keystroke is worse than not announcing at all.
					 */}
					<Text size="xs" type="secondary" aria-live="polite">
						{matches.length === gallery.cards.length
							? `${matches.length} components`
							: `${matches.length} of ${gallery.cards.length} components`}
					</Text>
				</Stack>
			</section>

			{matches.length === 0 ? (
				<Empty
					title="Nothing matches that"
					description="Try a purpose rather than a name — “confirm a destructive action”, “money”, “empty state”."
					border
				/>
			) : (
				<AdaptiveGrid minColumnWidth="lg" gap="md">
					{matches.map((card) => (
						<GalleryCard key={`${card.route}:${card.title}`} card={card} />
					))}
				</AdaptiveGrid>
			)}
		</>
	)
}

function GalleryCard({ card }: { card: Card }) {
	return (
		/*
		 * The whole card is the link, not a "view" action inside it. A grid of cards where
		 * only part of each is clickable is the shape people miss, and there is exactly one
		 * destination here.
		 */
		<Link to={card.route} className={styles.galleryCard}>
			<Stack gap="xs">
				<div className={styles.galleryCardHead}>
					<Heading level={2} size="sm">
						{card.title}
					</Heading>
					{!!card.layer && (
						<Badge tone="neutral">
							{card.layer}
						</Badge>
					)}
				</div>

				<Text size="sm" type="secondary">
					{card.summary}
				</Text>

				{!!card.chooseWhen && (
					<Text size="xs" type="secondary">
						<strong>Choose when</strong> {card.chooseWhen}
					</Text>
				)}
			</Stack>
		</Link>
	)
}
