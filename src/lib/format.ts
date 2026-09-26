/**
 * Shared formatting for display components. `EMPTY` is the canonical placeholder for a
 * missing value. The `format*` helpers wrap `Intl.NumberFormat`, defaulting to the
 * system locale; pass `locale` to pin output.
 */
export const EMPTY = '—';

export interface FormatNumberOptions {
	locale?: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	notation?: Intl.NumberFormatOptions['notation'];
}

export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
	if (!Number.isFinite(value)) return EMPTY;
	const {
		locale,
		minimumFractionDigits,
		maximumFractionDigits,
		notation,
	} = options;
	return new Intl.NumberFormat(locale, {
		minimumFractionDigits,
		maximumFractionDigits,
		notation,
	}).format(value);
}

export interface FormatCurrencyOptions extends FormatNumberOptions {
	currency?: string;
	currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
}

export function formatCurrency(value: number, options: FormatCurrencyOptions = {}): string {
	if (!Number.isFinite(value)) return EMPTY;
	const {
		locale,
		currency = 'EUR',
		currencyDisplay = 'symbol',
		minimumFractionDigits,
		maximumFractionDigits,
		notation,
	} = options;
	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency,
			currencyDisplay,
			minimumFractionDigits,
			maximumFractionDigits,
			notation,
		}).format(value);
	} catch {
		// Unknown / unsupported currency code — fall back to plain number + code suffix.
		return `${formatNumber(value, options)} ${currency}`;
	}
}

export interface FormatPercentageOptions extends FormatNumberOptions {
	/** When true, treat `value` as already a percentage (e.g. 12.5 → "12.5%"). Default: false (0.125 → "12.5%"). */
	scaled?: boolean;
}

export function formatPercentage(value: number, options: FormatPercentageOptions = {}): string {
	if (!Number.isFinite(value)) return EMPTY;
	const { locale, minimumFractionDigits, maximumFractionDigits = 1, scaled = false } = options;
	const ratio = scaled ? value / 100 : value;
	return new Intl.NumberFormat(locale, {
		style: 'percent',
		minimumFractionDigits,
		maximumFractionDigits,
	}).format(ratio);
}

/** Options for localized duration formatting. Defaults: seconds in, narrow units out. */
export type DurationUnit = 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days';
export type DurationUnitDisplay = 'narrow' | 'short' | 'long';

export interface FormatDurationOptions {
	/** Unit used by the incoming value. Defaults to seconds. */
	from?: DurationUnit;
	/** BCP-47 locale passed to Intl.NumberFormat. */
	locale?: string;
	/** Number of non-zero units to show. Defaults to all five units. */
	maxParts?: number;
	/** Intl unit-label style. `narrow` provides the compact `1h 5m` default. */
	unitDisplay?: DurationUnitDisplay;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
}

const DURATION_FACTORS = [
	{ unit: 'day', milliseconds: 86_400_000 },
	{ unit: 'hour', milliseconds: 3_600_000 },
	{ unit: 'minute', milliseconds: 60_000 },
	{ unit: 'second', milliseconds: 1_000 },
	{ unit: 'millisecond', milliseconds: 1 },
] as const;

const DURATION_INPUT_FACTORS: Record<DurationUnit, number> = {
	milliseconds: 1,
	seconds: 1_000,
	minutes: 60_000,
	hours: 3_600_000,
	days: 86_400_000,
};

/**
 * Format a duration into localized unit parts. Values use seconds and compact
 * unit labels by default; pass `from` to select another input unit.
 */
export function formatDuration(value: number, options: FormatDurationOptions = {}): string {
	if (!Number.isFinite(value)) return EMPTY;

	const {
		from = 'seconds',
		locale,
		maxParts = DURATION_FACTORS.length,
		unitDisplay = 'narrow',
		minimumFractionDigits,
	} = options;
	const maximumFractionDigits = Math.max(
		minimumFractionDigits ?? 0,
		options.maximumFractionDigits ?? 0,
	);
	const safeMaxParts = Math.max(1, Math.floor(maxParts));
	const negative = value < 0;
	let totalMilliseconds = Math.abs(value) * DURATION_INPUT_FACTORS[from];

	// Seconds round to whole seconds unless fractional precision is requested.
	if (
		from === 'seconds'
		&& options.minimumFractionDigits === undefined
		&& options.maximumFractionDigits === undefined
	) {
		totalMilliseconds = Math.round(totalMilliseconds / 1_000) * 1_000;
	}

	if (totalMilliseconds === 0) {
		const zeroUnit = from === 'milliseconds' ? 'millisecond' : 'second';
		return new Intl.NumberFormat(locale, {
			style: 'unit',
			unit: zeroUnit,
			unitDisplay,
			minimumFractionDigits,
			maximumFractionDigits,
		}).format(0);
	}

	// Round at the smallest displayed unit before decomposing, so carries propagate
	// (no `59m 60s` at a max-parts boundary).
	let unitProbe = totalMilliseconds;
	const populatedUnitIndexes: number[] = [];
	for (let index = 0; index < DURATION_FACTORS.length; index += 1) {
		// `noUncheckedIndexedAccess` is on here, and the loop bound already guarantees a hit.
		const factor = DURATION_FACTORS[index];
		if (!factor) continue;
		const amount = Math.floor(unitProbe / factor.milliseconds);
		if (amount > 0) populatedUnitIndexes.push(index);
		unitProbe -= amount * factor.milliseconds;
	}
	const roundingUnitIndex = populatedUnitIndexes[
		Math.min(safeMaxParts, populatedUnitIndexes.length) - 1
	] ?? DURATION_FACTORS.length - 1;
	// Clamped above; the fallback only satisfies the checker.
	const roundingUnit = DURATION_FACTORS[roundingUnitIndex] ?? DURATION_FACTORS[DURATION_FACTORS.length - 1]!;
	const roundingIncrement = roundingUnit.milliseconds / (10 ** maximumFractionDigits);
	totalMilliseconds = Math.round(totalMilliseconds / roundingIncrement) * roundingIncrement;

	if (totalMilliseconds === 0) {
		const zeroUnit = from === 'milliseconds' ? 'millisecond' : 'second';
		return new Intl.NumberFormat(locale, {
			style: 'unit',
			unit: zeroUnit,
			unitDisplay,
			minimumFractionDigits,
			maximumFractionDigits,
		}).format(0);
	}

	let remaining = totalMilliseconds;

	const startIndex = Math.max(
		0,
		DURATION_FACTORS.findIndex(({ milliseconds }) => remaining >= milliseconds),
	);
	const parts: string[] = [];

	for (let index = startIndex; index < DURATION_FACTORS.length && parts.length < safeMaxParts; index += 1) {
		// `noUncheckedIndexedAccess` is on here, and the loop bound already guarantees a hit.
		const factor = DURATION_FACTORS[index];
		if (!factor) continue;
		const isLastPart = parts.length === safeMaxParts - 1 || index === DURATION_FACTORS.length - 1;
		const amount = isLastPart ? remaining / factor.milliseconds : Math.floor(remaining / factor.milliseconds);
		const visibleAmount = isLastPart
			? Math.round(amount * (10 ** maximumFractionDigits)) / (10 ** maximumFractionDigits)
			: amount;
		if (visibleAmount <= 0) continue;

		const signedAmount = negative && parts.length === 0 ? -amount : amount;
		parts.push(new Intl.NumberFormat(locale, {
			style: 'unit',
			unit: factor.unit,
			unitDisplay,
			minimumFractionDigits: isLastPart ? minimumFractionDigits : 0,
			maximumFractionDigits: isLastPart ? maximumFractionDigits : 0,
		}).format(signedAmount));
		remaining -= Math.floor(amount) * factor.milliseconds;
	}

	return parts.join(' ');
}
