import { TYPE_ICON } from "./media-icons"
import { useState, type CSSProperties } from "react"
import { cx } from "@/lib/cx"
import { useSyncedState } from "@/hooks/use-synced-state"
import type { ResolvedMediaLibraryAccessors } from "./media-library.types"
import styles from "./media-library.module.css"


/**
 * The asset's picture, or a stand-in: a broken `src` falls back to the type glyph, and
 * `tint` gives an asset without a preview a recognisable colour.
 */
export function MediaPreview<TItem>({
	item,
	accessors,
	className,
}: {
	item: TItem
	accessors: ResolvedMediaLibraryAccessors<TItem>
	className?: string
}) {
	const src = accessors.getSrc(item)
	const type = accessors.getType(item)
	const tint = accessors.getTint(item)
	const [broken, setBroken] = useState(false)
	const [attempted, setAttempted] = useSyncedState(src)
	if (src !== attempted) {
		setAttempted(src)
		setBroken(false)
	}


	if (src && type === "image" && !broken) {
		return (
			<img
				src={src}
				alt={accessors.getAlt(item) ?? ""}
				loading="lazy"
				className={cx("media-preview--component", styles.preview, className)}
				onError={() => setBroken(true)}
			/>
		)
	}

	return (
		<span
			data-tinted={tint ? "" : undefined}
			className={cx("media-preview--component", styles.preview, styles.previewFallback, className)}
			style={tint ? ({ "--media-tint": tint } as CSSProperties) : undefined}
		>
			{TYPE_ICON[type]}
		</span>
	)
}
