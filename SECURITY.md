# Security

## Supported versions

| version | supported |
|---|---|
| 2.x | ✅ |
| 1.x | ❌ — superseded by 2.0 |
| 0.x | ❌ — pre-release, superseded by 1.0 |

## Reporting

Report a suspected vulnerability privately, through GitHub's **Report a vulnerability**
button on the repository's Security tab. Please do not open a public issue first.

Include what you did, what happened, and which version you were on. A reply should come
within a week; a fix or a documented mitigation within thirty days for anything that reaches
a consumer's users.

## What this package does and does not do with untrusted input

This is a presentation library. It renders what it is given, and it holds no data of its own
— no network calls, no storage, no authentication. That makes the trust boundary the
consumer's, and there is one place where that matters more than the rest.

### HTML trust boundaries

`RichTextEditor` produces **HTML** and does not sanitize the draft. The package's `RichText`
renderer does sanitize stored HTML through an allow-list before it reaches the DOM:

- **On the way in**, an editor's output is whatever its editing engine produced from what
  the user typed or pasted. A paste can carry markup and attributes the user never saw.
- **On the way out**, rendering stored HTML through application-owned
  `dangerouslySetInnerHTML` is the classic stored-XSS shape. Render it with `RichText`, or
  apply the application's own sanitizer before any other HTML sink.

Sanitize at the application's trust boundary before storage when its allowed tags, embeds,
or author policy are stricter than `RichText`'s display allow-list. `RichText` provides the
non-bypassable rendering safeguard; it does not replace server-side validation or policy.

`createExecCommandEngine`, the legacy engine kept for explicit integrations, is marked
**experimental**: it edits through `document.execCommand`, which is deprecated. It works in
every current browser and has no standard replacement, but it is not a foundation to freeze a
stable API on. `RichTextEditor` uses TipTap by default and is stable, as are its
`RichTextEditorHandle` and the `RichTextEngine` contract.

### Everything else

Text goes through the typography components, which render it as text. Values go through the
primitives, which format them. Neither interprets markup. `Value` and its relatives escape
by construction because React does.

If you pass `dangerouslySetInnerHTML` to a component that accepts arbitrary children, that
is your call and your sanitizer's job.

## Rich text: where sanitisation happens

The editor and the renderer sit on opposite sides of this line, on purpose.

**`RichTextEditor` and every `RichTextEngine` hold what the writer typed, unsanitised.** An
editor that quietly removed part of a draft mid-keystroke would be a worse failure than the
one it was trying to prevent, and it would not make the content safe anyway — the value
goes to a server and comes back through some other path.

**`RichText` is where the allow-list runs.** It is the component for rendering stored
content, it sanitises before anything reaches the DOM, and there is no way to skip that: the
`sanitizer` prop replaces the allow-list, it does not disable it.

So: store what the editor gives you, and render it through `RichText`. Do not render editor
output with `dangerouslySetInnerHTML` of your own.

`src/components/features/rich-text-editor/rich-text-security.test.tsx` asserts both halves —
that an engine keeps a `<script>` tag it was given, and that `RichText` removes both the
script and an `onerror` attribute while keeping the surrounding text.

## Dependencies

Runtime dependencies are kept few and the optional peers are genuinely optional — a family
that does not need `recharts` never loads it, which `verify package` proves across 1164
containment checks on every release.
