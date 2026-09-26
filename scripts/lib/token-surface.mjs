/*
 * Custom properties the package declares. `declaredTokens()` reads src/styles and
 * src/components; the recorded release surface is src/styles only, because component
 * variables are private. `architecture/token-surface.json` records that surface at the last
 * release, and verify migrations requires each recorded name to be still declared or mapped
 * in architecture/migrations.json. `node scripts/lib/token-surface.mjs --write`
 * (`npm run tokens:surface`) records the version being cut — see docs/maintainers/releasing.md.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOTS = ['src/styles', 'src/components']
/* The theme's own tokens: what a consumer may rely on across releases. */
const SURFACE_ROOTS = ['src/styles']
const SURFACE = 'architecture/token-surface.json'

function cssFiles(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry)
		if (statSync(path).isDirectory()) cssFiles(path, out)
		else if (entry.endsWith('.css')) out.push(path)
	}
	return out
}

/** Declared names under `base` (the repository root by default), sorted. */
export function declaredTokens(base = '.', roots = ROOTS) {
	const names = new Set()
	for (const root of roots) {
		for (const file of cssFiles(join(base, root))) {
			const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
			for (const match of source.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)) names.add(match[1])
		}
	}
	return [...names].sort()
}

if (process.argv.includes('--write') && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
	const tokens = declaredTokens('.', SURFACE_ROOTS)
	const { note } = JSON.parse(readFileSync(SURFACE, 'utf8'))
	writeFileSync(SURFACE, `${JSON.stringify({ note, version, tokens }, null, 2)}\n`)
	console.log(`token surface: ${tokens.length} custom properties recorded for ${version}`)
}
