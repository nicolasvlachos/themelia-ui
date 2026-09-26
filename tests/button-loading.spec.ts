/** A LoaderButton's loading announcement leaves its ButtonGroup's corners, seams and geometry identical to a plain group. */
import { expect, test, type Locator } from "@playwright/test"
import { DEV_ORIGIN, url } from "./routes"

/* Mounts components from source at runtime, which only the dev server serves. */
test.use({ baseURL: DEV_ORIGIN })

async function geometry(group: Locator, orientation: "horizontal" | "vertical") {
	return group.evaluate((element, axis) => {
		const segments = [...element.children].filter(child => child.getAttribute("data-slot") !== "loader-button-status")
		return segments.map((segment, index) => {
			const css = getComputedStyle(segment)
			const box = segment.getBoundingClientRect()
			const previous = segments[index - 1]?.getBoundingClientRect()
			return {
				width: box.width, height: box.height,
				radii: [css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius],
				marginInlineStart: css.marginInlineStart, marginTop: css.marginTop,
				gap: previous ? axis === "horizontal" ? box.left - previous.right : box.top - previous.bottom : 0,
			}
		})
	}, orientation)
}

function expectMatchingGeometry(actual: Awaited<ReturnType<typeof geometry>>, reference: Awaited<ReturnType<typeof geometry>>) {
	expect(actual).toHaveLength(reference.length)
	for (const [index, segment] of actual.entries()) {
		const expected = reference[index]!
		expect(segment.radii).toEqual(expected.radii)
		expect(segment.marginInlineStart).toBe(expected.marginInlineStart)
		expect(segment.marginTop).toBe(expected.marginTop)
		// Firefox serializes equal boxes at different offsets with ~0.00002px float
		// differences. Keep CSS contracts exact and allow less than 0.0005px in boxes.
		for (const property of ["width", "height", "gap"] as const) {
			expect(segment[property], `segment ${index} ${property}`).toBeCloseTo(expected[property], 3)
		}
	}
}

for (const orientation of ["horizontal", "vertical"] as const) {
	test(`loading announcements preserve ${orientation} group corners and seams`, async ({ page }) => {
		await page.goto(url("/button"))
		await page.getByRole("heading", { name: "Button", exact: true }).waitFor()
		await page.addStyleTag({ content: "* { transition: none !important; animation: none !important; }" })
		/* Mount the groups as a consumer would, importing source and React through the Vite dev server. */
		await page.evaluate(async (axis) => {
			const reactPath = "/node_modules/.vite/deps/react.js"
			const domPath = "/node_modules/.vite/deps/react-dom_client.js"
			const buttonsPath = "/src/components/base/buttons/index.ts"
			const [{ default: React }, { default: ReactDOM }, { Button, LoaderButton, ButtonGroup, ButtonGroupSeparator, ButtonGroupText }] = await Promise.all([
				import(reactPath), import(domPath), import(buttonsPath),
			])
			const h = React.createElement
			const host = document.createElement("div")
			host.id = "loading-button-consumer"
			host.style.cssText = "position:fixed;inset:0;z-index:9999;background:var(--background);display:flex;align-items:flex-start;gap:24px;padding:24px"
			document.body.append(host)
			const group = (name: string, async: boolean, single = false) => {
				const Control = async ? LoaderButton : Button
				const button = (label: string) => h(Control, { key: label, buttonStyle: "outline", onClick: async ? () => new Promise(resolve => setTimeout(resolve, 700)) : undefined }, label)
				return h(ButtonGroup, { key: name, "aria-label": name, orientation: axis },
					...(single ? [button("Save")] : [button("First"), h(ButtonGroupSeparator, { key: "separator", orientation: axis }), button("Middle"), h(ButtonGroupText, { key: "text" }, "of"), button("Last")]),
				)
			}
			ReactDOM.createRoot(host).render(h(React.Fragment, null,
				group("reference", false), group("async", true), group("single reference", false, true), group("single async", true, true),
			))
		}, orientation)
		const host = page.locator("#loading-button-consumer")
		const reference = host.getByRole("group", { name: "reference", exact: true })
		const asyncGroup = host.getByRole("group", { name: "async", exact: true })
		await expect(asyncGroup).toBeVisible()
		expectMatchingGeometry(await geometry(asyncGroup, orientation), await geometry(reference, orientation))
		expectMatchingGeometry(await geometry(host.getByRole("group", { name: "single async", exact: true }), orientation), await geometry(host.getByRole("group", { name: "single reference", exact: true }), orientation))
		const last = asyncGroup.getByRole("button", { name: "Last", exact: true })
		await last.click()
		await expect(last).toHaveAttribute("aria-busy", "true")
		await expect(last).toHaveAccessibleName("Last")
		const announcement = asyncGroup.getByRole("status").filter({ hasText: "Working…" })
		await expect(announcement).toHaveCount(1)
		/* Outside the busy subtree, which assistive technology may hold back until it settles. */
		expect(await announcement.evaluate(element => element.closest('[aria-busy="true"]') === null)).toBe(true)
		expectMatchingGeometry(await geometry(asyncGroup, orientation), await geometry(reference, orientation))
		await expect(last).not.toHaveAttribute("aria-busy", "true")
	})
}
