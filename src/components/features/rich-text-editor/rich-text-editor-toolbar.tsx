/** The editor's toolbar and counts; neither knows about the document. */
import { Code2Icon } from "lucide-react"
import type { ReactNode } from "react"

import {
	Toolbar,
	ToolbarButton as BaseToolbarButton,
	ToolbarGroup,
	ToolbarSeparator,
} from "@/components/base/toolbar"
import { Text } from "@/components/base/typography"
import { Number as NumberValue } from "@/components/primitives"
import { cx } from "@/lib/cx"

import {
	defaultRichTextEditorToolbarLabel,
	type RichTextEditorStrings,
} from "./rich-text-editor.strings"
import type { RichTextEditorToolbarItem, ToolbarButtonConfig } from "./rich-text-editor.types"
import styles from "./rich-text-editor.module.css"

export interface RichTextEditorToolbarProps {
	buttons: ToolbarButtonConfig[]
	extraToolbarItems?: ReadonlyArray<RichTextEditorToolbarItem>
	hideSourceToggle?: boolean
	sourceMode: boolean
	toggleSourceMode: () => void
	disabled?: boolean
	toolbarTrailing?: ReactNode
	strings: RichTextEditorStrings
	className?: string
}

function EditorToolbarButton({
	config,
	disabled,
	separatorBefore = false,
}: {
	config: ToolbarButtonConfig
	disabled: boolean
	separatorBefore?: boolean
}) {
	const Icon = config.icon
	const active = config.isActive()

	const button = (
		<BaseToolbarButton
			type="button"
			tone={active ? "primary" : "neutral"}
			buttonStyle={active ? "solid" : "ghost"}
			iconOnly
			/* Prevented mousedown keeps the editor's selection (a focused button would collapse it); the click still fires. */
			onMouseDown={(event) => event.preventDefault()}
			onClick={config.run}
			disabled={disabled || config.disabled}
			aria-pressed={active}
			aria-label={config.label}
			title={config.label}
			className={styles.toolbarButton}
		>
			<Icon />
		</BaseToolbarButton>
	)

	// Keep a divider with its next control when the toolbar wraps.
	return separatorBefore ? (
		<ToolbarGroup>
			<ToolbarSeparator orientation="vertical" className={styles.toolbarRule} />
			{button}
		</ToolbarGroup>
	) : button
}

export function RichTextEditorToolbar({
	buttons,
	extraToolbarItems,
	hideSourceToggle = false,
	sourceMode,
	toggleSourceMode,
	disabled = false,
	toolbarTrailing,
	strings,
	className,
}: RichTextEditorToolbarProps) {
	// Formatting is meaningless while the document is being edited as text.
	const formattingDisabled = disabled || sourceMode

	return (
		<Toolbar
			aria-label={strings.toolbarLabel ?? defaultRichTextEditorToolbarLabel}
			className={cx("rich-text-editor-toolbar--component", styles.toolbar, className)}
		>
			{buttons.map((button) => (
				<EditorToolbarButton key={button.id} config={button} disabled={formattingDisabled} />
			))}

			{!hideSourceToggle && (
				<EditorToolbarButton
					separatorBefore
					config={{
						id: "source",
						icon: Code2Icon,
						label: strings.toolbar.sourceCode,
						isActive: () => sourceMode,
						run: toggleSourceMode,
					}}
					// Not `formattingDisabled`: leaving source mode is done from source mode.
					disabled={disabled}
				/>
			)}

			{extraToolbarItems?.map((item, index) => (
				<EditorToolbarButton
					key={item.id}
					separatorBefore={index === 0}
					config={{
						id: item.id,
						icon: item.icon,
						label: item.label,
						isActive: item.isActive ?? (() => false),
						run: item.onClick,
						disabled: item.disabled,
					}}
					disabled={formattingDisabled}
				/>
			))}

			{!!toolbarTrailing && <div className={styles.toolbarTrailing}>{toolbarTrailing}</div>}
		</Toolbar>
	)
}

export interface EditorCountsProps {
	/** The document as plain text. */
	text: string
	maxLength?: number
	strings: RichTextEditorStrings
	className?: string
}

/**
 * Character and word counts. Over the limit the count turns error-toned; input is never
 * refused, so the form decides.
 */
export function EditorCounts({ text, maxLength, strings, className }: EditorCountsProps) {
	const characters = text.length
	const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0
	const over = typeof maxLength === "number" && characters > maxLength

	return (
		<div className={cx("editor-counts--component", styles.counts, className)}>
			{/* The wrapper's colour reaches the figures; not `numeric`, which would set the words in mono (the NumberValues already are). */}
			<Text tag="span" size="xs" type={over ? "error" : "secondary"} weight={over ? "medium" : "regular"}>
				<NumberValue value={characters} size="xs" type="inherit" />
				{typeof maxLength === "number" && (
					<>
						{" / "}
						<NumberValue value={maxLength} size="xs" type="inherit" />
					</>
				)}{" "}
				{strings.counts.characters}
			</Text>
			<Text tag="span" size="xs" type="secondary">
				<NumberValue value={words} size="xs" type="inherit" /> {strings.counts.words}
			</Text>
		</div>
	)
}
