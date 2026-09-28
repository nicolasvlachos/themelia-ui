/*
 * The package's stylesheets read the theme; they hold no values of their own. The theme
 * (`src/styles/theme/`) is where the literals live, and the generated Tailwind bridge restates
 * them. Run through `npm run verify lint`.
 */

/* A radius is one of the two roles, the pill, a circle, or arithmetic on them. */
const RADIUS = /^(?:(?:var\(--(?:radius|radius-sm|radius-pill|_[a-z0-9-]+)(?:,[^)]*\))?\)|(?:calc|min|max|round)\(.*\)|0|50%|inherit)\s*)+$/

/** @type {import('stylelint').Config} */
export default {
  ignoreFiles: ['src/styles/theme/**', 'src/styles/tailwind.css', 'dist/**', 'examples/**'],
  rules: {
    /* A specificity fight the cascade layers exist to prevent. */
    'declaration-no-important': true,
    /* Every colour is a theme variable, mixed with color-mix() where it needs to be. */
    'color-no-hex': true,
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
    'declaration-property-value-allowed-list': {
      '/^border(?:-[a-z]+)*-radius$/': [RADIUS],
    },
    'declaration-property-value-disallowed-list': {
      /* Spacing is --padding, --padding-sm, --gap or --gap-sm, or arithmetic on them. */
      '/^(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z-]+)?$/': [/^[^v\n;]*(?:\b(?!1px)\d+px|\b[\d.]+rem)/],
      /* A hairline is --border-width; a mark or the focus outline is twice it. */
      '/^(?:border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?|outline(?:-width)?|box-shadow)$/': [/(?<![\d.])[12]px/],
    },
  },
  overrides: [
    {
      /* The reduced-motion reset outranks every module's animation, and `[hidden]` any `display`. */
      files: ['src/styles/animation.css', 'src/styles/base.css'],
      rules: { 'declaration-no-important': null },
    },
    {
      /* Type goes through Text and Heading; a module sets no type property of its own. */
      files: ['src/components/**/*.module.css'],
      rules: {
        'property-disallowed-list': ['font-size', 'font-weight', 'line-height', 'letter-spacing', 'font-family'],
      },
    },
    {
      /* Text and Heading own type, and the provider's roles read it. */
      files: ['src/components/base/typography/**'],
      rules: { 'property-disallowed-list': null },
    },
    {
      /* The docs site's own chrome, not package CSS. */
      files: ['src/preview/**'],
      rules: {
        'declaration-property-value-disallowed-list': null,
        'declaration-property-value-allowed-list': null,
      },
    },
  ],
}
