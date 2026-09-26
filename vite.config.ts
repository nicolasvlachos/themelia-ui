import { execFileSync } from "node:child_process"
import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { browserFloor, sharedCss } from "./vite.shared.ts"

/*
 * Writes each page's API tables (src/preview/generated/api/<page>.json, not committed) from the
 * declarations, when the dev server starts or a build begins, and again when a declaration or
 * a page changes. A page naming something the package does not declare fails the build.
 */
function apiTables(): Plugin {
	const generate = () => {
		execFileSync(process.execPath, ["scripts/gen-api-tables.mjs"], { stdio: ["ignore", "ignore", "inherit"] })
	}
	return {
		name: "api-tables",
		buildStart: generate,
		configureServer(server) {
			let timer: ReturnType<typeof setTimeout> | undefined
			server.watcher.on("change", (file) => {
				if (!/\/src\/(components|lib|preview\/pages)\/.+\.tsx?$/.test(file) || file.includes(".test.")) return
				clearTimeout(timer)
				/* A failed run keeps the last tables and prints why; the next save tries again. */
				timer = setTimeout(() => {
					try {
						generate()
					} catch {}
				}, 300)
			})
		},
	}
}

/*
 * The app/docs build. The CSS pipeline lives in vite.shared.ts because vite.lib.config.ts
 * must produce byte-identical stylesheets — see the note on the layer wrapper there.
 */
export default defineConfig({
	/* Follows PORT so a run can take a free one; 5173 stays the default. */
	server: { port: Number(process.env.PORT) || 5173 },
	plugins: [react(), apiTables()],
	resolve: {
		/*
		 * Preview examples import the published subpaths (`themelia-ui/base/badge`), so the
		 * Code tab shows what a consumer writes. Mirrored in tsconfig.app.json.
		 */
		alias: [
			{ find: /^themelia-ui\/(forms|forms-rhf|theming|ui-provider)$/, replacement: resolve(import.meta.dirname, "src/lib/$1") },
			{ find: /^themelia-ui\/(.+)$/, replacement: resolve(import.meta.dirname, "src/components/$1") },
			{ find: "@", replacement: resolve(import.meta.dirname, "src") },
		],
	},
	css: sharedCss,
	build: {
		// The docs app must NOT share dist/ with the library build — both empty their outDir,
		// so whichever runs last would silently replace the other's output.
		outDir: "dist-docs",
		cssTarget: browserFloor,
	},
})
