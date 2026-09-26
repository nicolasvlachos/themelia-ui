import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { basename, relative, resolve } from "node:path"
import type { Plugin as PostcssPlugin } from "postcss"
import type { CSSOptions } from "vite"

/**
 * Wraps every CSS Module's rules in `@layer components`.
 *
 * styles/index.css declares the layer order, and module rules must land in the
 * `components` layer for a consumer's unlayered `className` to win — that is the whole
 * replacement for `tailwind-merge`. Doing it here rather than by hand keeps the
 * guarantee out of 600 individual files, where one forgotten wrapper would silently
 * make that component un-overridable.
 *
 * `@import`, `@charset`, and `@layer` statements must stay at the top level, and
 * `:root` custom properties are hoisted out too: a module has no business declaring
 * theme variables, but if one does, layering them would change their precedence.
 *
 * Shared by the app build and the library build. A library consumer who lost this
 * wrapper would find their own `className` outranked by our internals, so the two
 * configs must never drift.
 */
export function cssModulesInComponentsLayer(): PostcssPlugin {
	return {
		postcssPlugin: "css-modules-in-components-layer",
		OnceExit(root, { AtRule }) {
			const file = root.source?.input.file ?? ""
			if (!file.endsWith(".module.css")) return
			if (root.some((node) => node.type === "atrule" && node.name === "layer" && !node.nodes)) return

			const layer = new AtRule({ name: "layer", params: "components" })
			const moved = root.nodes.filter(
				(node) =>
					!(node.type === "atrule" && ["import", "charset"].includes(node.name)) &&
					!(node.type === "rule" && node.selector === ":root"),
			)
			if (moved.length === 0) return

			root.append(layer)
			for (const node of moved) layer.append(node.remove())
		},
	}
}
cssModulesInComponentsLayer.postcss = true

/**
 * Resolves `@custom-media` at build time.
 *
 * A media query condition cannot read `var()`, so breakpoints are the one part of the
 * token system that must be substituted rather than referenced. This keeps them declared
 * once in styles/theming/breakpoints.css instead of retyped as literals across modules.
 *
 * `@media (--bp-md)` and `@container name (--cq-xl)` both resolve; unknown names are left
 * untouched and reported, since silently dropping a query would make a rule never match.
 */
export function customMedia(): PostcssPlugin {
	// Read the definitions from disk up front rather than collecting them as files are
	// processed. Vite hands each stylesheet to postcss separately and in no guaranteed
	// order, so a module compiled before breakpoints.css would see an empty map and leave
	// `@media (--bp-md)` unresolved — a query that then never matches, silently.
	const definitions = new Map<string, string>()
	const source = readFileSync(resolve(import.meta.dirname, "src/styles/theming/breakpoints.css"), "utf8")
	for (const match of source.matchAll(/@custom-media\s+(--[\w-]+)\s+([^;]+);/g)) {
		if (match[1] && match[2]) definitions.set(match[1], match[2].trim())
	}

	return {
		postcssPlugin: "custom-media",
		Once(root) {
			// Strip the declarations themselves; they are not valid CSS output.
			root.walkAtRules("custom-media", (rule) => {
				rule.remove()
			})
		},
		OnceExit(root, { result }) {
			root.walkAtRules(/^(media|container)$/, (rule) => {
				rule.params = rule.params.replace(/\(\s*(--[\w-]+)\s*\)/g, (whole, name) => {
					const resolved = definitions.get(name)
					if (resolved) return resolved
					rule.warn(result, `unknown @custom-media name ${name}`)
					return whole
				})
			})
		},
	}
}
customMedia.postcss = true

/**
 * The oldest browsers the kit supports, set by CSS it cannot do without: `round()` (Chrome
 * 125), `:has()` (Firefox 121), `:dir()` (Safari 16.4). It is also both builds' CSS target:
 * below it, lightningcss rewrites `:dir(rtl)` as a list of right-to-left languages, which
 * ignores `dir="rtl"`.
 */
export const browserFloor = ["chrome125", "edge125", "firefox121", "safari16.4"]

/**
 * `button__root___a1B2c`: the file, the class, and a hash of both with the file's path, so
 * the two `table.module.css` files never share a class. Written out because the
 * `[name]__[local]___[hash:base64:5]` pattern keeps a `-module` suffix in `[name]`, which
 * cost 16 KB raw and 1.1 KB gzip across the catalogue. Consumers target the stable
 * `{name}--component` hooks, not these; a snapshot of one breaks when this changes.
 */
function scopedName(local: string, filename: string) {
	const file = filename.replace(/\?.*$/, "")
	const name = basename(file).replace(/\.module\.css$/, "")
	const hash = createHash("sha256").update(`${relative(import.meta.dirname, file)}\0${local}`).digest("base64url")
	return `${name}__${local}___${hash.slice(0, 5)}`
}

/** The CSS pipeline both builds share. */
export const sharedCss: CSSOptions = {
	// customMedia runs first so breakpoint names are resolved before the layer wrap.
	postcss: { plugins: [customMedia(), cssModulesInComponentsLayer()] },
	modules: {
		generateScopedName: scopedName,
		localsConvention: "camelCaseOnly",
	},
}
