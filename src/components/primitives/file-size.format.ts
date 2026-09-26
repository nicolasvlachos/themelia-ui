import { EMPTY } from "@/lib/format"

export type FileSizeUnit = "bytes" | "kilobytes" | "megabytes" | "gigabytes"

/*
 * Three conventions:
 *   binary (default)  ÷1024, labelled KB/MB/GB, as Windows and most file managers show.
 *   decimal           ÷1000, labelled KB/MB/GB: SI, as macOS and storage vendors use.
 *   iec               ÷1024, labelled KiB/MiB/GiB.
 */
const SI_LABELS = ["B", "KB", "MB", "GB", "TB", "PB"] as const
const IEC_LABELS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] as const

export type FileSizeBase = "binary" | "decimal" | "iec"

const BASES: Record<FileSizeBase, { step: number; labels: readonly string[] }> = {
	binary: { step: 1024, labels: SI_LABELS },
	decimal: { step: 1000, labels: SI_LABELS },
	iec: { step: 1024, labels: IEC_LABELS },
}

const UNIT_OFFSET: Record<FileSizeUnit, number> = {
	bytes: 0,
	kilobytes: 1,
	megabytes: 2,
	gigabytes: 3,
}

export interface FileSizeFormatOptions {
	/** The unit the incoming value is already in. */
	from?: FileSizeUnit
	/** Which base and labels to use (see the note above). Default `binary`. */
	base?: FileSizeBase
	locale?: string
}

export function formatFileSize(
	value: number,
	{ from = "bytes", base = "binary", locale }: FileSizeFormatOptions = {},
) {
	if (!Number.isFinite(value)) return EMPTY
	/* The same step converts the incoming unit: `from="megabytes"` is 10^6 in decimal. */
	const { step, labels } = BASES[base]
	const bytes = value * step ** UNIT_OFFSET[from]
	if (!Number.isFinite(bytes)) return EMPTY
	const exponent =
		bytes === 0 ? 0 : Math.max(0, Math.min(Math.floor(Math.log(Math.abs(bytes)) / Math.log(step)), labels.length - 1))
	const scaled = bytes / step ** exponent
	// Whole bytes never need a decimal; larger units read better with one.
	const formatted = new Intl.NumberFormat(locale, {
		maximumFractionDigits: exponent === 0 ? 0 : 1,
	}).format(scaled)
	return `${formatted} ${labels[exponent]}`
}
