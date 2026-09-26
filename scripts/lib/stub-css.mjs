/*
 * Loads every stylesheet import as an empty module, so the built entries run in plain Node.
 * Each entry imports its own CSS, which a bundler or framework resolves and Node cannot.
 * Import it first (`await import`), or preload it: `node --import ./scripts/lib/stub-css.mjs`.
 * `loaded` counts the stylesheets that resolved to an emitted file on the way.
 */
import { registerHooks } from 'node:module'

export const loaded = new Set()

registerHooks({
  load(url, context, nextLoad) {
    if (!url.endsWith('.css')) return nextLoad(url, context)
    loaded.add(url)
    return { format: 'module', source: '', shortCircuit: true }
  },
})
