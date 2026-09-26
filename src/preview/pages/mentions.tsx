import { Text } from "@/components/base/typography"
import { buildMentionHtml } from "@/components/features"

import styles from "../preview.module.css"
import { STORED_MENTIONS } from "../examples/mentions/data"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function MentionsPage() {
	return (
		<ComponentPage>
			<Example
				example="mentions/mention-inline"
				title="Typing a mention"
				overflowing
				description="Type @ for a person, # for a booking, ! for an incident. Arrow keys move through suggestions, Enter inserts, and Escape dismisses. The editor keeps focus while the panel follows the caret query. All three kinds are searched at once, so typing “mar” shows counts on every tab and jumps to the one that actually matched."
			/>

			<Example
				example="mentions/mention-content"
				title="Rendering a stored body"
				description="MentionContent preserves paragraphs, lists, and inline formatting while replacing references with live chips — with the current label, a working link, and a hover state. A reference the record does not know about renders as its stored markup rather than vanishing, because dropping it would take a name out of the middle of a sentence."
			/>

			<Example
				example="mentions/mention-tones"
				title="Chips"
				description="A chip inherits the size of the line it sits in — em, not rem — and aligns to the baseline rather than the line's middle, so it reads as a word rather than a badge dropped into a sentence. There is no neutral tone: a mention is a reference, and a neutral chip in body copy is a slightly grey word."
			/>

			<Example id="mention-html" title="What gets stored">
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
