/** An image that falls back to a glyph, not the browser's broken-image mark, when it fails. */
import { useState, type ReactNode } from "react"
import { cx } from "@/lib/cx"

export interface PreviewImageProps {
	src: string
	/** Empty by default: a thumbnail beside its own filename is decorative. */
	alt?: string
	fallback: ReactNode
	className?: string
}

/**
 * A thumbnail for a file that has not been uploaded yet, or any image, that falls back to a
 * glyph rather than the browser's broken-image mark when it fails to load.
 */
export function PreviewImage({ src, alt = "", fallback, className }: PreviewImageProps) {
	const [failed, setFailed] = useState(false)
	const [attempted, setAttempted] = useState(src)

	// A new source gets a fresh attempt; reset during render, so the fallback never flashes.
	if (src !== attempted) {
		setAttempted(src)
		setFailed(false)
	}

	if (failed) return <>{fallback}</>

	return <img src={src} alt={alt} className={cx("preview-image--component", className)} onError={() => setFailed(true)} />
}
