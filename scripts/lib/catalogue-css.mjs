/*
 * Final minify pass over the catalogue (`dist/style.css`) only: it joins separately
 * minified assets, so seams hide mergeable rules. Family sheets, `core.css` and
 * `dist/css/**` stay as Vite wrote them — a merge valid in the join can be wrong in a
 * sheet holding one family. verify css-budget holds the per-recipe sizes.
 */
import { transform } from 'lightningcss'

/** The bare `@layer a, b, c;` statement that fixes the cascade order. */
const ORDER = /@layer\s+[a-z][a-z,\s]*;/i

/**
 * Minify a catalogue string, keeping its layer-order statement.
 *
 * No `targets`: the input is built output, and downlevelling would rewrite modern syntax.
 * lightningcss splits or drops the bare `@layer a, b;` statement, so it is re-prepended;
 * naming a layer twice is harmless.
 */
export function minifyCatalogueCss(css) {
  const text = typeof css === 'string' ? css : css.toString('utf8')
  const order = text.match(ORDER)?.[0]

  const { code: out } = transform({ filename: 'style.css', code: Buffer.from(text), minify: true })
  const minified = out.toString('utf8')

  if (!order) return minified
  return minified.startsWith(order) ? minified : `${order}${minified}`
}
