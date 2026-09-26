/**
 * QRCode — a scannable SVG symbol in the theme's colours. Encoding is async (in an effect),
 * so a placeholder renders first.
 */
import { formatHex, parse } from "culori"
import { resolveStrings } from "@/lib/strings"

import { defaultQRCodeStrings, type QRCodeStrings } from "./qr-code.strings"
import QR from "qrcode"
import * as React from "react"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ComponentProps } from "react"

import { cx } from "@/lib/cx"
import { useUIConfig } from "@/lib/ui-provider"

import styles from "./qr-code.module.css"

/**
 * Error correction (the encoder's `errorCorrectionLevel`): how much of the symbol can be
 * obscured and still decode — L ≈ 7%, M ≈ 15%, Q ≈ 25%, H ≈ 30%. Higher needs a larger grid.
 */
export type QRRobustness = "L" | "M" | "Q" | "H"

export interface QRCodeProps extends Omit<ComponentProps<"div">, "children"> {
	/** What the code encodes — a URL, a payment string, a token. */
	value: string
	/** Overrides the dark modules. Defaults to the inverse background, dark in both themes. */
	foreground?: string
	/** Overrides the light modules. Defaults to the inverse foreground, light in both themes. */
	background?: string
	robustness?: QRRobustness
	/** Shown while encoding. Defaults to this component's own `generating` string. */
	placeholder?: string
	/** Overrides this code's own copy — the two placeholder states and its name. */
	strings?: Partial<QRCodeStrings>
	/** Shown when `value` is empty. Defaults to rendering nothing (it is not a loading state). */
	emptyState?: React.ReactNode
	/** Announced in place of the symbol, which is meaningless to a screen reader. */
	label?: string
}

/** Resolves a CSS colour (e.g. a computed `oklch(...)` token) to hex, the only form the encoder takes. */
function toHex(color: string, fallback: string): string {
	const trimmed = color.trim()
	if (!trimmed) return fallback
	if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) return trimmed

	try {
		const parsed = parse(trimmed)
		return parsed ? (formatHex(parsed) ?? fallback) : fallback
	} catch {
		return fallback
	}
}

export const QRCode = forwardRef<HTMLDivElement, QRCodeProps>(function QRCode(
	{
		value,
		foreground,
		background,
		robustness = "M",
		placeholder,
		strings,
		emptyState = null,
		label,
		className,
		...props
	},
	ref,
) {
	const copy = resolveStrings(defaultQRCodeStrings, strings)
	const { colorScheme } = useUIConfig()
	// Colours are read from this element, so a scope around it wins over <html>.
	const rootRef = useRef<HTMLDivElement>(null)
	useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)
	const [svg, setSvg] = useState<string | null>(null)
	const [failed, setFailed] = useState(false)
	const isEmpty = String(value ?? "").trim() === ""

	// No reset on empty: the render checks `isEmpty` before reading these.

	// Bumped on a theme change to re-encode: the colours are baked into the SVG.
	const [themeEpoch, setThemeEpoch] = useState(0)

	useEffect(() => {
		// A class or attribute toggled on <html> outside the provider (colorScheme covers the rest).
		const observer = new MutationObserver(() => setThemeEpoch((epoch) => epoch + 1))
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme"],
		})

		// `system` follows the OS with no attribute change. Guarded: jsdom has no matchMedia.
		const media = typeof window.matchMedia === "function"
			? window.matchMedia("(prefers-color-scheme: dark)")
			: null
		const onSchemeChange = () => setThemeEpoch((epoch) => epoch + 1)
		media?.addEventListener("change", onSchemeChange)

		return () => {
			observer.disconnect()
			media?.removeEventListener("change", onSchemeChange)
		}
	}, [])

	useEffect(() => {
		const text = String(value ?? "").trim()
		if (!text) return

		// The effect may resolve after the value changed again; only the last one wins.
		let current = true

		const encode = async () => {
			try {
				// Resolved theme colours, read at encode time (the theme may apply after load).
				// Falls back to <html> when the root is not attached (a null ref under a test renderer).
				const computed = getComputedStyle(rootRef.current ?? document.documentElement)
				const dark = toHex(foreground ?? computed.getPropertyValue("--qr-foreground"), "#000000")
				const light = toHex(background ?? computed.getPropertyValue("--qr-background"), "#ffffff")

				const generated = await QR.toString(text, {
					type: "svg",
					color: { dark, light },
					errorCorrectionLevel: robustness,
					// The quiet zone is drawn in CSS, so the encoder should not add its own.
					margin: 0,
				})

				if (!current) return
				setSvg(generated)
				setFailed(false)
			} catch {
				// Oversized payload, or data the chosen correction level cannot carry.
				if (!current) return
				setSvg(null)
				setFailed(true)
			}
		}

		void encode()
		return () => {
			current = false
		}
	}, [value, foreground, background, robustness, themeEpoch, colorScheme])

	// Nothing to encode is not a loading state.
	if (isEmpty && !emptyState) return null

	return (
		<div ref={rootRef} className={cx("qr-code--component", styles.root, className)} {...props}>
			{isEmpty ? (
				<div className={styles.placeholder}>{emptyState}</div>
			) : svg ? (
				<div
					// The symbol carries no meaning to a screen reader; the label does.
					role="img"
					aria-label={label ?? copy.label(value)}
					className={styles.symbol}
					dangerouslySetInnerHTML={{ __html: svg }}
				/>
			) : (
				<div className={styles.placeholder}>
					{failed ? copy.failed : (placeholder ?? copy.generating)}
				</div>
			)}
		</div>
	)
})
