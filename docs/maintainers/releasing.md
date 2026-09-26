# Releasing

Every check runs locally: `npm run verify` and `npm test` before each commit, and
`npm run verify:release` before a publish. That release gate decides whether a tree may
publish. It refuses a dirty tree and any platform but macOS, runs
`node scripts/verify.mjs --all` (every static and dist check, the checkers' self-tests, the
packed-package checks and the reference apps, on one build) and then
`npx playwright test --forbid-only` (Chromium, Firefox and WebKit), stops at the first
failure, and fails if the run rewrote a tracked file, since that means committed generated
output was stale. A stray `.only` fails it as well. A pass prints the commit it is about.
Nothing in the repository records a verdict: re-run the gate on any tree you intend to
publish.

Install the three Playwright engines before a local run with
`npx playwright install chromium firefox webkit`. Reviewed pixel comparisons are
Chromium/macOS-specific: elsewhere the Chromium project skips `visual.spec.ts`, so the gate
runs on macOS only.

## Cutting a version

1. Set `version` in `package.json`, and turn the CHANGELOG's `Unreleased` heading into the
   version and date.
2. `npm run tokens:surface` records every custom property this version declares in
   `architecture/token-surface.json`. `verify migrations` holds the NEXT version to it: a
   name that disappears without a `tokens` mapping in `architecture/migrations.json` fails,
   so the codemod cannot silently miss one. Write it only when cutting a version — never to
   make a removal pass.
3. Name the version in `docs/learn/migration.md` — its opening line and the heading of the
   version's upgrade section are hand-written; `verify docs-freshness` fails when the opening
   line disagrees with `package.json` — and set `phase` on that version's entries in
   `architecture/migrations.json`.
4. `npm run docs:sync-skill`; the status docs, README facts and component index read the
   version from `package.json`.

## Publishing

1. Commit everything.
2. `npm run verify:release` to rehearse, and check that the commit it prints is the one you
   intend to publish.
3. `npm publish`. `prepublishOnly` runs `verify:release -- --publish`, which first refuses a
   version npm already has or one without a `## <version>` CHANGELOG heading, then runs the
   whole gate again, so a tree that fails cannot publish. Answer npm's one-time password
   prompt at upload; a code passed up front expires while the gate runs.

## Publishing without rerunning tests

When retrying after an npm authentication, permission, or registry-name failure, use:

```bash
npm run publish:without-tests
```

This runs `npm publish --ignore-scripts --access public`. It deliberately skips
`prepublishOnly` and every other npm lifecycle script, so it publishes the existing `dist`
without rebuilding or retesting it. Use it only when that exact artifact is the one you
intend to publish; the normal `npm publish` path remains the release-gated default.
