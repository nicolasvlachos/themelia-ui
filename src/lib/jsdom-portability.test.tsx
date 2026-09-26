import { render, renderHook, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Carousel, CarouselSlide } from "@/components/base/carousel"
import { Copyable } from "@/components/base/copyable"
import { OverflowTabBar } from "@/components/base/navigation"
import { QRCode } from "@/components/base/qr-code"
import { SectionNav } from "@/components/layout/navigation"
import { FileUpload } from "@/components/base/upload"
import { useIsMobile } from "@/hooks/use-mobile"

/**
 * Nothing throws on mount outside a browser. jsdom lacks `matchMedia`, `ResizeObserver`,
 * `IntersectionObserver` and `navigator.clipboard` (guarded via src/lib/observers.ts), so
 * an unguarded use would crash consumers' unit tests. Mount-only: rendering is tested elsewhere.
 */
describe("jsdom portability", () => {
	it("Carousel mounts without ResizeObserver", () => {
		expect(() =>
			render(
				<Carousel>
					<CarouselSlide>one</CarouselSlide>
					<CarouselSlide>two</CarouselSlide>
				</Carousel>,
			),
		).not.toThrow()
	})

	it("OverflowTabBar mounts without ResizeObserver", () => {
		expect(() =>
			render(
				<OverflowTabBar
					items={[
						{ id: "a", label: "A" },
						{ id: "b", label: "B" },
					]}
					value="a"
					onValueChange={() => {}}
				/>,
			),
		).not.toThrow()
	})

	it("SectionNav mounts without IntersectionObserver", () => {
		expect(() =>
			render(<SectionNav items={[{ id: "a", label: "A" }]} />),
		).not.toThrow()
	})

	it("QRCode mounts without matchMedia", () => {
		expect(() => render(<QRCode value="https://example.com" />)).not.toThrow()
	})

	it("useIsMobile subscribes without matchMedia", () => {
		expect(() => renderHook(() => useIsMobile())).not.toThrow()
	})

	it("FileUpload mounts with a file", () => {
		/* Guards `useObjectUrls` against reintroducing a browser-only call. */
		const file = new File(["x"], "a.png", { type: "image/png" })
		expect(() => render(<FileUpload value={[file]} onValueChange={() => {}} />)).not.toThrow()
	})

	it("Copyable survives a copy with no clipboard", () => {
		/* No `navigator.clipboard` in jsdom: the failure goes to `onError`, not a throw. */
		const onError = vi.fn()
		render(<Copyable value="abc" onError={onError} silent />)
		expect(() => screen.getAllByRole("button")[0]!.click()).not.toThrow()
	})
})
