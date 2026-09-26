/** Runs in the browser: real CSS colors and ancestor backgrounds determine text contrast. */
export function auditTextContrast(options: {
	rootSelector?: string
	/** Opt in only for a known decorative background painted behind this node's text. */
	backgroundPseudoSelector?: string
} = {}): string[] {
	const out: string[] = []
	const seen = new Set<string>()

	/** sRGB relative luminance, per WCAG. */
	const luminance = (rgb: number[]) => {
		const [r, g, b] = rgb.map((channel) => {
			const c = channel / 255
			return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
		})
		return 0.2126 * r + 0.7152 * g + 0.0722 * b
	}

	/*
	 * Colours are read back through a canvas, so oklch and color-mix resolve exactly as
	 * the browser paints them.
	 */
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d", { willReadFrequently: true })!

	/** Resolves any CSS colour to [r, g, b, a] with a REAL alpha. */
	const toRgba = (color: string): number[] => {
		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = "rgba(0,0,0,0)"
		ctx.fillStyle = color
		ctx.fillRect(0, 0, 1, 1)
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
		// ImageData exposes straight RGB, even when the backing canvas uses premultiplied
		// storage. Dividing these channels by alpha again brightens translucent colors.
		const alpha = a / 255
		if (alpha === 0) return [0, 0, 0, 0]
		return [r, g, b, alpha]
	}

	const over = (top: number[], bottom: number[]): number[] => {
		const a = top[3]
		return [
			top[0] * a + bottom[0] * (1 - a),
			top[1] * a + bottom[1] * (1 - a),
			top[2] * a + bottom[2] * (1 - a),
			1,
		]
	}

	/** The composited background behind this element, alpha resolved all the way down. */
	const backdrop = (el: Element): number[] => {
		const layers: number[][] = []
		let node: Element | null = el
		while (node) {
			if (options.backgroundPseudoSelector && node.matches(options.backgroundPseudoSelector)) {
				const pseudo = getComputedStyle(node, "::before")
				if (pseudo.content !== "none" && pseudo.display !== "none") {
					const band = toRgba(pseudo.backgroundColor)
					if (band[3] > 0) {
						layers.push(band)
						if (band[3] >= 0.999) break
					}
				}
			}
			const rgba = toRgba(getComputedStyle(node).backgroundColor)
			if (rgba[3] > 0) {
				layers.push(rgba)
				if (rgba[3] >= 0.999) break
			}
			node = node.parentElement
		}
		/* Nothing opaque found: the page's own canvas is the floor. */
		let result = [255, 255, 255, 1]
		const root = toRgba(getComputedStyle(document.body).backgroundColor)
		if (root[3] >= 0.999) result = root
		/* Composite from the bottom up. */
		for (let i = layers.length - 1; i >= 0; i--) result = over(layers[i], result)
		return result
	}

	const main = document.querySelector(options.rootSelector ?? "main")
	if (!main) return out

	for (const el of Array.from(main.querySelectorAll<HTMLElement>("*"))) {
		/*
		 * Only elements painting their own text, a single glyph included: a numeral on a
		 * step's dot or a count in a badge sits inside a container that set a colour for it.
		 */
		const ownText = Array.from(el.childNodes).some(
			(node) => node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim().length > 0,
		)
		if (!ownText) continue

		const rect = el.getBoundingClientRect()
		if (rect.width === 0 || rect.height === 0) continue

		const cs = getComputedStyle(el)
		if (cs.visibility === "hidden" || Number.parseFloat(cs.opacity) < 0.3) continue

		const fgRgba = toRgba(cs.color)
		if (fgRgba[3] === 0) continue
		const bg = backdrop(el)
		/* Translucent TEXT is composited over its own backdrop too. */
		const fg = over(fgRgba, bg)

		const l1 = luminance(fg)
		const l2 = luminance(bg)
		const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

		/*
		 * WCAG AA: 4.5:1 for body text, 3:1 for large text (>=24px, or >=18.66px
		 * bold). Anything genuinely decorative is caught by the opacity gate above.
		 */
		const size = Number.parseFloat(cs.fontSize)
		const bold = Number.parseInt(cs.fontWeight, 10) >= 700
		const required = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5

		if (ratio < required) {
			const name =
				(el.className.toString().match(/([a-z-]+)--component/) || [])[1] ||
				(el.className.toString().match(/[a-z0-9]__([a-zA-Z0-9]+)___/) || [])[1] ||
				el.tagName.toLowerCase()
			const key = `${name}|${cs.color}`
			if (seen.has(key)) continue
			seen.add(key)
			out.push(
				`${name}: ${ratio.toFixed(2)}:1 (needs ${required}) ${cs.color} on rgb(${bg.slice(0, 3).map(Math.round).join(",")}) — "${(el.textContent || "").trim().slice(0, 24)}"`,
			)
		}
	}
	return out
}
