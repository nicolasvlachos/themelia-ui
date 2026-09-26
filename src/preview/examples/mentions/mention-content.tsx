import { MentionContent } from "themelia-ui/features/mentions"

import { RESOURCES, STORED_MENTIONS } from "./data"

const STORED_BODY = `<p>Handing this to <span data-ref-id="user:1" data-ref-kind="user" data-ref-tone="info" contenteditable="false">@Maria Petrova</span> — it blocks <span data-ref-id="booking:4417" data-ref-kind="booking" data-ref-tone="success" contenteditable="false">#Marlow Hall — 14 Aug</span> and is tracked under <span data-ref-id="incident:77" data-ref-kind="incident" data-ref-tone="destructive" contenteditable="false">!Payment gateway timeout</span>.</p><p>The deposit is still <strong>unpaid</strong>, so we cannot release the room.</p>`

export default function MentionContentExample() {
	return (
		<MentionContent html={STORED_BODY} mentions={STORED_MENTIONS} resources={RESOURCES} />
	)
}
