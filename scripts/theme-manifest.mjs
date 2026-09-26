/**
 * Theme manifest — the single source of truth for the light and dark palettes.
 *
 * GENERATED ONCE from the ported CSS, then hand-maintained. scripts/gen-theme.mjs emits
 * styles/themes/default.css and styles/tokens/states.css from this file.
 *
 * ── Why a manifest ──────────────────────────────────────────────────────────────────
 * Upstream, `:root, .light` and `.dark` each redeclared the full palette by hand. Adding
 * a token meant editing both, and forgetting the dark half meant it silently inherited
 * the light value — a bug that looks like a design decision. 20 of 58 dark declarations
 * were also exact duplicates of their light counterparts, restated for no reason.
 *
 * Here every token declares its dark behaviour exactly once, and must declare it:
 *
 *   { light: "var(--neutral-0)", dark: "var(--neutral-800)" }   re-points in dark
 *   { light: "var(--background)", inherits: true }               deliberately shared
 *
 * A token with neither `dark` nor `inherits` is a generator error, not a silent default,
 * so omission is impossible rather than merely discouraged.
 */

export const theme = {
	/*
	 * The kit's TWO radii, and nothing derives them. `--radius` rounds whatever holds other
	 * rounded things — a card, a dialog, a popover, a menu. `--radius-sm` rounds everything
	 * inside one or smaller than one — a control, a row, a chip, a badge, a tooltip.
	 *
	 * Both are plain values a theme sets, declared once at `:root`. `--radius-sm` was the
	 * outer radius less a menu's inset: it tied every input and button to a spacing token
	 * with "menu" in its name, turned them to 12px the moment `--radius` went to 1rem, and —
	 * being derived — had to be restated at every scope boundary, which is the stack of
	 * struck-through copies a DevTools panel showed for it.
	 *
	 * They are still complementary: a container that holds `--radius-sm` items insets them
	 * by the difference (1rem − 0.5rem = `--space-md`), so outer = inner + padding and a row
	 * sits concentric in its menu.
	 */
	"--background": {
		light: "var(--neutral-0)",
		dark: "var(--neutral-900)",
		doc: "Application canvas and default page background.",
	},
	"--foreground": {
		light: "var(--neutral-800)",
		dark: "var(--neutral-50)",
		doc: "Primary text and icon color on the application canvas.",
	},
	"--card": {
		light: "var(--neutral-0)",
		// Raised dark surfaces step lighter than the canvas. A darker card reads as a
		// hole in the page, while relying on a low-alpha border alone erases hierarchy.
		dark: "var(--neutral-850)",
		doc: "Card and framed content-surface background.",
	},
	"--card-foreground": {
		light: "var(--neutral-800)",
		dark: "var(--neutral-50)",
		doc: "Primary text and icons on card surfaces.",
	},
	"--popover": {
		light: "var(--background)",
		// Transient surfaces sit one perceptual step above cards in dark mode. Their shadow
		// then refines the edge instead of carrying the whole elevation cue by itself.
		dark: "var(--neutral-800)",
		doc: "Popover, menu, select, and transient-surface background.",
	},
	"--popover-foreground": {
		light: "var(--foreground)",
		dark: "var(--foreground)",
		doc: "Primary text and icons on popover surfaces.",
	},
	"--primary": {
		light: "var(--brand-600)",
		dark: "var(--brand-350)",
		doc: "Brand and primary-action color.",
	},
	"--primary-foreground": {
		light: "var(--neutral-50)",
		dark: "var(--brand-950)",
		doc: "Text and icons on solid primary fills.",
	},
	"--secondary": {
		light: "var(--neutral-100)",
		dark: "var(--neutral-850)",
		doc: "Neutral secondary-control and supporting-surface fill.",
	},
	"--secondary-foreground": {
		light: "var(--neutral-900)",
		dark: "var(--neutral-50)",
		doc: "Text and icons on secondary fills.",
	},
	"--muted": {
		light: "var(--neutral-100)",
		dark: "var(--neutral-875)",
		doc: "Subdued backgrounds for passive regions and skeletons.",
	},
	"--muted-foreground": {
		light: "var(--neutral-550)",
		dark: "var(--neutral-400)",
		doc: "Secondary text, metadata, and passive icons.",
	},
	"--accent": {
		light: "var(--neutral-100)",
		dark: "var(--neutral-750)",
		doc: "Hover, selected-row, and emphasized neutral fill.",
	},
	"--accent-foreground": {
		light: "var(--neutral-900)",
		dark: "var(--neutral-50)",
		doc: "Text and icons on accent fills.",
	},
	"--destructive": {
		light: "var(--danger-600)",
		dark: "var(--danger-400)",
		doc: "Destructive action, error, and invalid-state color.",
	},
	"--destructive-foreground": {
		light: "var(--neutral-25)",
		dark: "var(--danger-950)",
		doc: "Text and icons on solid destructive fills.",
	},
	"--border": {
		light: "var(--neutral-200)",
		dark: "var(--white-a10)",
		doc: "Default divider, outline, and surface-border color.",
	},
	"--input": {
		light: "var(--neutral-200)",
		dark: "var(--white-a15)",
		doc: "Default form-control border color.",
	},
	"--ring": {
		light: "var(--neutral-400)",
		dark: "var(--neutral-500)",
		doc: "Focus-visible ring and outline color.",
	},
	"--chart-1": {
		light: "var(--series-1)",
		dark: "var(--series-1-dark)",
		doc: "First categorical chart-series color; never a status color.",
	},
	"--chart-2": {
		light: "var(--series-2)",
		dark: "var(--series-2-dark)",
		doc: "Second categorical chart-series color; never a status color.",
	},
	"--chart-3": {
		light: "var(--series-3)",
		dark: "var(--series-3-dark)",
		doc: "Third categorical chart-series color; never a status color.",
	},
	"--chart-4": {
		light: "var(--series-4)",
		dark: "var(--series-4-dark)",
		doc: "Fourth categorical chart-series color; never a status color.",
	},
	"--chart-5": {
		light: "var(--series-5)",
		dark: "var(--series-5-dark)",
		doc: "Fifth categorical chart-series color; never a status color.",
	},
	"--radius": {
		rootOnly: true,
		light: "1rem",
		inherits: true,
		doc: "The container radius — cards, dialogs, popovers, menus.",
	},
	"--radius-sm": {
		rootOnly: true,
		light: "0.5rem",
		inherits: true,
		doc: "Everything inside a container or smaller than one — controls, rows, chips, badges, tooltips.",
	},
	/*
	 * Border WEIGHT, beside `--border` (its colour) and `--radius` (its corner). The
	 * three together are the whole edge treatment, which is why they sit next to each
	 * other: 194 rules wrote `1px` by hand, so a theme could restyle every edge in the
	 * kit except its thickness — the one property a denser or airier theme wants most.
	 */
	"--border-width": {
		rootOnly: true,
		light: "1px",
		inherits: true,
		doc: "Default hairline weight for dividers, outlines, and control borders.",
	},
	"--border-width-strong": {
		rootOnly: true,
		light: "2px",
		inherits: true,
		doc: "Emphasized rail weight for quote bars and active navigation indicators.",
	},
	/* A shape rather than a radius: fully round ends, whatever the height. */
	"--radius-pill": {
		rootOnly: true,
		light: "999px",
		inherits: true,
		doc: "Fully rounded ends for pills, switches, tracks, and status dots. True circles (avatars, radios) use 50%.",
	},
	"--sidebar": {
		light: "var(--neutral-150)",
		dark: "var(--neutral-950)",
		doc: "Sidebar shell background.",
	},
	"--sidebar-foreground": {
		light: "var(--neutral-800)",
		dark: "var(--neutral-50)",
		doc: "Primary sidebar text and icon color.",
	},
	/* Neutral in both modes: dark mirrors the light ink-on-paper pair rather than adding a hue. */
	"--sidebar-primary": {
		light: "var(--neutral-900)",
		dark: "var(--neutral-50)",
		doc: "Strong sidebar selection or primary action fill.",
	},
	"--sidebar-primary-foreground": {
		light: "var(--neutral-50)",
		dark: "var(--neutral-900)",
		doc: "Text and icons on sidebar primary fills.",
	},
	"--sidebar-accent": {
		light: "var(--neutral-75)",
		dark: "var(--neutral-800)",
		doc: "Sidebar hover and selected-row neutral fill.",
	},
	"--sidebar-accent-foreground": {
		light: "var(--neutral-900)",
		dark: "var(--neutral-50)",
		doc: "Text and icons on sidebar accent fills.",
	},
	"--sidebar-border": {
		light: "var(--neutral-200)",
		dark: "var(--white-a10)",
		doc: "Sidebar dividers and shell border.",
	},
	"--sidebar-ring": {
		light: "var(--neutral-400)",
		dark: "var(--neutral-500)",
		doc: "The sidebar's focus-ring seed, as --ring is the page's: sidebar surfaces mix it 70/30 toward --sidebar-foreground in light, read it unmixed in dark, and compose --focus-ring, --focus-ring-inset and --field-focus-ring from it.",
	},
	"--shadow-ink": {
		light: "var(--pure-black)",
		inherits: true,
		doc: "Ink every elevation tier tints with.",
	},
	"--shadow-2xs": {
		light: "0 1px 2px 0px color-mix(in oklab, var(--shadow-ink) 4%, transparent)",
		inherits: true,
		doc: "shadcn compatibility only; no kit surface reads it. Resting lift is --shadow-xs.",
	},
	"--shadow-xs": {
		light: "0 1px 2px 0px color-mix(in oklab, var(--shadow-ink) 6%, transparent), 0 1px 1px -1px color-mix(in oklab, var(--shadow-ink) 6%, transparent)",
		inherits: true,
		doc: "Resting lift: a framed card's bezel, a raised chip, a slider thumb, a floating sidebar.",
	},
	"--shadow-sm": {
		light: "0 1px 2px 0px color-mix(in oklab, var(--shadow-ink) 6%, transparent), 0 2px 4px -2px color-mix(in oklab, var(--shadow-ink) 10%, transparent)",
		inherits: true,
		doc: "Hover lift for every clickable card and tile, and controls over artwork.",
	},
	"--shadow": {
		light: "0 1px 3px 0px color-mix(in oklab, var(--shadow-ink) 8%, transparent), 0 4px 8px -4px color-mix(in oklab, var(--shadow-ink) 12%, transparent)",
		inherits: true,
		doc: "shadcn compatibility only; no kit surface reads it. Hover lift is --shadow-sm.",
	},
	"--shadow-md": {
		light: "0 2px 4px -1px color-mix(in oklab, var(--shadow-ink) 8%, transparent), 0 8px 16px -8px color-mix(in oklab, var(--shadow-ink) 16%, transparent)",
		inherits: true,
		doc: "The lift inside --popover-shadow; anchored popups read that, with its hairline ring.",
	},
	"--shadow-lg": {
		light: "0 4px 8px -2px color-mix(in oklab, var(--shadow-ink) 10%, transparent), 0 12px 24px -12px color-mix(in oklab, var(--shadow-ink) 18%, transparent)",
		inherits: true,
		doc: "Free-floating transient surfaces: toast, drag ghost, floating batch bar, submenu.",
	},
	"--shadow-xl": {
		light: "0 8px 16px -4px color-mix(in oklab, var(--shadow-ink) 12%, transparent), 0 20px 40px -20px color-mix(in oklab, var(--shadow-ink) 22%, transparent)",
		inherits: true,
		doc: "Modals and command palettes.",
	},
	"--shadow-2xl": {
		light: "0 16px 32px -8px color-mix(in oklab, var(--shadow-ink) 18%, transparent), 0 32px 64px -28px color-mix(in oklab, var(--shadow-ink) 28%, transparent)",
		inherits: true,
		doc: "shadcn compatibility only; no kit surface reads it. Modals and palettes use --shadow-xl.",
	},
}

export const states = {
	"--success": {
		light: "var(--success-600)",
		dark: "var(--success-400)",
		doc: "Semantic success fill, border, and foreground accent.",
	},
	"--success-foreground": {
		light: "var(--neutral-50)",
		dark: "var(--success-950)",
		doc: "Text and icons on solid success fills.",
	},
	"--info": {
		light: "var(--info-600)",
		dark: "var(--info-400)",
		doc: "Semantic informational fill, border, and foreground accent.",
	},
	"--info-foreground": {
		light: "var(--neutral-25)",
		dark: "var(--info-950)",
		doc: "Text and icons on solid informational fills.",
	},
	"--link-color": {
		light: "var(--link-600)",
		dark: "var(--link-400)",
		doc: "Inline links and link-like copyable values.",
	},
	"--primary-accent": {
		light: "var(--brand-600)",
		dark: "var(--brand-300)",
		doc: "Brand color drawn AS foreground — text, icons, spinners, active marks — on the app surface or a primary tint. Matches --primary here; in dark it steps one lighter than --primary, which is tuned as a fill for --primary-foreground ink. Read this, not --primary, wherever the brand is ink. Not shadcn's --accent, which is a muted hover surface.",
	},
	"--warning": {
		light: "var(--warning-500)",
		dark: "var(--warning-300)",
		doc: "Semantic warning fill, border, and foreground accent.",
	},
	"--warning-foreground": {
		light: "var(--warning-900)",
		dark: "var(--warning-950)",
		doc: "Text and icons on solid warning fills.",
	},
	"--warning-accent": {
		light: "var(--warning-700)",
		dark: "var(--warning-300)",
		doc: "Warning colour drawn AS foreground — icons and marks — on a tinted warning surface. Darkens here and brightens in dark, where --warning stays a light fill so solid warning chips keep the amber.",
	},
	/*
	 * Destructive as TEXT on a destructive tint. The hue alone measured 4.4:1 on its own 10%
	 * wash in dark; moved 15% toward the foreground it clears 4.5 in both themes. Badge had
	 * this recipe privately and an analytics delta chip beside it did not.
	 */
	"--destructive-accent": {
		light: "color-mix(in oklab, var(--destructive) 85%, var(--foreground))",
		inherits: true,
		doc: "Destructive colour drawn AS foreground — text and marks — on a tinted destructive surface.",
	},
	"--inverse-background": {
		light: "var(--neutral-800)",
		inherits: true,
		doc: "Base background for explicit dark or artwork-backed surfaces.",
	},
	"--inverse-foreground": {
		light: "var(--neutral-50)",
		inherits: true,
		doc: "Primary text and icons on inverse backgrounds.",
	},
	"--inverse-muted": {
		light: "color-mix(in oklab, var(--neutral-50) 74%, transparent)",
		inherits: true,
		doc: "Secondary text on inverse backgrounds.",
	},
	"--inverse-subtle": {
		light: "color-mix(in oklab, var(--neutral-50) 58%, transparent)",
		inherits: true,
		doc: "Tertiary text and icons on inverse backgrounds.",
	},
	"--inverse-disabled": {
		light: "color-mix(in oklab, var(--neutral-50) 42%, transparent)",
		inherits: true,
		doc: "Disabled content on inverse backgrounds.",
	},
	"--inverse-surface": {
		light: "color-mix(in oklab, var(--neutral-50) 12%, transparent)",
		inherits: true,
		doc: "Subtle nested fill on inverse backgrounds.",
	},
	"--inverse-surface-strong": {
		light: "color-mix(in oklab, var(--neutral-50) 22%, transparent)",
		inherits: true,
		doc: "Emphasized nested fill on inverse backgrounds.",
	},
	"--inverse-border": {
		light: "color-mix(in oklab, var(--neutral-50) 18%, transparent)",
		inherits: true,
		doc: "Dividers and outlines on inverse backgrounds.",
	},
	"--inverse-decoration": {
		light: "color-mix(in oklab, var(--neutral-50) 6%, transparent)",
		inherits: true,
		doc: "Non-semantic decorative wash on inverse backgrounds.",
	},
}
