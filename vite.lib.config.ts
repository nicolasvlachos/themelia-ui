import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import react from "@vitejs/plugin-react"
import type { Plugin as PostcssPlugin } from "postcss"
import { defineConfig, type Plugin } from "vite"
import dts from "vite-plugin-dts"
import { browserFloor, sharedCss } from "./vite.shared.ts"
import { minifyCatalogueCss } from "./scripts/lib/catalogue-css.mjs"
import { classifyFamilies, type RscFamily } from "./scripts/lib/rsc-manifest.mjs"

const root = import.meta.dirname

/*
 * Library mode inlines every asset as base64, which would put all ten font files in every
 * stylesheet. Font URLs leave the pipeline as a placeholder instead, and shipStyleSources
 * points each written sheet at dist/fonts/, so a browser still fetches only the scripts it needs.
 */
const FONT_URL = "/__themelia-fonts__/"
function fontsStayFiles(): PostcssPlugin {
	return {
		postcssPlugin: "fonts-stay-files",
		Declaration: {
			src(decl) {
				decl.value = decl.value.replace(/url\((["']?)\.\/fonts\//g, `url($1${FONT_URL}`)
			},
		},
	}
}
fontsStayFiles.postcss = true

/**
 * One build entry per published subpath, read from the architecture manifest.
 *
 * The manifest is the single source of truth for entries, and it is itself derived from the
 * source tree by `gen-architecture-manifest.mjs` — so this keeps the "no list to forget to
 * update" property while removing the second, independent discovery that used to live here.
 *
 * The catch with reading a generated file at build time is that a STALE one under-builds
 * silently: add a family, forget to regenerate, and the build simply omits it. So the disk
 * is still walked — not to decide the entries, but to disagree with the manifest loudly.
 * `verify architecture` is the same check with a better report; this is the one that runs
 * even when someone calls `build:lib` on its own.
 */
function discoverEntries(): Record<string, string> {
	const manifest = JSON.parse(
		readFileSync(resolve(root, "architecture/manifest.json"), "utf8"),
	) as { families: { id: string; source: string }[] }

	const entries: Record<string, string> = {
		// Imported for its side effect: the processed global stylesheet is emitted from here.
		// It is not a family, so the manifest records it under `nonFamilyExports`.
		styles: resolve(root, "src/styles.ts"),
	}
	for (const family of manifest.families) {
		entries[family.id] = resolve(root, family.source)
	}

	/*
	 * A family on disk that the manifest does not know about. Failing here is the point:
	 * the alternative is a published package quietly missing a subpath.
	 */
	const onDisk = new Set<string>()
	for (const layer of ["base", "features", "layout", "patterns", "admin/patterns"] as const) {
		const dir = resolve(root, "src/components", layer)
		if (!existsSync(dir)) continue
		for (const item of readdirSync(dir, { withFileTypes: true })) {
			if (!item.isDirectory()) continue
			if (existsSync(resolve(dir, item.name, "index.ts"))) onDisk.add(`${layer}/${item.name}`)
		}
	}
	const missing = [...onDisk].filter((id) => !(id in entries)).sort()
	if (missing.length > 0) {
		throw new Error(
			`architecture/manifest.json is stale — ${missing.length} family barrel(s) on disk are ` +
				`not in it, and would be missing from the build:\n  ${missing.join("\n  ")}\n` +
				"Run `node scripts/gen-architecture-manifest.mjs`.",
		)
	}

	return entries
}

/**
 * Ships the stylesheet sources next to the bundled one.
 *
 * `dist/style.css` is the processed single file for a plain `<link>` or one import.
 * `dist/styles/**` is the readable source tree — 29 small files whose whole point is that a
 * consumer can read the token contract and override a layer. Flattening that away would
 * remove the thing the kit is actually selling.
 */
function shipStyleSources(): Plugin {
	/*
	 * Chunk → the CSS it owns, collected while the bundle still knows. Rollup's own metadata
	 * is the only reliable mapping: matching emitted filenames to entry names by hand breaks
	 * the first time two families share a basename, and breaks silently — a component gets
	 * someone else's stylesheet and nothing errors.
	 */
	const cssByEntry = new Map<string, string[]>()
	const cssByChunk = new Map<string, string[]>()

	return {
		name: "ship-style-sources",
		apply: "build",

		generateBundle(_options, bundle) {
			/*
			 * TRANSITIVELY. `viteMetadata.importedCss` lists only what a chunk imports directly,
			 * and most component CSS lives in the shared chunks an entry pulls in — taking the
			 * direct set gave 35 families a stylesheet and left the other 49 shipping unstyled,
			 * which is the exact failure the single-sheet build existed to avoid.
			 */
			const cssOf = (name: string, seen = new Set<string>()): string[] => {
				if (seen.has(name)) return []
				seen.add(name)
				const chunk = bundle[name]
				if (!chunk || chunk.type !== "chunk") return []
				const own = [...((chunk as { viteMetadata?: { importedCss?: Set<string> } }).viteMetadata?.importedCss ?? [])]
				return [...own, ...chunk.imports.flatMap((next) => cssOf(next, seen))]
			}

			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== "chunk") continue
				/* Direct CSS, per chunk — what gets injected, so the bytes exist once. */
				const own = [...((chunk as { viteMetadata?: { importedCss?: Set<string> } }).viteMetadata?.importedCss ?? [])]
				if (own.length) cssByChunk.set(chunk.fileName, own)
				/* Transitive CSS, per entry — what a family's published stylesheet must cover. */
				if (chunk.isEntry) {
					const css = [...new Set(cssOf(chunk.fileName))]
					if (css.length) cssByEntry.set(chunk.name, css)
				}
			}
		},

		closeBundle() {
			const out = resolve(root, "dist/styles")
			rmSync(out, { recursive: true, force: true })
			cpSync(resolve(root, "src/styles"), out, {
				recursive: true,
				filter: (path) => !path.endsWith(".DS_Store") && !/\/styles\/fonts(\/|$)/.test(path),
			})
			/* The font files once, beside core.css; the copied source tree points up at them. */
			cpSync(resolve(root, "src/styles/fonts"), resolve(root, "dist/fonts"), { recursive: true })
			const sourceFonts = resolve(out, "fonts.css")
			writeFileSync(sourceFonts, readFileSync(sourceFonts, "utf8").replaceAll('url("./fonts/', 'url("../fonts/'))

			/*
			 * The layer order, restated.
			 *
			 * The minifier drops the bare `@layer a, b, c;` statement, which is safe only while
			 * the layers happen to first APPEAR in the right order. Split into 84 files that is
			 * no longer a happy accident but an impossibility: a consumer importing two families
			 * fixes the order by whichever they imported first. So `core.css` declares it, and
			 * every family sheet contains only `@layer components { … }` — which is why core
			 * must be imported before any of them, and why every ESM entry imports it.
			 */
			const source = readFileSync(resolve(root, "src/styles/index.css"), "utf8")
			const order = source.match(/@layer\s+([a-z,\s]+);/)?.[0]?.replace(/\s+/g, " ")
			if (!order) throw new Error("ship-style-sources: no @layer order statement in styles/index.css")

			/* `importedCss` names are already relative to the out dir, `assets/` prefix included. */
			const read = (file: string, fonts = "./fonts/") => readFileSync(resolve(root, "dist", file), "utf8").replaceAll(FONT_URL, fonts)

			/* ── core.css ────────────────────────────────────────────────────────────────
			 * The `styles` entry is the token/theming tree and nothing else: it carries all
			 * five layers and not one module class. That is the shared half of the catalogue,
			 * and the half every family depends on.
			 */
			const coreFiles = cssByEntry.get("styles") ?? []
			if (coreFiles.length !== 1) {
				throw new Error(`ship-style-sources: expected one core stylesheet, found ${coreFiles.length}`)
			}
			const core = `${order}\n${read(coreFiles[0]!)}`
			writeFileSync(resolve(root, "dist/core.css"), core)

			/* ── tailwind.css ────────────────────────────────────────────────────────────
			 * Copied verbatim, not processed.
			 *
			 * It holds one `@theme` block and nothing else — an at-rule only Tailwind
			 * understands, whose whole job is to be read by Tailwind's compiler rather than by
			 * a browser. Running it through the CSS pipeline would minify a file a consumer is
			 * meant to open and read, and risks a transform mangling an at-rule it does not
			 * know. `gen-tailwind-bridge.mjs` writes the source; this ships it.
			 */
			copyFileSync(
				resolve(root, "src/styles/tailwind.css"),
				resolve(root, "dist/tailwind.css"),
			)

			/* ── the source assets, once each ───────────────────────────────────────────
			 * Under `css/`, keeping their emitted names. Writing a family's whole closure into
			 * its own sheet instead made `admin/patterns/commerce.css` 157 KB and the package
			 * 7.4 MB, because forty families each carried their own copy of `base/buttons`.
			 */
			const cssDir = resolve(root, "dist/css")
			mkdirSync(cssDir, { recursive: true })
			const assetName = (file: string) => file.replace(/^assets\//, "")
			for (const file of new Set([...cssByEntry.values()].flat())) {
				writeFileSync(resolve(cssDir, assetName(file)), read(file, "../fonts/"))
			}

			/* ── one sheet per family, and it is an index ───────────────────────────────
			 * `@import` rather than a copy: the bytes live once under `css/`, a bundler inlines
			 * and dedupes the imports, and a consumer who imports the family's stylesheet
			 * explicitly still gets everything it needs.
			 */
			const emitted: { entry: string; file: string }[] = []
			for (const [entry, files] of [...cssByEntry].sort(([a], [b]) => a.localeCompare(b))) {
				if (entry === "styles") continue
				if (!files.some((file) => read(file).trim())) continue
				const target = resolve(root, "dist", `${entry}.css`)
				mkdirSync(dirname(target), { recursive: true })
				/*
				 * `./` at the top level, never nothing. Tailwind v4's resolver (@tailwindcss/cli,
				 * @tailwindcss/postcss, @tailwindcss/vite before 4.3) reads a bare `@import "core.css"`
				 * as a package named core.css, and could not build 2.0.1's `primitives.css`. Vite
				 * forgives it, so `verify package` guards it instead.
				 */
				const depth = entry.split("/").length - 1
				const up = depth ? "../".repeat(depth) : "./"
				writeFileSync(
					target,
					[`@import "${up}core.css";`, ...files.map((file) => `@import "${up}css/${assetName(file)}";`)].join("\n") + "\n",
				)
				emitted.push({ entry, file: `${entry}.css` })
			}

			/* ── the complete catalogue ──────────────────────────────────────────────────
			 * Generated, not maintained — but from the SOURCE assets, each once.
			 *
			 * A family sheet carries its dependencies so that importing it is sufficient on its
			 * own, which means concatenating the family sheets ships `base/buttons` in every
			 * one of the forty families that use it: the first version of this produced a 4.1 MB
			 * style.css from a 438 KB catalogue. The union is the same rules, once each, and
			 * every class in it is unique anyway — `verify css-collisions` proves no two
			 * components share one, so order inside `@layer components` is not load-bearing.
			 */
			/* `core` already holds the `styles` entry's sheet; joining it again cost 236 gzip bytes. */
			const everyAsset = [...new Set([...cssByEntry.values()].flat())]
				.filter((file) => !coreFiles.includes(file))
				.sort()
			/*
			 * One final pass, over the CATALOGUE only.
			 *
			 * Every asset above was minified separately, so each seam between them is a missed
			 * merge. The join was 76,581 gzip bytes against a 76,800 ceiling — 219 bytes, which
			 * is a coincidence rather than a margin. This recovers about 5.5 KB.
			 *
			 * `core.css`, `dist/css/**` and every family index are written from the ORIGINAL
			 * assets, untouched. A catalogue optimisation must not be able to change what a
			 * selective consumer downloads: merging two rules that were adjacent here would be
			 * wrong in a sheet holding only one of their families.
			 */
			writeFileSync(
				resolve(root, "dist/style.css"),
				minifyCatalogueCss(core + everyAsset.map((file) => read(file)).join("")),
			)
			const bytes = (file: string) => statSync(resolve(root, "dist", file)).size

			/*
			 * ESM entries import their own CSS; CJS entries do not.
			 *
			 * A bundler resolves the import and a consumer gets the styles for what they used.
			 * Node cannot `require()` a stylesheet, so the CJS build stays executable and its
			 * consumers import `core.css` plus the families they use explicitly — which the
			 * generated migration and import docs spell out.
			 */
			/*
			 * Core first, on every entry that has any CSS at all — including the ones whose own
			 * chunk carries none.
			 *
			 * `base/buttons.js` is a thin facade; its rules live in a shared chunk. Injecting
			 * only where a chunk had DIRECT css therefore left the entry with no `core.css`
			 * import, and the layer order is fixed by whichever sheet a consumer's bundler
			 * happens to place first. Split across 84 files, that is not a happy accident but
			 * an impossibility — so the entry states it.
			 */
			let linked = 0
			for (const entry of cssByEntry.keys()) {
				if (entry === "styles") continue
				const js = resolve(root, "dist", `${entry}.js`)
				if (!existsSync(js)) continue
				const up = entry.includes("/") ? "../".repeat(entry.split("/").length - 1) : "./"
				const header = `import "${up}core.css";\n`
				const body = readFileSync(js, "utf8")
				if (!body.startsWith(header)) writeFileSync(js, header + body)
			}

			for (const [chunkFile, files] of cssByChunk) {
				/*
				 * ESM only. The CJS build must stay executable in Node, and `import "./x.css"`
				 * inside a `.cjs` file is a syntax error there — which is exactly what the first
				 * version shipped, because the chunk map holds both formats.
				 */
				if (!chunkFile.endsWith(".js")) continue
				const js = resolve(root, "dist", chunkFile)
				if (!existsSync(js)) continue
				const depth = chunkFile.split("/").length - 1
				const up = depth ? "../".repeat(depth) : "./"
				/*
				 * Core first, on the chunk itself. The entry's `import "../core.css"` is not enough:
				 * an entry is a re-export module, `sideEffects: ["**\/*.css"]` marks it pure, and
				 * Vite 8, Rspack and webpack 5 drop it, import and all. A JS-only consumer then got
				 * no tokens, and one who imported components before `style.css` or their own family
				 * sheet got `components` declared first, so the base reset beat every component
				 * rule. The chunk survives because its code is used.
				 *
				 * The core sheet itself is never imported twice: a chunk whose CSS is that sheet
				 * (the `styles` entry) imports `core.css`, which carries it with the layer order
				 * statement and the typefaces.
				 */
				const core = `import "${up}core.css";`
				const own = files
					.filter((file) => !coreFiles.includes(file))
					.map((file) => `import "${up}css/${assetName(file)}";`)
				const body = readFileSync(js, "utf8")
				const missing = [core, ...own].filter((line) => !body.includes(line))
				if (missing.length) {
					/* The entry loop above may already have put core.css on the first line. */
					const [first, ...rest] = body.split("\n")
					writeFileSync(
						js,
						first?.includes("core.css")
							? [first, ...missing, ...rest].join("\n")
							: `${missing.join("\n")}\n${body}`,
					)
				}
				linked++
			}

			/*
			 * Hoist `"use client"` back to the top, once, after every CSS injection.
			 *
			 * It is a directive PROLOGUE: it counts only while it is the first statement in the
			 * module. Two separate loops above prepend stylesheet imports, and each one pushed
			 * the banner down into an ordinary string expression — present in the file, visible
			 * to a grep, and meaningless to every RSC bundler. The CJS output was correct at the
			 * same moment, because nothing injects CSS into it, which is exactly how this would
			 * have shipped: half right and grep-clean.
			 *
			 * One pass at the end rather than a fix at each injection site, because the next
			 * loop to prepend something would reintroduce it. `verify rsc` asserts the position
			 * rather than the presence, for the same reason.
			 */
			for (const entry of CLIENT_ENTRIES) {
				const js = resolve(root, "dist", `${entry}.js`)
				if (!existsSync(js)) continue
				const body = readFileSync(js, "utf8")
				const lines = body.split("\n")
				const at = lines.findIndex((line) => line.trim() === '"use client";')
				if (at <= 0) continue
				lines.splice(at, 1)
				writeFileSync(js, `"use client";\n${lines.join("\n")}`)
			}

			rmSync(resolve(root, "dist/assets"), { recursive: true, force: true })
			console.log(`stylesheets: core.css + ${emitted.length} family indexes over ${new Set([...cssByEntry.values()].flat()).size} sheets, ${linked} chunks linked, style.css ${Math.round(bytes("style.css") / 1024)}KB`)
		},
	}
}

/*
 * Which entry names need the client directive. Computed once, from source — see
 * `scripts/lib/rsc-manifest.mjs` for how, and why it is not a hand-kept list.
 */
const CLIENT_ENTRIES = new Set(classifyFamilies().client.map((family: RscFamily) => family.id))

export default defineConfig({
	// public/ contains the preview app's artwork, not library assets.
	publicDir: false,
	plugins: [
		react(),
		dts({
			// The root tsconfig is project references only; pointing at it emits nothing.
			tsconfigPath: resolve(root, "tsconfig.app.json"),
			entryRoot: "src",
			outDirs: [resolve(root, "dist")],
			include: ["src/**/*.ts", "src/**/*.tsx"],
			// The docs app that consumes the kit, not part of it.
			exclude: [
				"src/preview/**",
				"src/services/**",
				"src/App.tsx",
				"src/main.tsx",
				/* Tests are not a published surface. 68 of their declarations shipped because
				 * only `.spec` was listed, and every one of them now has a `.d.cts` twin too. */
				"**/*.spec.ts",
				"**/*.test.ts",
				"**/*.test.tsx",
				"**/*-test-utils.ts",
			],
		}),
		shipStyleSources(),
	],
	resolve: {
		alias: { "@": resolve(root, "src") },
	},
	css: { ...sharedCss, postcss: { plugins: [...(sharedCss.postcss as { plugins: PostcssPlugin[] }).plugins, fontsStayFiles()] } },
	build: {
		outDir: "dist",
		emptyOutDir: true,
		cssTarget: browserFloor,
		/*
		 * Per-chunk CSS, linked back by `shipStyleSources`.
		 *
		 * Library mode emits per-chunk CSS but does NOT put the `import "./x.css"` back into
		 * the JS, so on their own the fragments are orphans: a consumer would get the token
		 * layer and no component rules. `shipStyleSources` puts the imports back into the ESM
		 * output and writes a stylesheet per family plus the complete `style.css`, so a
		 * consumer loads the CSS for what they import, or the whole catalogue at once.
		 */
		cssCodeSplit: true,
		/*
		 * No sourcemaps. They embed the full original source via `sourcesContent`, which made
		 * them 67% of the package — a second copy of the source tree in every consumer's
		 * node_modules. All they buy is step-debugging into kit internals: bundlers ignore
		 * node_modules maps in production, most consumers debug their own code, and the source
		 * is MIT in a public repo. The part consumers genuinely read — the CSS token contract —
		 * already ships as real files in dist/styles.
		 */
		sourcemap: false,
		lib: {
			entry: discoverEntries(),
			formats: ["es", "cjs"],
			fileName: (format, entry) => `${entry}.${format === "es" ? "js" : "cjs"}`,
		},
		rollupOptions: {
			/*
			 * Externalise every bare specifier. Anything relative or alias-resolved is the kit's
			 * own and gets bundled; anything else is the consumer's to install, which is what
			 * makes the optional peer dependencies work — a consumer who never imports the map
			 * never needs leaflet.
			 */
			external: (id) =>
				!id.startsWith(".") &&
				!id.startsWith("/") &&
				!id.startsWith("\0") &&
				// The "@" alias is the kit's own source. This predicate sees the raw specifier before
				// resolve.alias runs, so without this the kit would ship imports of "@/components".
				!id.startsWith("@/"),
			output: {
				// Chunk names are left to Vite: it is what gives CJS chunks a .cjs extension, and
				// a shared chunk named .js inside a "type": "module" package is parsed as ESM and
				// breaks every require().
				assetFileNames: "assets/[name][extname]",
				/*
				 * `"use client"` on the entries that need it.
				 *
				 * A React Server Component bundler treats the directive as a BOUNDARY: the module
				 * declaring it, and everything below, run on the client. Three files in `src/`
				 * declared it and no published bundle carried it, so importing `Button` into a
				 * Next.js App Router server component failed at the first `useState` — with a
				 * stack pointing into this package rather than at the consumer's page.
				 *
				 * On ENTRIES only, and only those that reach a hook. Marking every chunk would
				 * pull the eleven genuinely server-pure families onto the client for nothing; the
				 * boundary at the entry already covers what it imports.
				 *
				 * Derived per build rather than listed, because a list is wrong the first time a
				 * component gains a hook, silently, in someone else's build.
				 */
				banner: (chunk) => (chunk.isEntry && CLIENT_ENTRIES.has(chunk.name) ? '"use client";' : ""),
			},
		},
	},
})
