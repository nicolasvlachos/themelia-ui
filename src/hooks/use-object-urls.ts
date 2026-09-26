import { useEffect, useRef, useState } from "react"

/**
 * One object URL per file, revoked when the file leaves the list or the component
 * unmounts. Compared by File identity, so an inline array rebuilt each render does not
 * re-mint URLs (and flicker images).
 *
 * Old URLs are revoked when replaced, not in the effect's cleanup: StrictMode's
 * effect-cleanup-effect cycle would revoke the URLs just handed to state.
 */
export function useObjectUrls(files: readonly File[]): string[] {
	const [urls, setUrls] = useState<string[]>([])
	const previous = useRef<readonly File[]>([])
	const live = useRef<string[]>([])

	useEffect(() => {
		/* Compared in the effect, not during render, because it reads a ref. */
		const sameFiles =
			files.length === previous.current.length &&
			files.every((file, index) => file === previous.current[index])
		if (sameFiles) return

		previous.current = files
		const stale = live.current
		live.current = files.map((file) => URL.createObjectURL(file))
		setUrls(live.current)
		for (const url of stale) URL.revokeObjectURL(url)
	}, [files])

	/* Unmount-only cleanup; a StrictMode remount re-creates the set straight after. */
	useEffect(
		() => () => {
			for (const url of live.current) URL.revokeObjectURL(url)
			live.current = []
			previous.current = []
		},
		[],
	)

	return urls
}
