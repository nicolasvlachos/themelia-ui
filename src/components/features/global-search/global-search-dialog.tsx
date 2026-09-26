/**
 * GlobalSearchDialog: the palette presentation of `GlobalSearch`, through `ActionDialog`
 * (focus trap, portal, scroll lock, dialog role). `hideHeader` keeps the accessible name,
 * `showCloseButton={false}` keeps the ✕ off the search field, and the action flags drop the
 * footer, since the palette has its own.
 */
import { useCallback } from "react"

import { ActionDialog } from "@/components/features/overlays"
import { cx } from "@/lib/cx"

import { GlobalSearch } from "./global-search"
import { defaultGlobalSearchStrings } from "./global-search.strings"
import type { GlobalSearchProps } from "./global-search.types"
import styles from "./global-search.module.css"

export interface GlobalSearchDialogProps<TGroup extends string = string>
	extends Omit<GlobalSearchProps<TGroup>, "onClose"> {
	open: boolean
	/** Fires on Escape, on a backdrop click, and after a result is chosen. */
	onOpenChange: (open: boolean) => void
	/** Merged onto the dialog surface that positions the palette. */
	contentClassName?: string
}

export function GlobalSearchDialog<TGroup extends string = string>({
	open,
	onOpenChange,
	contentClassName,
	className,
	strings,
	// Opens with focus in the field.
	autoFocus = true,
	...search
}: GlobalSearchDialogProps<TGroup>) {
	const copy = { ...defaultGlobalSearchStrings, ...strings }
	const close = useCallback(() => onOpenChange(false), [onOpenChange])

	return (
		<ActionDialog
			open={open}
			onOpenChange={onOpenChange}
			title={copy.dialogTitle}
			hideHeader
			showCloseButton={false}
			showCancel={false}
			showConfirm={false}
			width="lg"
			className={cx("global-search-dialog--component", styles.dialogSurface, contentClassName)}
			contentClassName={styles.dialogContent}
		>
			<GlobalSearch<TGroup>
				{...(search as GlobalSearchProps<TGroup>)}
				strings={strings}
				autoFocus={autoFocus}
				onResultSelect={(result) => {
					search.onResultSelect?.(result)
					close()
				}}
				onClose={close}
				className={className}
			/>
		</ActionDialog>
	)
}
