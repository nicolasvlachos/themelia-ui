/**
 * Resizable — split panes on react-resizable-panels; the handle is a keyboard-operable
 * `role="separator"`. Persist sizes with `onLayoutChanged` and restore via `defaultLayout`.
 */
import * as ResizablePrimitive from "react-resizable-panels"

import { cx } from "@/lib/cx"

import styles from "./resizable.module.css"

export interface ResizablePanelGroupProps
	extends ResizablePrimitive.GroupProps,
		Pick<ResizablePrimitive.GroupProps, "orientation"> {}

/**
 * The split. `orientation` is its axis. Own the persistence: keep the layout in your state
 * with `onLayoutChanged` and hand it back through `defaultLayout`, so a reader who widened a
 * panel finds it wide next time.
 */
export function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps) {
	return (
		<ResizablePrimitive.Group
			data-slot="resizable-panel-group"
			className={cx("resizable-group--component", styles.group, className)}
			{...props}
		/>
	)
}

export interface ResizablePanelProps extends ResizablePrimitive.PanelProps {}

/** A panel inside a `ResizablePanelGroup`. */
export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
	return (
		<ResizablePrimitive.Panel
			data-slot="resizable-panel"
			className={cx("resizable-panel--component", styles.panel, className)}
			{...props}
		/>
	)
}

export interface ResizableHandleProps extends ResizablePrimitive.SeparatorProps {
	/**
	 * Draws a grip on the line, for a split with no other cue that it moves. The hit area is
	 * wider than the 1px rule either way.
	 */
	withHandle?: boolean
}

/**
 * The grip between two panels: a real `role="separator"`. It is focusable and takes arrow
 * keys, so the split is adjustable without a pointer.
 */
export function ResizableHandle({ withHandle = false, className, ...props }: ResizableHandleProps) {
	return (
		<ResizablePrimitive.Separator
			data-slot="resizable-handle"
			className={cx("resizable-handle--component", styles.handle, className)}
			{...props}
		>
			{withHandle && <span aria-hidden className={styles.grip} />}
		</ResizablePrimitive.Separator>
	)
}
