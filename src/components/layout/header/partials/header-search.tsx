/**
 * HeaderSearch: a button that looks like a field and opens a command palette, where the
 * typing happens.
 */
import { useSyncExternalStore } from "react"
import { SearchIcon } from "lucide-react"

import { Kbd } from "@/components/base/display"
import { Text } from "@/components/base/typography"
import { useCommandShortcut } from "@/hooks"
import { cx } from "@/lib/cx"

import { defaultHeaderSearchStrings } from "../header.strings"
import type { HeaderGlobalSearchTriggerProps, HeaderSearchProps } from "../header.types"

/** The platform cannot change while the page is open, so the store never notifies. */
const neverChanges = () => () => {}
import styles from "../header.module.css"

/** `userAgentData.platform` where it exists, the deprecated `platform` otherwise. Client only. */
function detectMac(): boolean {
	if (typeof navigator === "undefined") return false
	const data = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
	if (data?.platform) return data.platform === "macOS"
	return /Mac|iPhone|iPad/.test(navigator.platform)
}

/**
 * The trigger for a command palette, not a search field. It LOOKS like an input and IS a
 * button, which is the honest shape: typing happens in the palette, so a real field here
 * would take a keystroke and then throw it away.
 */
export function HeaderSearch({
	onOpen,
	shortcutModifier,
	enableShortcut = true,
	strings,
	className,
	shortcutSlot,
}: HeaderSearchProps) {
	const copy = { ...defaultHeaderSearchStrings, ...strings }
	/* Read as a store with a server snapshot of `false`: the platform is client-only. */
	const isMac = useSyncExternalStore(neverChanges, detectMac, () => false)

	const modifier = shortcutModifier ?? (isMac ? "meta" : "control")
	const hint = modifier === "meta" ? copy.shortcutMac : copy.shortcutPc

	useCommandShortcut({ key: "k", enabled: enableShortcut, onTrigger: onOpen })

	return (
		<button
			type="button"
			data-slot="header-search"
			onClick={onOpen}
			className={cx("header-search--component", styles.search, className)}
		>
			<SearchIcon aria-hidden className={styles.searchIcon} />
			<Text tag="span" size="inherit" type="secondary" className={styles.searchLabel}>
				{copy.placeholder}
			</Text>
			{/* A visual reminder only; kept out of the accessible name. */}
			<span aria-hidden className={styles.searchHint}>
				{shortcutSlot ?? <Kbd>{hint}</Kbd>}
			</span>
		</button>
	)
}

/**
 * The same trigger — a button shaped like a field, for a palette where the typing happens —
 * reporting into a controlled `open`. A separate component so a trigger never half-owns the
 * palette's state.
 */
export function HeaderGlobalSearchTrigger({
	onOpen,
	onOpenChange,
	...props
}: HeaderGlobalSearchTriggerProps) {
	return (
		<HeaderSearch
			{...props}
			onOpen={() => {
				onOpen?.()
				onOpenChange?.(true)
			}}
		/>
	)
}
