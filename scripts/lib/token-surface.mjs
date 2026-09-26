/*
 * Every custom property the package declares under src/styles and src/components.
 * `architecture/token-surface.json` records it at the last release; verify migrations
 * requires each recorded name to be still declared or mapped in architecture/migrations.json.
 * `node scripts/lib/token-surface.mjs --write` (`npm run tokens:surface`) records the version
 * being cut — see docs/maintainers/releasing.md.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOTS = ['src/styles', 'src/components']
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
export function declaredTokens(base = '.') {
	const names = new Set()
	for (const root of ROOTS) {
		for (const file of cssFiles(join(base, root))) {
			const source = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
			for (const match of source.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)) names.add(match[1])
		}
	}
	return [...names].sort()
}

if (process.argv.includes('--write') && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
	const tokens = declaredTokens()
	const { note } = JSON.parse(readFileSync(SURFACE, 'utf8'))
	writeFileSync(SURFACE, `${JSON.stringify({ note, version, tokens }, null, 2)}\n`)
	console.log(`token surface: ${tokens.length} custom properties recorded for ${version}`)
}
