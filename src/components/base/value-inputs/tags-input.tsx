/** TagsInput — short values entered inline; chips and entry field share one field shell. */
import { XIcon } from "lucide-react"
import {
	useCallback, useMemo, useRef, useState,
	type ClipboardEvent, type KeyboardEvent, type ReactNode,
} from "react"

import { VisuallyHidden } from "@/components/base/display"
import { cx } from "@/lib/cx"

import { defaultTagsInputStrings, type TagsInputStrings } from "./value-inputs.strings"
import styles from "./value-inputs.module.css"

export interface TagsInputProps {
	/** Controlled value. */
	value?: string[]
	defaultValue?: string[]
	onValueChange?: (value: string[]) => void

	placeholder?: string
	disabled?: boolean
	invalid?: boolean
	name?: string

	/** Cap on the number of tags. Entry is refused once it is reached. */
	maxTags?: number
	/** Shows a "3 / 5" summary under the field. Requires `maxTags`. */
	showCount?: boolean
	/** Shows a clear-all control under the field. */
	showClearAll?: boolean
	/** Overrides this field's own copy — clear-all, and each tag's remove. */
	strings?: Partial<TagsInputStrings>

	allowDuplicates?: boolean
	/** Duplicate detection is case-insensitive unless this is set. */
	caseSensitive?: boolean
	/** Keeps the list sorted as tags are added. */
	sortTags?: boolean

	minLength?: number
	maxLength?: number
	/** Rejects a tag when this returns false. Runs after the length checks. */
	validate?: (value: string) => boolean

	/** Splits pasted and typed input into several tags. Defaults to a comma or a newline. */
	delimiter?: string | RegExp
	/** Commits whatever is typed when the field loses focus. */
	addOnBlur?: boolean

	/** Replaces the chip. */
	renderTag?: (tag: string, index: number, remove: (index: number) => void) => ReactNode

	className?: string
	/** Goes on the text input, not the wrapper, so a `FormField` label names it. */
	id?: string
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
	"aria-invalid"?: boolean | "true" | "false"
	"aria-required"?: boolean | "true" | "false"
}

// A stable empty array, so memoised callbacks do not rebuild every render.
const NONE: string[] = []

export function TagsInput({
	value,
	defaultValue,
	onValueChange,
	placeholder,
	disabled = false,
	invalid = false,
	name,
	maxTags,
	showCount = false,
	showClearAll = false,
	strings,
	allowDuplicates = false,
	caseSensitive = false,
	sortTags = false,
	minLength = 1,
	maxLength,
	validate,
	delimiter = /[\n,]/,
	addOnBlur = true,
	renderTag,
	className,
	id,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
	"aria-invalid": ariaInvalid,
	"aria-required": ariaRequired,
}: TagsInputProps) {
	const copy = { ...defaultTagsInputStrings, ...strings }
	const isControlled = value !== undefined
	const [internal, setInternal] = useState<string[]>(defaultValue ?? [])
	const tags = isControlled ? (value ?? NONE) : internal
	const [draft, setDraft] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)
	const rootRef = useRef<HTMLDivElement>(null)
	/*
	 * What a commit could not add (duplicate, invalid, full). It stays in the draft, marks the
	 * field invalid until edited, and is announced.
	 */
	const [rejectedDraft, setRejectedDraft] = useState<string | null>(null)
	const [announcement, setAnnouncement] = useState("")

	const commit = useCallback(
		(next: string[]) => {
			if (!isControlled) setInternal(next)
			onValueChange?.(next)
		},
		[isControlled, onValueChange],
	)

	const isDuplicate = useCallback(
		(candidate: string, list: string[]) => {
			if (caseSensitive) return list.includes(candidate)
			const lowered = candidate.toLowerCase()
			return list.some((tag) => tag.toLowerCase() === lowered)
		},
		[caseSensitive],
	)

	/** Preserve rejected entries so a paste never silently loses user input. */
	const addMany = useCallback(
		(candidates: string[]) => {
			let next = [...tags]
			const rejected: string[] = []
			for (const raw of candidates) {
				const candidate = raw.trim()
				if (!candidate) continue
				if (candidate.length < minLength ||
					(maxLength !== undefined && candidate.length > maxLength) ||
					(maxTags !== undefined && next.length >= maxTags) ||
					(!allowDuplicates && isDuplicate(candidate, next)) ||
					(validate && !validate(candidate))) {
					rejected.push(candidate)
					continue
				}
				next.push(candidate)
			}
			if (next.length !== tags.length) {
				if (sortTags) next = next.sort((a, b) => a.localeCompare(b))
				commit(next)
			}
			return rejected.join(typeof delimiter === "string" ? delimiter : ", ")
		},
		[allowDuplicates, commit, delimiter, isDuplicate, maxLength, maxTags, minLength, sortTags, tags, validate],
	)

	const remove = useCallback(
		(index: number) => commit(tags.filter((_, position) => position !== index)),
		[commit, tags],
	)

	const submit = (parts: string[]) => {
		const rest = addMany(parts)
		setDraft(rest)
		setRejectedDraft(rest || null)
		setAnnouncement(rest ? (copy.notAdded ?? defaultTagsInputStrings.notAdded!)(rest) : "")
	}

	// After a remove, focus goes to the tag now in its place, else the one before, else the field.
	const removeAndRefocus = (index: number) => {
		remove(index)
		requestAnimationFrame(() => {
			const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-tag-remove]")
			const next = buttons?.[Math.min(index, buttons.length - 1)]
			;(next ?? inputRef.current)?.focus()
		})
	}

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.nativeEvent.isComposing || event.keyCode === 229) return
		if (event.key === "Enter") {
			// The field is usually inside a form; Enter here means "commit this tag".
			event.preventDefault()
			submit(draft.split(delimiter))
			return
		}
		// Backspace on an empty field removes the last tag.
		if (event.key === "Backspace" && draft === "" && tags.length > 0) {
			event.preventDefault()
			remove(tags.length - 1)
		}
	}

	const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
		const text = event.clipboardData.getData("text")
		if (!text) return
		const start = event.currentTarget.selectionStart ?? draft.length
		const end = event.currentTarget.selectionEnd ?? start
		const parts = `${draft.slice(0, start)}${text}${draft.slice(end)}`.split(delimiter)
		if (parts.length <= 1) return
		event.preventDefault()
		submit(parts)
	}

	const overLimit = maxTags !== undefined && tags.length > maxTags
	const hasFooter = (showCount && maxTags !== undefined) || (showClearAll && tags.length > 0)

	const summary = useMemo(
		() => (maxTags === undefined ? null : `${tags.length} / ${maxTags}`),
		[maxTags, tags.length],
	)

	return (
		<div ref={rootRef} className={cx("tags-input--component", className)}>
			<VisuallyHidden role="status" aria-live="polite">
				{announcement}
			</VisuallyHidden>
			{/* One hidden input per tag (`name[]`), so the form serialises a list. */}
			{!!name && tags.map((tag, index) => <input key={`${tag}-${index}`} type="hidden" name={`${name}[]`} value={tag} disabled={disabled} />)}

			<div
				data-field-shell=""
			/* `invalid` or FormField's injected `aria-invalid` draws the invalid border. */
				aria-invalid={invalid || ariaInvalid || undefined}
				className={styles.tagsShell}
				// The chips occupy most of the field; clicking one of the gaps should still type.
				onClick={() => inputRef.current?.focus()}
			>
				{tags.map((tag, index) =>
					renderTag ? (
						renderTag(tag, index, remove)
					) : (
						<span key={`${tag}-${index}`} className={styles.tag}>
							{tag}
							<button
								type="button"
								data-hit-area
								className={styles.tagRemove}
								aria-label={copy.removeTag(tag)}
								data-tag-remove=""
								disabled={disabled}
								onClick={(event) => {
									event.stopPropagation()
									removeAndRefocus(index)
								}}
							>
								<XIcon aria-hidden />
							</button>
						</span>
					),
				)}
				<input
					ref={inputRef}
					id={id}
					data-field-control=""
					className={styles.tagsInput}
					value={draft}
					placeholder={tags.length === 0 ? (placeholder ?? copy.placeholder) : undefined}
					disabled={disabled}
					aria-label={ariaLabel}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
					/* On the control too: it is the element the label names and a screen reader reaches. */
					aria-invalid={invalid || ariaInvalid || rejectedDraft !== null || undefined}
					aria-required={ariaRequired}
					onChange={(event) => {
						/* A typed delimiter commits, as a pasted one already did. */
						const parts = event.target.value.split(delimiter)
						if (parts.length > 1) {
							submit(parts)
							return
						}
						setRejectedDraft(null)
						setDraft(event.target.value)
					}}
					onKeyDown={onKeyDown}
					onPaste={onPaste}
					onBlur={() => {
						if (!addOnBlur || disabled || draft === rejectedDraft) return
						submit(draft.split(delimiter))
					}}
				/>
			</div>

			{hasFooter && (
				<div className={styles.tagsFooter}>
					<span className={cx(overLimit && styles.tagsOverLimit)}>{showCount ? summary : null}</span>
					{showClearAll && tags.length > 0 && (
						<button
							type="button"
							data-hit-area
							className={styles.tagsClear}
							onClick={() => {
								commit([])
								inputRef.current?.focus()
							}}
							disabled={disabled}
						>
							{copy.clearAll}
						</button>
					)}
				</div>
			)}
		</div>
	)
}
