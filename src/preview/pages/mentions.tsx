import { Fragment, useCallback, useImperativeHandle, useRef, useState, type Ref } from "react"
import { CalendarIcon, TicketIcon, UserIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { Popover, PopoverTrigger } from "@/components/base/popover"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	MentionChip, MentionContent, MentionInlineSuggestions, MentionPicker,
	buildMentionHtml, parseMentionsFromHtml, useMentions,
	type Mention, type MentionEditorHandle, type MentionResource,
} from "@/components/features"

import styles from "../preview.module.css"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

type Kind = "user" | "booking" | "incident"

const RESOURCES: Partial<Record<Kind, MentionResource<Kind>>> = {
	user: {
		label: "Person",
		trigger: "@",
		icon: UserIcon,
		tone: "info",
		suggestions: [
			{ id: "1", label: "Maria Petrova", description: "Operations · Athens" },
			{ id: "2", label: "Marcus Webb", description: "Finance · London" },
			{ id: "3", label: "Alice Mercer", description: "Support · Dublin" },
		],
		buildHref: (suggestion) => `#/mentions?user=${suggestion.id}`,
	},
	booking: {
		label: "Booking",
		trigger: "#",
		icon: CalendarIcon,
		tone: "success",
		suggestions: [
			{ id: "4417", label: "Marlow Hall — 14 Aug", description: "Confirmed · 4 guests" },
			{ id: "4418", label: "Northwind Suite — 21 Aug", description: "Pending deposit" },
		],
	},
	incident: {
		label: "Incident",
		trigger: "!",
		icon: TicketIcon,
		tone: "destructive",
		suggestions: [
			{ id: "77", label: "Payment gateway timeout", description: "Open · P2" },
		],
	},
}

const STORED_BODY = `<p>Handing this to <span data-ref-id="user:1" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria Petrova</span> — it blocks <span data-ref-id="booking:4417" data-ref-kind="booking" data-ref-tone="success" contenteditable="false">#Marlow Hall — 14 Aug</span> and is tracked under <span data-ref-id="incident:77" data-ref-kind="incident" data-ref-tone="destructive" contenteditable="false">!Payment gateway timeout</span>.</p><p>The deposit is still <strong>unpaid</strong>, so we cannot release the room.</p>`

const STORED_MENTIONS: Mention<Kind>[] = [
	{ id: "user:1", kind: "user", label: "Maria Petrova", href: "#/mentions?user=1" },
	{ id: "booking:4417", kind: "booking", label: "Marlow Hall — 14 Aug" },
	{ id: "incident:77", kind: "incident", label: "Payment gateway timeout" },
]

/* One chip per tone, so the contrast suite measures every tone the stylesheet paints. */
const TONES: NonNullable<MentionResource["tone"]>[] = ["primary", "secondary", "info", "success", "warning", "destructive"]

/**
 * The four methods `MentionEditorHandle` asks for, over a plain contenteditable.
 *
 * Deliberately minimal — the point is that any editor implementing these plugs in, not
 * that the kit ships one. `replaceBeforeCaret` is the interesting one: it EXTENDS the
 * selection backwards and replaces in a single command, so the caret never visits an
 * in-between state and the browser's own undo stack gets one entry rather than two.
 */
function MiniEditor({
	handleRef,
	onCaretChange,
	onInput,
	placeholder,
}: {
	handleRef: Ref<MentionEditorHandle | null>
	onCaretChange: () => void
	onInput: (html: string) => void
	placeholder: string
}) {
	const host = useRef<HTMLDivElement>(null)

	useImperativeHandle(handleRef, () => ({
		getCaretContext() {
			const selection = window.getSelection()
			if (!selection?.focusNode || !host.current?.contains(selection.focusNode)) return null
			const range = document.createRange()
			range.setStart(host.current, 0)
			range.setEnd(selection.focusNode, selection.focusOffset)
			return { textBefore: range.toString() }
		},
		insertHTML(html) {
			host.current?.focus()
			document.execCommand("insertHTML", false, html)
			onInput(host.current?.innerHTML ?? "")
		},
		replaceBeforeCaret(length, html) {
			host.current?.focus()
			const selection = window.getSelection()
			if (selection && selection.rangeCount > 0) {
				// Extend back over the trigger and needle, then replace both at once.
				for (let step = 0; step < length; step += 1) {
					selection.modify("extend", "backward", "character")
				}
			}
			document.execCommand("insertHTML", false, html)
			onInput(host.current?.innerHTML ?? "")
		},
		focus() {
			host.current?.focus()
		},
	}))

	return (
		<div
			ref={host}
			contentEditable
			suppressContentEditableWarning
			role="textbox"
			aria-multiline
			aria-label={placeholder}
			data-placeholder={placeholder}
			onKeyUp={onCaretChange}
			onMouseUp={onCaretChange}
			onInput={(event) => {
				onInput(event.currentTarget.innerHTML)
				onCaretChange()
			}}
			className={styles.miniEditor}
		/>
	)
}

export function MentionsPage() {
	const editorRef = useRef<MentionEditorHandle | null>(null)
	const [html, setHtml] = useState("")
	const mentions = useMentions<Kind>({ resources: RESOURCES, editorRef })

	/*
	 * The body is the source of truth for which mentions survive. When the writer
	 * backspaces a chip out, the list has to shrink with it — otherwise the comment
	 * notifies someone whose name is no longer in it.
	 */
	const handleInput = useCallback(
		(next: string) => {
			setHtml(next)
			const present = new Set(parseMentionsFromHtml<Kind>(next).map((m) => m.id))
			// The updater form, not `mentions.mentions`: this fires in the same tick as the
			// insertion, so the render's list does not yet contain the mention just added.
			mentions.setMentions((prev) => prev.filter((m) => present.has(m.id)))
		},
		[mentions],
	)

	return (
		<ComponentPage
			title="Mentions"
			summary="Inline references to domain records, embedded in rich text. A trigger character per kind opens the picker; picking one writes an atomic chip into the body and registers the reference alongside it. Comments and activities are both built on this."
			importPath="@/components/features/mentions"
			exports={["useMentions", "MentionContent", "MentionChip", "MentionInlineSuggestions",
				"MentionPicker", "MentionKindTabs", "MentionRows", "useMentionsSearch",
			]}
		>
			<Example
				id="mention-inline"
				title="Typing a mention"
				overflowing
				description="Type @ for a person, # for a booking, ! for an incident. Arrow keys move through suggestions, Enter inserts, and Escape dismisses. The editor keeps focus while the panel follows the caret query. All three kinds are searched at once, so typing “mar” shows counts on every tab and jumps to the one that actually matched."
				stacked
				code={`const editorRef = useRef<MentionEditorHandle>(null)
const mentions = useMentions<"user" | "booking">({ resources, editorRef })

<div style={{ position: "relative" }}>
  <Editor ref={editorRef} onCaretChange={mentions.handleCaretChange} />
  <MentionInlineSuggestions
    {...mentions}
    open={mentions.triggerActive && mentions.pickerOpen}
    loading={mentions.isLoading}
    onManualKindChange={() => mentions.setManualKindOverride(true)}
    onSelect={mentions.pickSuggestion}
    onDismiss={() => mentions.setPickerOpen(false)}
  />
</div>`}
			>
				<div className={styles.mentionAnchor}>
					<MiniEditor
						handleRef={editorRef}
						onCaretChange={mentions.handleCaretChange}
						onInput={handleInput}
						placeholder="Write a note — try @, # or !"
					/>
					<MentionInlineSuggestions
						onDismiss={() => mentions.setPickerOpen(false)}
						open={mentions.triggerActive && mentions.pickerOpen}
						activeKind={mentions.activeKind}
						setActiveKind={mentions.setActiveKind}
						kinds={mentions.kinds}
						resources={RESOURCES}
						suggestionsByKind={mentions.suggestionsByKind}
						suggestions={mentions.suggestions}
						loading={mentions.isLoading}
						query={mentions.query}
						onManualKindChange={() => mentions.setManualKindOverride(true)}
						onSelect={mentions.pickSuggestion}
					/>
				</div>

				<Stack direction="horizontal" gap="md" align="center" wrap>
					<Popover open={mentions.pickerOpen && !mentions.triggerActive} onOpenChange={mentions.setPickerOpen}>
						<PopoverTrigger
							render={
								<Button tone="neutral" buttonStyle="outline">
									Insert reference
								</Button>
							}
						/>
						<MentionPicker
							open={mentions.pickerOpen && !mentions.triggerActive}
							activeKind={mentions.activeKind}
							setActiveKind={mentions.setActiveKind}
							kinds={mentions.kinds}
							resources={RESOURCES}
							suggestionsByKind={mentions.suggestionsByKind}
							query={mentions.query}
							setQuery={mentions.setQuery}
							suggestions={mentions.suggestions}
							loading={mentions.isLoading}
							onSelect={mentions.pickSuggestion}
						/>
					</Popover>
					<Text size="sm" type="secondary">
						{mentions.mentions.length} reference{mentions.mentions.length === 1 ? "" : "s"} in this draft
					</Text>
				</Stack>

				{/* `align="center"`: a flex item blockifies, so without it the chips stretch. */}
				{mentions.mentions.length > 0 && (
					<Stack direction="horizontal" gap="sm" align="center" wrap>
						{mentions.mentions.map((mention) => (
							<MentionChip
								key={mention.id}
								mention={mention}
								resource={RESOURCES[mention.kind]}
								asLink={false}
							/>
						))}
					</Stack>
				)}

				{!!html && (
					<Text size="xs" type="secondary" className={styles.mentionSource}>
						{html}
					</Text>
				)}
			</Example>

			<Example
				id="mention-content"
				title="Rendering a stored body"
				description="MentionContent preserves paragraphs, lists, and inline formatting while replacing references with live chips — with the current label, a working link, and a hover state. A reference the record does not know about renders as its stored markup rather than vanishing, because dropping it would take a name out of the middle of a sentence."
				stacked
				code={`<MentionContent
  html={comment.body}
  mentions={comment.mentions}
  resources={resources}
/>`}
			>
				<MentionContent html={STORED_BODY} mentions={STORED_MENTIONS} resources={RESOURCES} />
			</Example>

			<Example
				id="mention-tones"
				title="Chips"
				description="A chip inherits the size of the line it sits in — em, not rem — and aligns to the baseline rather than the line's middle, so it reads as a word rather than a badge dropped into a sentence. There is no neutral tone: a mention is a reference, and a neutral chip in body copy is a slightly grey word."
				stacked
				code={`<MentionChip mention={mention} resource={resources[mention.kind]} />`}
			>
				<Stack gap="lg">
					<Text>
						The same chip in body copy:{" "}
						<MentionChip mention={STORED_MENTIONS[0]!} resource={RESOURCES.user} />{" "}
						and{" "}
						<MentionChip mention={STORED_MENTIONS[1]!} resource={RESOURCES.booking} />.
					</Text>
					<Text size="xs">
						And in small print:{" "}
						<MentionChip mention={STORED_MENTIONS[0]!} resource={RESOURCES.user} />{" "}
						<MentionChip mention={STORED_MENTIONS[2]!} resource={RESOURCES.incident} />
					</Text>
					<Text>
						Every tone:{" "}
						{TONES.map((tone) => (
							<Fragment key={tone}>
								<MentionChip mention={{ id: `tone:${tone}`, kind: "tone", label: tone }} resource={{ tone }} />{" "}
							</Fragment>
						))}
					</Text>
				</Stack>
			</Example>

			<Example id="mention-html" title="What gets stored" stacked>
				<Callout label="Rule">
					A mention is stored <strong>twice</strong>: as a span in the body, and as a record
					in the mention list. The HTML is the <em>position</em>; the list is the{" "}
					<em>identity</em>. That is what lets a renamed person show their current name
					rather than the one frozen into the markup, and what lets{" "}
					<code>parseMentionsFromHtml</code> shrink the list when a chip is backspaced out.
				</Callout>
				<Text size="xs" type="secondary" className={styles.mentionSource}>
					{buildMentionHtml(STORED_MENTIONS[0]!, { triggerChar: "@", tone: "info" })}
				</Text>
				<Text size="sm" type="secondary">
					<code>contenteditable=&quot;false&quot;</code> is what makes the chip atomic —
					backspace deletes the whole name rather than a letter of it. All three attributes
					survive <code>sanitizeHtml</code>; a class would not, which is why the chip is
					styled by <code>data-ref-id</code> rather than a class name.
				</Text>
			</Example>

			<Example id="mentions-api" title="API">
				<PropTable owner="useMentions"
					rows={[
						{ name: "resources", type: "Partial<Record<Kind, MentionResource>>", description: "The registry. Each kind supplies a label, an icon, a tone, an optional trigger character, and either its own search or a static catalogue." },
						{ name: "resource.trigger", api: "MentionResource.trigger", type: "string", description: "The character that opens the picker inline. Optional — a kind with no trigger is still reachable from the button, which is right for one that is browsed rather than typed." },
						{ name: "onResourceSearch", api: "useMentions.onResourceSearch", type: "(needle, kind, ctx) => Suggestion[]", description: "The fallback, for a kind that registers neither search nor suggestions. One endpoint taking a kind is the common shape." },
						{ name: "handleCaretChange", api: "useMentions().handleCaretChange", type: "() => void", description: "Wire to the editor's caret callback. The trigger must follow start-of-line or whitespace, so an email address does not open the picker at its @." },
						{ name: "pickSuggestion", api: "useMentions().pickSuggestion", type: "(suggestion) => Mention", description: "Registers the mention and writes the chip in ONE editor operation — deleting the needle and inserting separately leaves a frame where the caret is elsewhere." },
						{ name: "manualKindOverride", api: "useMentions().manualKindOverride", type: "boolean", description: "Set by the panel when the writer picks a tab. Suspends the auto-jump, because a list that keeps moving under someone who just said where to look is worse than one showing nothing." },
						{ name: "errorsByKind", api: "useMentions().errorsByKind", type: "Partial<Record<Kind, unknown>>", description: "One kind failing is not the search failing. Three registries answering and a fourth timing out is still a usable panel." },
						{ name: "MentionContent renderMention", type: "(mention) => ReactNode", description: "Takes over every chip. More specific than resources.<kind>.renderChip, which is more specific than resources.<kind>.tone." },
						{ name: "MentionContent sanitizer", type: "(html) => string", description: "Replaces the kit's allow-list. There is no way to turn sanitising off — the escape hatch is a different sanitiser, not the absence of one." },
						{ name: "buildMentionHtml / parseMentionsFromHtml", type: "(mention) => string / (html) => Mention[]", description: "The two directions. Parse returns id, kind, and label only; merge against what you already know to keep href and data, which HTML cannot express." },
						{ name: "MentionInlineSuggestions.onDismiss", api: "MentionInlineSuggestions.onDismiss", type: "() => void", description: "Closes the completion session on Escape or editor blur. Wire to setPickerOpen(false). Unchanged caret callbacks do not reopen a dismissed query." },
						{ name: "MentionPicker", type: "component", description: "The popover for the button flow \u2014 the same tabs and rows as the inline panel, plus a search field of its own, because a reader who pressed a button has typed nothing to search with." },
						{ name: "MentionKindTabs / MentionRows", type: "component", description: "The parts both mention surfaces are built from, so the inline panel and the popover cannot drift into showing the same data two ways." },
						{ name: "useMentionsSearch", type: "hook", description: "The picker\u2019s suggestion state. Every kind is searched rather than only the active tab, so the tab counts are true the moment the panel opens." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
