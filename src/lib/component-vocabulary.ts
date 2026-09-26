/** Canonical three-step scale for package-owned component recipes. */
export const COMPONENT_SCALES = ['sm', 'md', 'lg'] as const;

export type ComponentScale = (typeof COMPONENT_SCALES)[number];

/** Canonical semantic colour intent for package-owned presentation. */
export const SEMANTIC_TONES = [
	'neutral',
	'primary',
	'secondary',
	'info',
	'success',
	'warning',
	'destructive',
] as const;

export type SemanticTone = (typeof SEMANTIC_TONES)[number];

/** Shared chrome for card-like surfaces. */
export const CARD_SURFACES = ['card', 'flat', 'framed'] as const;

export type CardSurface = (typeof CARD_SURFACES)[number];

/** Shared shell treatments for disclosure collections. */
export const DISCLOSURE_SURFACES = ['card', 'bordered', 'flat'] as const;

export type DisclosureSurface = (typeof DISCLOSURE_SURFACES)[number];
