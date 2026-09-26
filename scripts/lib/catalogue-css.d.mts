/**
 * Types for the catalogue optimiser, so `vite.lib.config.ts` can import it under `tsc -b`.
 *
 * The implementation is `.mjs` because every other build script in `scripts/` is, and this
 * one is called from a Node script as well as from the Vite config.
 */
export declare function minifyCatalogueCss(css: string | Buffer): string
