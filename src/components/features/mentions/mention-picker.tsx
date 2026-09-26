/**
 * MentionPicker: the popover content for the button flow. The inline panel's tabs and rows
 * plus its own search field, since there is no trigger text to read. `shouldFilter={false}`:
 * the hook already searched every kind. The consumer supplies the `Popover` and trigger.
 */
import { Command, CommandInput, CommandList } from "@/components/base/command"
import { PopoverContent } from "@/components/base/popover"
import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { defaultMentionPickerStrings, type MentionPickerStrings } from "./mentions.strings"
import { MentionKindTabs, MentionRows } from "./mention-suggestion-list"
import type { MentionResource, MentionSuggestion } from "./mentions.types"
import styles from "./mentions.module.css"

export interface MentionPickerProps<TResource extends string = string> {
	open: boolean
	activeKind: TResource | null
	setActiveKind: (kind: TResource | null) => void
	kinds: ReadonlyArray<TResource>
	resources?: Partial<Record<TResource, MentionResource<TResource>>>
	suggestionsByKind?: Readonly<Record<string, ReadonlyArray<MentionSuggestion<TResource>>>>
	query: string
	setQuery: (query: string) => void
	suggestions: ReadonlyArray<MentionSuggestion<TResource>>
	loading: boolean
	onSelect: (suggestion: MentionSuggestion<TResource>) => void
	strings?: Partial<MentionPickerStrings>
	className?: string
}

export function MentionPicker<TResource extends string = string>({
	open,
	activeKind,
	setActiveKind,
	kinds,
	resources,
	suggestionsByKind,
	query,
	setQuery,
	suggestions,
	loading,
	onSelect,
	strings,
	className,
}: MentionPickerProps<TResource>) {
	const copy = { ...defaultMentionPickerStrings, ...strings }
	if (!open) return null

	return (
		<PopoverContent
			align="start"
			inset="flush"
			width={undefined}
			aria-label={copy.title}
			className={cx("mention-picker--component", styles.panel, className)}
		>
			<div className={styles.panelHeader}>
				<div className="sr-only">
					<Text size="xs" weight="medium" type="secondary">{copy.title}</Text>
				</div>
				<MentionKindTabs
					kinds={kinds}
					activeKind={activeKind}
					resources={resources}
					suggestionsByKind={suggestionsByKind}
					onSelect={setActiveKind}
				/>
			</div>

			{/* Filtering is off: the hook already searched. */}
			<Command shouldFilter={false} className={styles.command}>
				<CommandInput
					autoFocus
					aria-label={copy.searchPlaceholder}
					placeholder={copy.searchPlaceholder}
					value={query}
					onValueChange={setQuery}
				/>
				<CommandList aria-label={copy.listLabel} className={styles.commandList}>
					<MentionRows
						command
						resources={resources}
						suggestions={suggestions}
						activeKind={activeKind}
						loading={loading}
						loadingLabel={copy.loading}
						emptyLabel={copy.empty}
						listLabel={copy.listLabel}
						onSelect={onSelect}
					/>
				</CommandList>
			</Command>
		</PopoverContent>
	)
}
