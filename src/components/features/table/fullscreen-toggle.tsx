/** The full-screen toggle, on its own, for a consumer building their own toolbar. */
import { Maximize2Icon, Minimize2Icon } from "lucide-react"
import type { ReactElement } from "react"
import { resolveStrings } from "@/lib/strings"

import { defaultDataTableStrings, type DataTableStrings } from "./table.strings"

import { Button } from "@/components/base/buttons"
import { cx } from "@/lib/cx"

export interface FullscreenToggleProps {
	fullscreen: boolean
	onFullscreenChange: (fullscreen: boolean) => void
	enterLabel?: string
	exitLabel?: string
	/** Overrides the default names for every toggle. */
	strings?: Partial<DataTableStrings>
	className?: string
	/** Replaces the underlying Button while retaining the toggle's behavior and content. */
	render?: ReactElement
}

export function FullscreenToggle({
	fullscreen,
	onFullscreenChange,
	enterLabel,
	exitLabel,
	strings,
	className,
	render,
}: FullscreenToggleProps) {
	const copy = resolveStrings(defaultDataTableStrings, strings)
	const label = fullscreen ? (exitLabel ?? copy.fullscreenExit) : (enterLabel ?? copy.fullscreenEnter)

	return (
		<Button
			render={render}
			type="button"
			tone="neutral"
			buttonStyle="ghost"
			iconOnly
			aria-label={label}
			// A toggle reports its own state; the icon carries none for a screen reader.
			aria-pressed={fullscreen}
			onClick={() => onFullscreenChange(!fullscreen)}
			className={cx("fullscreen-toggle--component", className)}
		>
			{fullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
		</Button>
	)
}
