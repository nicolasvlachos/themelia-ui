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
				<PropTable
					owners={["useMentions", "UseMentionsReturn", "MentionResource", "MentionContent", "MentionInlineSuggestions"]}
				/>
				<PropTable
					symbols={[
						"buildMentionHtml",
						"parseMentionsFromHtml",
						"MentionPicker",
						"MentionKindTabs",
						"MentionRows",
						"useMentionsSearch",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
