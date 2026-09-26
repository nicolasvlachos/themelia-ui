/* The matched run of a label, marked. Kept out of `use-combobox-core` so that stays component-free. */
import { Text } from "@/components/base/typography"

/* ── Highlighted label ───────────────────────────────────────────────────────────── */

function escapeRegExp(value: string) {
	return value.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")
}

export function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
	if (!highlight.trim()) {
		return <Text tag="span" size="inherit" type="inherit" lineHeight="tight" className="highlighted-text--component">{text}</Text>
	}

	// A capturing group, so `split` returns the matches as well as what sits between them.
	const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, "gi"))
	/* Each part's offset is the length of everything before it. */
	const offsets = parts.reduce<number[]>(
		(all, part, index) => [...all, (all[index] ?? 0) + part.length],
		[0],
	)

	return (
		<Text tag="span" size="inherit" type="inherit" lineHeight="tight" className="highlighted-text--component">
			{parts.map((part, index) => {
				/* Odd indices are matches. A leading match leaves an empty part at the same offset, so the key includes the kind. */
				const match = index % 2 === 1
				if (!match && part === "") return null
				const key = `${offsets[index]}:${match ? "match" : "text"}`
				return match ? (
					<mark key={key}>{part}</mark>
				) : (
					<span key={key}>{part}</span>
				)
			})}
		</Text>
	)
}
