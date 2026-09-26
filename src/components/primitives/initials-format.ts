const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

export type InitialsStrategy = 'first-last' | 'first-words';
export type InitialsMaxCharacters = 1 | 2 | 3;

export interface InitialsFormatOptions {
	/** First + last word by default; use first-words to preserve the first N words. */
	strategy?: InitialsStrategy;
	/** Maximum visible characters. Defaults to 2. */
	maxCharacters?: InitialsMaxCharacters;
	/** Optional BCP-47 locale used for locale-sensitive uppercasing. */
	locale?: string;
	/** Returned when no usable letter or number exists. Defaults to an empty string. */
	fallback?: string;
}

function getWordCharacters(word: string) {
	return Array.from(word).filter((character) => LETTER_OR_NUMBER.test(character));
}

function normalizeMaxCharacters(value: InitialsMaxCharacters | number | undefined) {
	if (!Number.isFinite(value)) return 2;
	return Math.min(3, Math.max(1, Math.trunc(value ?? 2)));
}

function uppercase(value: string, locale?: string) {
	return locale ? value.toLocaleUpperCase(locale) : value.toUpperCase();
}

/**
 * Derive short, Unicode-aware initials from a person or resource name.
 *
 * `first-last` is the identity default (`Mary Jane Smith` → `MS`). Use
 * `first-words` for admin surfaces that intentionally use the first
 * two words (`Mary Jane Smith` → `MJ`). Single-word `first-last` values use
 * the first N letters (`OpenAI` → `OP`).
 */
export function formatInitials(
	value: string | null | undefined,
	options: InitialsFormatOptions = {},
): string {
	const {
		strategy = 'first-last',
		locale,
		fallback = '',
	} = options;
	const maxCharacters = normalizeMaxCharacters(options.maxCharacters);
	const normalized = value?.trim().replace(/\s+/g, ' ') ?? '';
	if (!normalized) return fallback;

	const words = normalized
		.split(' ')
		.map(getWordCharacters)
		.filter((characters) => characters.length > 0);
	if (words.length === 0) return fallback;

	let characters: string[];
	// Entries are character arrays; `words` is non-empty here, so the defaults only satisfy
	// `noUncheckedIndexedAccess`.
	const firstWord: string[] = words[0] ?? [];
	const lastWord: string[] = words[words.length - 1] ?? [];

	if (strategy === 'first-words') {
		characters = words.slice(0, maxCharacters).map((word) => word[0] ?? '');
	} else if (words.length === 1) {
		characters = firstWord.slice(0, maxCharacters);
	} else if (maxCharacters === 1) {
		characters = [firstWord[0] ?? ''];
	} else {
		const middle = words
			.slice(1, -1)
			.slice(0, Math.max(0, maxCharacters - 2))
			.map((word) => word[0] ?? '');
		characters = [firstWord[0] ?? '', ...middle, lastWord[0] ?? ''];
	}

	const initials = characters.join('');
	return initials ? uppercase(initials, locale) : fallback;
}
