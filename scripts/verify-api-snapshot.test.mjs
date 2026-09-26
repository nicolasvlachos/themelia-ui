/*
 * Runs the real API-snapshot generator and gate against declaration changes in a temporary
 * package. Static checks run before build:lib, so never depend on dist or the real snapshot.
 */
import assert from "node:assert/strict"
import { execFileSync, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const scripts = dirname(fileURLToPath(import.meta.url))

function verify(cwd) {
	const result = spawnSync(process.execPath, ["scripts/verify-api-snapshot.mjs"], {
		cwd,
		encoding: "utf8",
	})
	assert.ifError(result.error)
	assert.equal(result.signal, null, result.stderr)
	return { status: result.status, out: `${result.stdout}${result.stderr}` }
}

function changedDeclarations(t, before, after) {
	const cwd = mkdtempSync(join(tmpdir(), "themelia-api-compatibility-"))
	t.after(() => rmSync(cwd, { recursive: true, force: true }))
	const files = {
		"package.json": JSON.stringify({
			name: "api-compatibility-fixture",
			version: "1.0.0",
			exports: { ".": { types: "./index.d.ts" } },
		}),
		"index.d.ts": before,
		"architecture/migrations.json": "{}",
		"docs/generated/migration-broad-imports.json": '{"symbols":{}}',
	}
	for (const [path, contents] of Object.entries(files)) {
		mkdirSync(dirname(join(cwd, path)), { recursive: true })
		writeFileSync(join(cwd, path), contents)
	}
	// The real scripts and their TypeScript dependency resolve from this checkout;
	// every file the generator/verifier reads or writes resolves in the fixture cwd.
	symlinkSync(scripts, join(cwd, "scripts"), "dir")
	assert.equal(existsSync(join(cwd, "dist")), false)
	execFileSync(process.execPath, ["scripts/gen-api-snapshot.mjs"], { cwd, stdio: "pipe" })
	const snapshotPath = join(cwd, "architecture/api-snapshot.json")
	const accepted = readFileSync(snapshotPath, "utf8")
	const unchanged = verify(cwd)
	assert.equal(unchanged.status, 0, unchanged.out)
	assert.match(unchanged.out, /PASS verify api-snapshot/)

	writeFileSync(join(cwd, "index.d.ts"), after)
	const result = verify(cwd)
	assert.equal(readFileSync(snapshotPath, "utf8"), accepted, "verification must preserve the accepted snapshot")
	return result
}

test("a removed member is BREAKING", (t) => {
	const result = changedDeclarations(t,
		"export interface Props { label: string; removed?: string }",
		"export interface Props { label: string }",
	)
	assert.equal(result.status, 1, result.out)
	assert.match(result.out, /Props: removed removed — BREAKING/)
})

test("an optional member made required is BREAKING", (t) => {
	const result = changedDeclarations(t,
		"export interface Props { label: string; description?: string }",
		"export interface Props { label: string; description: string }",
	)
	assert.equal(result.status, 1, result.out)
	assert.match(result.out, /Props: description became required — BREAKING/)
})

test("a narrowed member type is BREAKING", (t) => {
	const result = changedDeclarations(t,
		'export interface Props { tone: "a" | "b" | "c" }',
		'export interface Props { tone: "a" | "b" }',
	)
	assert.equal(result.status, 1, result.out)
	assert.match(result.out, /Props: tone: "a" \| "b" \| "c" → "a" \| "b" — BREAKING/)
})

test("a removed name is BREAKING", (t) => {
	const result = changedDeclarations(t,
		"export interface Props { label: string } export declare function dismiss(): void;",
		"export interface Props { label: string }",
	)
	assert.equal(result.status, 1, result.out)
	assert.match(result.out, /removed\s+\.\s+dismiss \(callable\) — BREAKING/)
})

test("a function becoming a const of the same type is NOT breaking", (t) => {
	const result = changedDeclarations(t,
		"export declare function dismiss(id?: string): void;",
		"export declare const dismiss: (id?: string) => void;",
	)
	assert.equal(result.status, 0, result.out)
	assert.match(result.out, /PASS verify api-snapshot/)
})

test("an added optional member is additive, not breaking", (t) => {
	const result = changedDeclarations(t,
		"export interface Props { label: string }",
		"export interface Props { label: string; description?: string }",
	)
	assert.equal(result.status, 1, "the gate still stops so the addition is reviewed")
	assert.match(result.out, /Props: description added — additive/)
	// Match a finding's suffix: the help footer mentions BREAKING on every failed run.
	assert.doesNotMatch(result.out, /— BREAKING/)
})
