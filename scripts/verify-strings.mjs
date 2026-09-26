/**
 * Strings gate: every word a component renders or announces must be overridable through its
 * `*.strings.ts`, and every override must work. One walk of src/components reports:
 *   jsx-text / copy-attribute / copy-default / loose-copy-prop   hardcoded copy (ratcheted)
 *   unread-key          a top-level `default*Strings` key no other file in its family names,
 *                       so overriding it silently does nothing (any mention counts as a read;
 *                       removing a key is breaking — record it in architecture/migrations.json)
 *   spread-over-nested  `{ ...defaults, ...strings }` over defaults that nest a group: the
 *                       override replaces the whole group — use resolveStrings()
 * Copy findings fail unless listed in `scripts/strings-exceptions.json`, and an exception that
 * no longer matches fails. `--update` rewrites the exceptions, carrying reasons and owners forward.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"

import ts from "typescript"

/** Every layer that ships to a consumer; overridable so the tests can point at fixtures. */
const ROOTS = process.env.STRINGS_ROOTS ? process.env.STRINGS_ROOTS.split(",") : ["src/components"]

/* `*.strings.ts` files are not scanned for copy: their keys ARE the strings. */
const SKIP = /\.(test|spec|stories)\.[tj]sx?$|\.strings\.ts$/

const EXCEPTIONS_PATH = process.env.STRINGS_EXCEPTIONS ?? "scripts/strings-exceptions.json"
const REASONS = new Set(["composed-from-overridable-parts", "consumer-owned-prop"])

/** Attributes whose value a screen reader or a user reads. */
const COPY_ATTRIBUTES = new Set([
	"aria-label",
	"aria-description",
	"aria-roledescription",
	"aria-placeholder",
	"placeholder",
	"title",
	"alt",
])

/** Parameter names whose default value would be user-facing copy. */
const COPY_NAME = /(label|message|placeholder|title|description|caption|hint|tooltip)$/i

/** Copy legitimately owned by a prop rather than a strings key. */
const ALLOWED_PROPS = new Set([
	"ariaLabel", // an AuthShell brand names ITSELF; there is no default to override.
	"tooltipLabel", // internal partial, fed by Card's own strings.
	"hideLabel", // a boolean on ChartTooltipContent — hides the row, not copy.
])

/** Names that end in a copy word but are callbacks, render props or switches. */
const NOT_COPY = /^(on|render|is|has|should|show|hide|with|use|get|format)[A-Z]/

function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry)
		if (statSync(path).isDirectory()) walk(path, out)
		else if (/\.tsx?$/.test(path) && !path.endsWith(".d.ts")) out.push(path)
	}
	return out
}

/** A type that cannot hold copy: a function, a boolean, or a union of only those. */
function isNotCopyType(type) {
	if (!type) return false
	if (ts.isFunctionTypeNode(type)) return true
	if (type.kind === ts.SyntaxKind.BooleanKeyword) return true
	if (ts.isUnionTypeNode(type)) return type.types.every((member) => isNotCopyType(member))
	return false
}

/**
 * The copy an expression can put on screen: literals and templates, through parentheses,
 * ternaries and `??`/`||`. Only the right of `&&` is followed — its left is a condition.
 */
function copyIn(expression, found = []) {
	if (!expression) return found

	if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
		if (/[A-Za-z]{2,}/.test(expression.text)) found.push(JSON.stringify(expression.text.slice(0, 48)))
	} else if (ts.isTemplateExpression(expression)) {
		found.push(`{${expression.getText().slice(0, 44)}}`)
	} else if (ts.isParenthesizedExpression(expression)) {
		copyIn(expression.expression, found)
	} else if (ts.isConditionalExpression(expression)) {
		copyIn(expression.whenTrue, found)
		copyIn(expression.whenFalse, found)
	} else if (ts.isBinaryExpression(expression)) {
		const operator = expression.operatorToken.kind
		if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
			copyIn(expression.right, found)
		} else if (
			operator === ts.SyntaxKind.BarBarToken ||
			operator === ts.SyntaxKind.QuestionQuestionToken
		) {
			copyIn(expression.left, found)
			copyIn(expression.right, found)
		}
	}
	return found
}

/** Top-level keys of an object literal, given the source and the index of its `{`. */
function topLevelKeys(source, open) {
	const keys = []
	let depth = 0
	for (let i = open; i < source.length; i++) {
		const char = source[i]
		if (char === "{" || char === "(" || char === "[") depth++
		else if (char === "}" || char === ")" || char === "]") {
			depth--
			if (depth === 0) break
		} else if (depth === 1) {
			const key = /^([A-Za-z_][A-Za-z0-9_]*)\s*:/.exec(source.slice(i))
			/* Only at the start of an entry, so `foo: bar ? a : b` yields one key. */
			if (key && /[{,]\s*$/.test(source.slice(open, i))) keys.push(key[1])
		}
	}
	return keys
}

const files = ROOTS.flatMap((root) => walk(root))
const text = new Map(files.map((file) => [file, readFileSync(file, "utf8")]))
const short = (file) => file.replace("src/components/", "")

const findings = []
const record = (rule, file, detail) => findings.push({ rule, file: short(file), detail })

for (const file of files.filter((path) => !SKIP.test(path))) {
	const source = ts.createSourceFile(file, text.get(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

	const visit = (node) => {
		/* ── words between tags ─────────────────────────────────────────────────── */
		if (ts.isJsxText(node)) {
			const copy = node.text.trim()
			/* Two consecutive letters: separators and a lone glyph like `x` are not copy. */
			if (/[A-Za-z]{2,}/.test(copy)) record("jsx-text", file, JSON.stringify(copy.slice(0, 48)))
		}

		/* ── words rendered through an expression ───────────────────────────────── */
		if (ts.isJsxExpression(node) && node.parent && ts.isJsxElement(node.parent)) {
			for (const literal of copyIn(node.expression)) record("jsx-text", file, literal)
		}

		/* ── accessible names and placeholders ──────────────────────────────────── */
		if (ts.isJsxAttribute(node) && node.name) {
			const name = node.name.getText()
			if (COPY_ATTRIBUTES.has(name)) {
				const value = node.initializer
				/* `alt=""` (decorative image) is correct; `copyIn` drops it for having no letters. */
				const expression =
					value && ts.isStringLiteral(value)
						? value
						: value && ts.isJsxExpression(value)
							? value.expression
							: undefined

				for (const literal of copyIn(expression)) record("copy-attribute", file, `${name}=${literal}`)
			}
		}

		/* ── default copy in a parameter ────────────────────────────────────────── */
		if (ts.isBindingElement(node) && node.initializer && node.name && ts.isIdentifier(node.name)) {
			const name = node.name.text
			const init = node.initializer
			const isString = ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)
			if (
				isString &&
				/* Two letters, so a glyph default like `submitKeyLabel = "↩"` is a symbol, not copy. */
				/[A-Za-z]{2,}/.test(init.text) &&
				COPY_NAME.test(name) &&
				!NOT_COPY.test(name) &&
				!ALLOWED_PROPS.has(name)
			) {
				record("copy-default", file, `${name} = ${JSON.stringify(init.text.slice(0, 36))}`)
			}
		}

		/* ── a loose prop standing in for a strings key ─────────────────────────── */
		if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith("Props")) {
			const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
			if (exported) {
				for (const member of node.members) {
					if (!ts.isPropertySignature(member) || !member.name) continue
					const name = member.name.getText()
					if (!/(Label|Labels|Message|Placeholder)$/.test(name)) continue
					if (ALLOWED_PROPS.has(name) || NOT_COPY.test(name)) continue
					if (isNotCopyType(member.type)) continue
					record("loose-copy-prop", file, name)
				}
			}
		}

		ts.forEachChild(node, visit)
	}

	visit(source)
}

/* ── overrides that must work: unread keys, and spreads over nested groups ───────── */
const broken = []
const nesting = new Map()
for (const file of files.filter((path) => path.endsWith(".strings.ts"))) {
	const source = text.get(file)
	const family = dirname(file)
	/* Nested strings objects are skipped: they are handed to a child family wholesale. */
	const readers = files
		.filter((path) => path !== file && path.startsWith(`${family}/`))
		.map((path) => text.get(path))
		.join("\n")
	for (const match of source.matchAll(/export const (default[A-Za-z0-9]*Strings)\b[^=]*=\s*\{/g)) {
		const open = source.indexOf("{", match.index + match[0].length - 1)
		for (const key of topLevelKeys(source, open)) {
			if (!new RegExp(`\\b${key}\\b`).test(readers)) {
				broken.push(`unread-key          ${short(file)}  ${match[1]}.${key} can be overridden, but nothing in the family reads it`)
			}
		}
	}
	/* A tab-indented `key: {` at the top of the literal: the copy nests. */
	for (const match of source.matchAll(/export const (default[A-Za-z]+Strings)[^=]*=\s*\{([\s\S]*?)\n\}/g)) {
		if (/^\t[a-zA-Z][\w]*:\s*\{/m.test(match[2])) nesting.set(match[1], file)
	}
}
for (const file of files.filter((path) => !path.endsWith(".strings.ts"))) {
	for (const [name, source] of nesting) {
		if (new RegExp(`\\{\\s*\\.\\.\\.${name}\\s*,\\s*\\.\\.\\.\\w+\\s*\\}`).test(text.get(file))) {
			broken.push(`spread-over-nested  ${short(file)}  resolves ${name} with a spread; ${short(source)} nests, so an override blanks a group — use resolveStrings()`)
		}
	}
}

/*
 * One identity per OCCURRENCE (`#2`, `#3` suffixes), so fixing or adding a duplicate of an
 * existing finding is still seen by the ratchet.
 */
const seen = new Map()
const identity = ({ rule, file, detail }) => {
	const base = `${rule}|${file}|${detail}`
	const count = (seen.get(base) ?? 0) + 1
	seen.set(base, count)
	return count === 1 ? base : `${base}#${count}`
}
/*
 * Each exception names a reason from REASONS and the declaration that owns it. An unknown
 * reason, a missing owner, a duplicate, or a stale finding all fail.
 */
const exceptions = existsSync(EXCEPTIONS_PATH) ? JSON.parse(readFileSync(EXCEPTIONS_PATH, "utf8")) : []
const baseline = new Set(exceptions.map((entry) => entry.finding))

{
	const problems = []
	const seenFindings = new Set()
	for (const [index, entry] of exceptions.entries()) {
		const at = `entry ${index}`
		if (typeof entry?.finding !== "string" || !entry.finding.includes("|")) problems.push(`${at}: no finding`)
		if (!REASONS.has(entry?.reason)) problems.push(`${entry?.finding ?? at}: reason ${JSON.stringify(entry?.reason)} is not one of ${[...REASONS].join(", ")}`)
		if (typeof entry?.owner !== "string" || !/^[A-Za-z][A-Za-z0-9]*$/.test(entry.owner)) {
			problems.push(`${entry?.finding ?? at}: owner ${JSON.stringify(entry?.owner)} is not an exported declaration name`)
		}
		if (seenFindings.has(entry?.finding)) problems.push(`${entry.finding}: listed twice`)
		seenFindings.add(entry?.finding)
	}
	if (problems.length > 0) {
		console.log(`FAIL verify strings — ${problems.length} problem(s) in ${EXCEPTIONS_PATH}\n`)
		for (const problem of problems) console.log(`  exception  ${problem}`)
		console.log(`\n  Every entry needs a finding, a reason from the closed set, and the owning declaration.`)
		process.exit(1)
	}
}

const identities = findings.map((finding) => identity(finding))

if (process.argv.includes("--update")) {
	/*
	 * Run deliberately: the file should only shrink. Existing reasons and owners carry
	 * forward; a new finding gets `reason: null`, which fails the check above until written.
	 */
	const known = new Map(exceptions.map((entry) => [entry.finding, entry]))
	const next = [...identities].sort().map((finding) => known.get(finding) ?? { finding, reason: null, owner: null })
	writeFileSync(EXCEPTIONS_PATH, `${JSON.stringify(next, null, 1)}\n`)
	const unexplained = next.filter((entry) => entry.reason === null).length
	console.log(
		`strings exceptions rewritten: ${next.length} entr(ies)` +
			(unexplained > 0 ? `, ${unexplained} needing a reason and an owner` : ""),
	)
	process.exit(0)
}

const current = new Set(identities)
const added = findings.filter((_, index) => !baseline.has(identities[index]))
const fixed = [...baseline].filter((entry) => !current.has(entry))

if (added.length > 0 || fixed.length > 0 || broken.length > 0) {
	console.log(`FAIL verify strings — ${added.length + fixed.length + broken.length} problem(s)\n`)
	for (const { rule, file, detail } of added) console.log(`  ${rule.padEnd(18)}  ${file}\n${" ".repeat(22)}${detail}`)
	for (const line of broken.sort()) console.log(`  ${line}`)
	for (const entry of fixed) console.log(`  fixed               ${entry} no longer applies`)
	if (added.length) console.log("\n  Route new copy through the family's `*.strings.ts` and `resolveStrings`; a formatter\n  (`remove(name)`, `dateCount(n)`) is how a template becomes a string key.")
	if (fixed.length) console.log("\n  Good news: `node scripts/verify-strings.mjs --update` drops the exception.")
	process.exit(1)
}

console.log(
	`PASS verify strings — no new hardcoded copy across ${ROOTS.length} root(s) ` +
		`(${baseline.size} justified exceptions, none added); every override key is read, and ` +
		`${nesting.size} nested families deep-merge.`,
)
