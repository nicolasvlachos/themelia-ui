import { resolve } from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { browserFloor, sharedCss } from "./vite.shared.ts"

/*
 * The app/docs build. The CSS pipeline lives in vite.shared.ts because vite.lib.config.ts
 * must produce byte-identical stylesheets — see the note on the layer wrapper there.
 */
export default defineConfig({
	/* Follows PORT so a run can take a free one; 5173 stays the default. */
	server: { port: Number(process.env.PORT) || 5173 },
	plugins: [react()],
	resolve: {
		alias: { "@": resolve(import.meta.dirname, "src") },
	},
	css: sharedCss,
	build: {
		// The docs app must NOT share dist/ with the library build — both empty their outDir,
		// so whichever ran last silently replaced the other's output.
		outDir: "dist-docs",
		cssTarget: browserFloor,
	},
})
