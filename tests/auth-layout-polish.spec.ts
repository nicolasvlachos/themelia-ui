/** Auth shells centre, split, stack and scroll correctly in a plain consumer container, and the preview's sign-in flow recovers from errors. */
import { expect, test, type Page } from "@playwright/test"

import { DEV_ORIGIN, url } from "./routes"

/* Mounts components from source at runtime, which only the dev server serves. */
test.use({ baseURL: DEV_ORIGIN })

type AuthFixture = {
	width: number
	variant?: "card" | "bare" | "split"
	standalone?: boolean
	panel?: boolean
	position?: "start" | "end"
	stacked?: boolean
	tall?: boolean
	align?: "center" | "start"
	nestedShell?: boolean
}

// Mount the public components in a plain consumer container: the documentation
// page's own containment must not make a broken auth container look responsive.
async function mountAuth(page: Page, fixture: AuthFixture) {
	await page.goto(url("/auth-shell"))
	await page.getByRole("heading", { name: "Auth shells", exact: true }).waitFor()
	await page.addStyleTag({ content: "* { transition: none !important; animation: none !important; }" })
	await page.evaluate(async (options) => {
		const reactPath = "/node_modules/.vite/deps/react.js"
		const domPath = "/node_modules/.vite/deps/react-dom_client.js"
		const authPath = "/src/components/layout/auth/index.ts"
		const [{ default: React }, { default: ReactDOM }, { AuthShell, AuthCard, AuthSplitPanel }] = await Promise.all([
			import(reactPath), import(domPath), import(authPath),
		])
		const h = React.createElement
		const host = document.createElement("div")
		host.id = "auth-consumer"
		host.style.cssText = `position:fixed;inset:0;z-index:9999;overflow:auto;background:var(--background);width:${options.width}px;`
		document.body.append(host)
		const fields = h("div", { style: { minHeight: options.tall ? "1100px" : "80px", display: "flex", flexDirection: "column", justifyContent: "space-between" } },
			h("label", null, "Email", h("input", { type: "email" })),
			h("button", { type: "button" }, "Continue"),
		)
		const panel = options.panel === false ? undefined : h("p", null, "Your workspace, together.")
		const form = options.nestedShell
			? h(AuthShell, { title: "Sign in", variant: "bare", contentRender: h("div"), style: { minHeight: "320px" } }, fields)
			: h(AuthCard, { title: "Sign in" }, fields)
		ReactDOM.createRoot(host).render(options.standalone
			? h(AuthSplitPanel, { form, panel, panelPosition: options.position, panelMobile: options.stacked ? "stacked" : "hidden" })
			: h(AuthShell, {
				title: "Sign in", variant: options.variant ?? "card", align: options.align,
				splitPanel: panel, splitSide: options.position, splitMobile: options.stacked ? "stacked" : "hidden",
				policyLinks: [{ label: "Privacy", href: "#privacy" }],
			}, fields))
	}, fixture)
	await page.locator("#auth-consumer [data-slot='auth-card']").waitFor({ state: "attached" })
	return page.locator("#auth-consumer")
}

for (const variant of ["card", "bare", "split"] as const) {
	test(`${variant} centers a short form in the viewport`, async ({ page }) => {
		await page.setViewportSize({ width: 1200, height: 900 })
		const host = await mountAuth(page, { width: 1100, variant })
		const geometry = await host.locator("[data-align]").evaluate((shell) => {
			const surface = shell.firstElementChild!.getBoundingClientRect()
			const frame = shell.getBoundingClientRect()
			return { center: (surface.top + surface.bottom) / 2, frameCenter: (frame.top + frame.bottom) / 2, height: frame.height }
		})
		expect(geometry.height).toBeGreaterThanOrEqual(900)
		expect(Math.abs(geometry.center - geometry.frameCenter)).toBeLessThan(2)
	})
}

test("tall auth content starts within the scroll origin and its final links remain reachable", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 640 })
	const host = await mountAuth(page, { width: 390, tall: true })
	const title = host.getByRole("heading", { name: "Sign in" })
	expect((await title.boundingBox())!.y).toBeGreaterThanOrEqual(0)
	await host.getByRole("link", { name: "Privacy" }).scrollIntoViewIfNeeded()
	await expect(host.getByRole("link", { name: "Privacy" })).toBeInViewport()
	await host.getByRole("button", { name: "Continue" }).click()
	const bounds = await host.evaluate((element) => ({ scroll: element.scrollWidth, width: element.clientWidth }))
	expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1)
})

for (const standalone of [false, true]) {
	for (const position of ["start", "end"] as const) {
		test(`${standalone ? "AuthSplitPanel" : "AuthShell split"} uses its own width with the panel at ${position}`, async ({ page }) => {
			await page.setViewportSize({ width: 1400, height: 900 })
			const host = await mountAuth(page, { width: 1100, variant: "split", standalone, position })
			const panel = host.locator("aside")
			await expect(panel).toBeVisible()
			const cardBox = (await host.locator("[data-slot='auth-card']").boundingBox())!
			const panelBox = (await panel.boundingBox())!
			expect(Math.min(cardBox.y + cardBox.height, panelBox.y + panelBox.height)
				- Math.max(cardBox.y, panelBox.y), "both regions must occupy the same row").toBeGreaterThan(0)
			if (position === "start") expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(cardBox.x)
			else expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(panelBox.x)

			await host.evaluate((element) => { element.style.width = "640px" })
			await expect(panel).toBeHidden()
			const narrow = (await host.locator("[data-slot='auth-card']").boundingBox())!
			/* Centred in the 640px host. */
			expect(Math.abs(narrow.x + narrow.width / 2 - 320)).toBeLessThan(2)
		})
	}
}

test("standalone split without a panel gives the form the full width", async ({ page }) => {
	await page.setViewportSize({ width: 1400, height: 900 })
	const host = await mountAuth(page, { width: 1100, standalone: true, panel: false, position: "start" })
	const card = (await host.locator("[data-slot='auth-card']").boundingBox())!
	/* Centred in the 1100px host. */
	expect(Math.abs(card.x + card.width / 2 - 550)).toBeLessThan(2)
})

test("AuthSplitPanel keeps a nested bare AuthShell usable at wide and narrow widths", async ({ page }) => {
	await page.setViewportSize({ width: 1400, height: 900 })
	const host = await mountAuth(page, { width: 1100, standalone: true, nestedShell: true })
	const form = host.locator("[data-slot='auth-shell']")
	const card = host.locator("[data-slot='auth-card']")
	expect((await card.boundingBox())!.width).toBeGreaterThan(300)
	await host.evaluate((element) => { element.style.width = "390px" })
	await expect(host.locator("aside")).toBeHidden()
	expect((await card.boundingBox())!.width).toBeGreaterThan(250)
	const dimensions = await form.evaluate((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }))
	expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
})

test("standalone split fills a parent with a definite height", async ({ page }) => {
	await page.setViewportSize({ width: 1400, height: 900 })
	const host = await mountAuth(page, { width: 1100, standalone: true })
	const splitBox = (await host.locator("[data-slot='auth-split-panel']").boundingBox())!
	const panelBox = (await host.locator("aside").boundingBox())!
	expect(splitBox.height).toBeGreaterThanOrEqual(900)
	expect(panelBox.height).toBeGreaterThanOrEqual(900)
})

test("stacked mobile panels follow the form and preserve scroll access", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 640 })
	const host = await mountAuth(page, { width: 390, standalone: true, stacked: true, position: "start" })
	const panel = host.locator("aside")
	await expect(panel).toBeVisible()
	const cardBox = (await host.locator("[data-slot='auth-card']").boundingBox())!
	const panelBox = (await panel.boundingBox())!
	expect(panelBox.y).toBeGreaterThanOrEqual(cardBox.y + cardBox.height)
	await panel.scrollIntoViewIfNeeded()
	await expect(panel).toBeInViewport()
})

test("auth preview validates, submits, reports an error, and recovers without losing the address", async ({ page }) => {
	await page.goto(url("/auth-shell"))
	const example = page.locator("#auth-shell")
	await example.getByRole("button", { name: "Sign in", exact: true }).click()
	const email = example.getByRole("textbox", { name: "Email", exact: true })
	await expect(email).toHaveAttribute("aria-invalid", "true")
	await expect(email).toBeFocused()
	await email.fill("jane@example.com")
	// getByLabel includes the label's aria-hidden required mark; its accessible name does not.
	const password = example.getByLabel(/^Password/)
	await expect(password).toHaveAccessibleName("Password")
	await password.fill("demo-password")
	const failureControl = example.getByRole("checkbox", { name: "Simulate a connection error" })
	// The native input is visually hidden; the label is the pointer target.
	await example.getByText("Simulate a connection error", { exact: true }).click()
	await expect(failureControl).toBeChecked()
	await example.getByRole("button", { name: "Sign in", exact: true }).click()
	await expect(example.locator("form")).toHaveAttribute("aria-busy", "true")
	await expect(example.locator("button[type='submit']")).toBeDisabled()
	await expect(example.locator("button[type='submit']")).toHaveAccessibleName("Sign in")
	await expect(example.getByRole("alert")).toContainText("connection")
	await expect(email).toHaveValue("jane@example.com")
	await failureControl.focus()
	await failureControl.press("Space")
	await expect(failureControl).not.toBeChecked()
	await example.getByRole("button", { name: "Sign in", exact: true }).click()
	await expect(example.getByRole("status")).toContainText("Signed in")
	await example.getByRole("button", { name: "Try again" }).click()
	await expect(email).toBeFocused()
	await expect(email).toHaveValue("jane@example.com")
})

test("every auth variation and footer fits a phone without a clipped preview", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/auth-shell"))
	for (const id of ["auth-shell", "auth-bare", "auth-split", "auth-composed"]) {
		const example = page.locator(`#${id}`)
		await expect(example).toBeVisible()
		const frame = example.locator("[data-auth-preview]")
		const dimensions = await frame.evaluate((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth, height: element.clientHeight, scrollHeight: element.scrollHeight }))
		expect(dimensions.scrollWidth, id).toBeLessThanOrEqual(dimensions.width + 1)
		expect(dimensions.scrollHeight, id).toBeLessThanOrEqual(dimensions.height + 1)
	}
})

test("expanded auth preview shows two columns and restores focus when dismissed", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1000 })
	await page.goto(url("/auth-shell"))
	const trigger = page.getByRole("button", { name: "Expand split preview", exact: true })
	await expect(trigger).toBeVisible()
	await trigger.click()
	const dialog = page.getByRole("dialog", { name: "Split auth preview", exact: true })
	await expect(dialog).toBeVisible()
	await expect(dialog.getByRole("main")).toHaveCount(0)
	const panel = (await dialog.locator("aside").boundingBox())!
	const card = (await dialog.locator("[data-slot='auth-card']").boundingBox())!
	expect(panel.x + panel.width).toBeLessThanOrEqual(card.x)
	expect(Math.min(panel.y + panel.height, card.y + card.height) - Math.max(panel.y, card.y)).toBeGreaterThan(0)
	await page.keyboard.press("Escape")
	await expect(dialog).toBeHidden()
	await expect(trigger).toBeFocused()
})

test("expanded auth preview fits a phone and keeps the footer reachable", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/auth-shell"))
	const trigger = page.getByRole("button", { name: "Expand split preview", exact: true })
	await expect(trigger).toBeVisible()
	await trigger.click()
	const dialog = page.getByRole("dialog", { name: "Split auth preview", exact: true })
	await expect(dialog).toBeVisible()
	const box = (await dialog.boundingBox())!
	expect(box.x).toBeGreaterThanOrEqual(0)
	expect(box.x + box.width).toBeLessThanOrEqual(390)
	const dimensions = await dialog.locator("[data-slot='auth-shell']").evaluate((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }))
	expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
	const privacy = dialog.getByRole("link", { name: "Privacy", exact: true })
	await privacy.scrollIntoViewIfNeeded()
	await expect(privacy).toBeInViewport()
})
