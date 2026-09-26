import { useState, type Dispatch, type SetStateAction } from "react"

/**
 * Local state seeded from a prop and re-seeded when it changes, adjusted during render so
 * the stale value is never committed. Compared by identity: a prop rebuilt every render
 * re-seeds every render.
 */
export function useSyncedState<T>(value: T): [T, Dispatch<SetStateAction<T>>] {
	const [staged, setStaged] = useState<T>(value)
	const [seed, setSeed] = useState<T>(value)

	if (value !== seed) {
		setSeed(value)
		setStaged(value)
	}

	return [staged, setStaged]
}
