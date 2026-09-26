/*
 * Proves the strings gate fails on the copy it claims to catch, passes copy that comes from a
 * resolved strings object, and catches overrides that cannot work. Each case scans a temp tree.
 */
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { test } from "node:test"

/** Scan `files` (path → source, under a fixture components root) with the given exceptions. */
function scanFiles(files, exceptions = []) {
	const dir = mkdtempSync(join(tmpdir(), "verify-strings-"))
	const root = join(dir, "components")
	for (const [file, source] of Object.entries(files)) {
		mkdirSync(dirname(join(root, file)), { recursive: true })
		writeFileSync(join(root, file), source)
	}
	const exceptionsPath = join(dir, "exceptions.json")
	writeFileSync(exceptionsPath, JSON.stringify(exceptions))
	try {
		const out = execFileSync("node", ["scripts/verify-strings.mjs"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
			env: { ...process.env, STRINGS_ROOTS: root, STRINGS_EXCEPTIONS: exceptionsPath },
		})
		return { failed: false, out }
	} catch (error) {
		return { failed: true, out: `${error.stdout ?? ""}${error.stderr ?? ""}` }
	} finally {
		rmSync(dir, { recursive: true, force: true })
	}
}

const scan = (source, { file = "fixture.tsx" } = {}) => scanFiles({ [file]: source })
const scanWithExceptions = (source, entries) => scanFiles({ "fixture.tsx": source }, entries)

test("a template accessible name is caught", () => {
	const result = scan("export const A = ({ name }) => <button aria-label={`Remove ${name}`}>x</button>\n")

	assert.ok(result.failed, "the gate should fail")
	assert.match(result.out, /copy-attribute/)
	assert.match(result.out, /aria-label/)
})

test("a word between tags is caught", () => {
	const result = scan("export const A = () => <span>Generating…</span>\n")

	assert.ok(result.failed)
	assert.match(result.out, /jsx-text/)
	assert.match(result.out, /Generating/)
})

test("a default copy parameter is caught", () => {
	const result = scan('export function Example({ placeholder = "Search" }) {\n\treturn <input placeholder={placeholder} />\n}\n')

	assert.ok(result.failed)
	assert.match(result.out, /copy-default/)
	assert.match(result.out, /placeholder/)
})

test("a literal behind a ternary is caught", () => {
	/* A JsxExpression, not JsxText. */
	const result = scan('export const A = ({ failed, placeholder }) => <div>{failed ? "Could not generate a code." : placeholder}</div>\n')

	assert.ok(result.failed)
	assert.match(result.out, /jsx-text/)
	assert.match(result.out, /Could not generate/)
})

test("a template behind a fallback is caught", () => {
	const result = scan("export const A = ({ label, value }) => <div aria-label={label ?? `QR code for ${value}`} />\n")

	assert.ok(result.failed)
	assert.match(result.out, /copy-attribute/)
})

test("a loose copy prop is caught", () => {
	const result = scan("export interface AProps {\n\tremoveLabel?: string\n}\n", { file: "a.tsx" })

	assert.ok(result.failed)
	assert.match(result.out, /loose-copy-prop/)
	assert.match(result.out, /removeLabel/)
})

/* False positives the gate must not report. */
test("copy from a resolved strings object passes", () => {
	const result = scan(
		"export const A = ({ copy, name }) => (\n" +
			"\t<button aria-label={copy.remove(name)}>{copy.remove(name)}</button>\n" +
			")\n",
	)

	assert.equal(result.failed, false, result.out)
})

test("an empty alt passes", () => {
	/* `alt=""` is what tells a screen reader to skip a decorative image. */
	assert.equal(scan('export const A = () => <img alt="" src="x" />\n').failed, false)
})

test("a comparison against a string literal passes", () => {
	/* `{mode === "overlay" && …}` is a binary expression; only the right side renders. */
	const result = scan('export const A = ({ mode }) => <div>{mode === "overlay" && <span />}</div>\n')

	assert.equal(result.failed, false, result.out)
})

test("a separator with no letters passes", () => {
	const result = scan("export const A = () => <span>·</span>\n")

	assert.equal(result.failed, false, result.out)
})

test("a callback whose name ends in Message passes", () => {
	/* `onMessage` and `renderMessage` are plumbing, not copy. */
	const result = scan(
		"export interface AProps {\n\tonMessage?: (text: string) => void\n\trenderMessage?: () => unknown\n\thideLabel?: boolean\n}\n",
	)

	assert.equal(result.failed, false, result.out)
})

test("a strings definition file is not scanned", () => {
	const result = scan('export const defaults = { remove: "Remove" }\n', { file: "a.strings.ts" })

	assert.equal(result.failed, false, result.out)
})

/* ── The exceptions file: every way an entry can be malformed or stale ── */
const HIDDEN_UNREAD = `
export function Row() {
	return <span><VisuallyHidden>Unread</VisuallyHidden></span>
}
`

test("screen-reader-only copy is still copy", () => {
	/* Invisible on screen, but announced — so it needs a strings key like any other copy. */
	const { failed, out } = scanWithExceptions(HIDDEN_UNREAD, [])
	assert.equal(failed, true, out)
	assert.match(out, /Unread/)
})

test("an exception with no reason is refused", () => {
	const { failed, out } = scanWithExceptions(HIDDEN_UNREAD, [
		{ finding: 'jsx-text|fixture.tsx|<VisuallyHidden>Unread</VisuallyHidden>', owner: 'Row' },
	])
	assert.equal(failed, true, out)
	assert.match(out, /reason/)
})

test("an exception with an invented reason is refused", () => {
	const { failed, out } = scanWithExceptions(HIDDEN_UNREAD, [
		{ finding: 'jsx-text|fixture.tsx|<VisuallyHidden>Unread</VisuallyHidden>', reason: 'looks-fine', owner: 'Row' },
	])
	assert.equal(failed, true, out)
	assert.match(out, /is not one of/)
})

test("an exception with no owner is refused", () => {
	const { failed, out } = scanWithExceptions(HIDDEN_UNREAD, [
		{ finding: 'jsx-text|fixture.tsx|<VisuallyHidden>Unread</VisuallyHidden>', reason: 'consumer-owned-prop' },
	])
	assert.equal(failed, true, out)
	assert.match(out, /owner/)
})

test("the same finding excepted twice is refused", () => {
	const entry = { finding: 'jsx-text|fixture.tsx|<VisuallyHidden>Unread</VisuallyHidden>', reason: 'consumer-owned-prop', owner: 'Row' }
	const { failed, out } = scanWithExceptions(HIDDEN_UNREAD, [entry, { ...entry }])
	assert.equal(failed, true, out)
	assert.match(out, /listed twice/)
})

test("an exception left behind after its finding is fixed is refused", () => {
	/* The other direction of the ratchet: an entry must not outlive the line it excuses. */
	const clean = `
export function Row({ label }: { label: string }) {
	return <span>{label}</span>
}
`
	const { failed, out } = scanWithExceptions(clean, [
		{ finding: 'jsx-text|fixture.tsx|<VisuallyHidden>Unread</VisuallyHidden>', reason: 'consumer-owned-prop', owner: 'Row' },
	])
	assert.equal(failed, true, out)
	assert.match(out, /no longer appl/)
})

/* ── Overrides that must work ── */
test("a strings key nothing in the family reads is caught", () => {
	const { failed, out } = scanFiles({
		"card/card.strings.ts": 'export const defaultCardStrings = {\n\ttitle: "Card",\n\tsubtitle: "Sub",\n}\n',
		"card/card.tsx": "export const Card = ({ copy }) => <h2>{copy.title}</h2>\n",
	})
	assert.equal(failed, true, out)
	assert.match(out, /unread-key .*defaultCardStrings\.subtitle/)
})

test("a spread over nested defaults is caught; resolveStrings passes", () => {
	/* A spread replaces the whole `actions` group, so overriding one key blanks its siblings. */
	const family = (resolved) => ({
		"card/card.strings.ts": 'export const defaultCardStrings = {\n\ttitle: "Card",\n\tactions: {\n\t\tclose: "Close",\n\t},\n}\n',
		"card/card.tsx": `export const Card = ({ strings }) => {\n\tconst copy = ${resolved}\n\treturn <h2>{copy.title}{copy.actions.close}</h2>\n}\n`,
	})
	const spread = scanFiles(family("{ ...defaultCardStrings, ...strings }"))
	assert.equal(spread.failed, true, spread.out)
	assert.match(spread.out, /spread-over-nested/)

	const merged = scanFiles(family("resolveStrings(defaultCardStrings, strings)"))
	assert.equal(merged.failed, false, merged.out)
})
