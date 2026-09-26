/**
 * Scores a listing's search presentation. Pure functions, so a draft can be scored while
 * typing. Weights: title 30, description 30, permalink 15, slug 10, origin 10, and keyword
 * 5 only when a keyword is supplied.
 */
export type SeoCheckId = "title" | "description" | "permalink" | "slug" | "url" | "keyword"

/** `review` is "present but outside the range", not "broken". */
export type SeoCheckStatus = "good" | "review" | "missing"

export interface SeoLimits {
	titleMin: number
	titleMax: number
	descriptionMin: number
	descriptionMax: number
	permalinkMax: number
}

/** Google truncates around these; they are conventions, not rules, so they are overridable. */
export const DEFAULT_SEO_LIMITS: SeoLimits = {
	titleMin: 35,
	titleMax: 60,
	descriptionMin: 120,
	descriptionMax: 160,
	permalinkMax: 75,
}

export interface SeoScoreInput {
	title?: string
	description?: string
	/** The full URL, or just its path. */
	permalink?: string
	/** The origin the permalink sits on — scored for HTTPS. */
	baseUrl?: string
	/** What the copy is meant to rank for. Omit it and the check is not run. */
	keyword?: string
	limits?: Partial<SeoLimits>
}

export interface SeoCheck {
	id: SeoCheckId
	status: SeoCheckStatus
	score: number
	maxScore: number
	/**
	 * The unrounded fraction earned, for percentages: `score` is rounded to whole points and
	 * can hide a small penalty. Always set by `calculateSeoScore`; optional so hand-built
	 * checks stay valid, and readers fall back to `score / maxScore`.
	 */
	ratio?: number
	/** The measured length, so a card can show "62 / 60". */
	actual: number
	min?: number
	max?: number
}

export interface SeoScore {
	/** 0–100. */
	score: number
	status: SeoCheckStatus
	checks: SeoCheck[]
	limits: SeoLimits
}

function clamp01(value: number): number {
	if (!Number.isFinite(value)) return 0
	return Math.max(0, Math.min(1, value))
}

function statusFor(score: number, maxScore: number): SeoCheckStatus {
	if (maxScore <= 0) return "missing"
	const ratio = score / maxScore
	if (ratio >= 0.9) return "good"
	if (ratio >= 0.5) return "review"
	return "missing"
}

function check(
	id: SeoCheckId,
	ratio: number,
	maxScore: number,
	actual: number,
	range?: { min?: number; max?: number },
): SeoCheck {
	const earned = clamp01(ratio)
	const score = Math.round(earned * maxScore)
	return { id, score, maxScore, ratio: earned, actual, status: statusFor(score, maxScore), ...range }
}

/**
 * In range scores 1. Short scores proportionally, floored at 0.35. Long decays from the
 * cap, floored at 0.55 until it passes double the cap (then 0.35).
 */
function lengthScore(value: string, min: number, max: number): number {
	const length = value.trim().length
	if (length === 0) return 0
	if (length >= min && length <= max) return 1
	if (length < min) return Math.max(0.35, length / min)
	if (length > max * 2) return 0.35
	return Math.max(0.55, 1 - (length - max) / max)
}

/** The path alone — no origin, no query, no fragment. */
export function seoPermalinkPath(permalink?: string): string {
	const value = permalink?.trim() ?? ""
	if (!value) return ""
	const withoutHash = value.split("#")[0] ?? ""
	const withoutQuery = withoutHash.split("?")[0] ?? ""
	return withoutQuery.replace(/^https?:\/\/[^/]+/i, "").replace(/^\/+|\/+$/g, "")
}

/** The last segment of the path — the part a human reads. */
export function seoPermalinkSlug(permalink?: string): string {
	return seoPermalinkPath(permalink).split("/").filter(Boolean).at(-1) ?? ""
}

function permalinkScore(permalink: string | undefined, max: number): number {
	const path = seoPermalinkPath(permalink)
	if (!path) return 0
	if (path.length <= max) return 1
	if (path.length > max * 2) return 0.35
	return Math.max(0.55, 1 - (path.length - max) / max)
}

/**
 * Lower-case words joined by single hyphens score full (Unicode letters included); anything
 * without whitespace or query characters is workable.
 */
function slugScore(permalink?: string): number {
	const slug = seoPermalinkSlug(permalink)
	if (!slug) return 0
	if (/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug) && slug === slug.toLowerCase()) return 1
	if (!/\s/.test(slug) && !/[?#]/.test(slug)) return 0.65
	return 0.25
}

function urlScore(baseUrl?: string): number {
	const value = baseUrl?.trim() ?? ""
	if (!value) return 0
	if (/^https:\/\//i.test(value)) return 1
	// Reachable but not secure.
	if (/^http:\/\//i.test(value)) return 0.6
	return 0.45
}

function keywordScore(input: SeoScoreInput): number | null {
	const keyword = input.keyword?.trim().toLowerCase()
	if (!keyword) return null

	const haystack = [input.title, input.description, seoPermalinkPath(input.permalink)]
		.filter(Boolean)
		.join(" ")
		.toLowerCase()

	if (!haystack) return 0
	return haystack.includes(keyword) ? 1 : 0.35
}

export function calculateSeoScore(input: SeoScoreInput): SeoScore {
	const limits: SeoLimits = { ...DEFAULT_SEO_LIMITS, ...input.limits }
	const title = input.title?.trim() ?? ""
	const description = input.description?.trim() ?? ""

	const checks: SeoCheck[] = [
		check("title", lengthScore(title, limits.titleMin, limits.titleMax), 30, title.length, {
			min: limits.titleMin,
			max: limits.titleMax,
		}),
		check(
			"description",
			lengthScore(description, limits.descriptionMin, limits.descriptionMax),
			30,
			description.length,
			{ min: limits.descriptionMin, max: limits.descriptionMax },
		),
		check("permalink", permalinkScore(input.permalink, limits.permalinkMax), 15, seoPermalinkPath(input.permalink).length, {
			max: limits.permalinkMax,
		}),
		check("slug", slugScore(input.permalink), 10, seoPermalinkSlug(input.permalink).length),
		check("url", urlScore(input.baseUrl), 10, input.baseUrl?.trim().length ?? 0),
	]

	const keyword = keywordScore(input)
	if (keyword !== null) {
		checks.push(check("keyword", keyword, 5, input.keyword?.trim().length ?? 0))
	}

	/* Out of the points actually in play, so an absent keyword does not cost anything. */
	const earned = checks.reduce((sum, entry) => sum + entry.score, 0)
	const available = checks.reduce((sum, entry) => sum + entry.maxScore, 0)
	const score = Math.round((earned / available) * 100)

	return { score, status: statusFor(score, 100), checks, limits }
}
