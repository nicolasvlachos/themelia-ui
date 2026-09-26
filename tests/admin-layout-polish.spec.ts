/** App-shell layouts: mobile navigation, collapsing and moving the rail, contained scrolling and configured widths. */
import { expect, test } from "@playwright/test"
import { DEV_ORIGIN, url } from "./routes"

/* Mounts components from source at runtime, which only the dev server serves. */
test.use({ baseURL: DEV_ORIGIN })

test("header-first navigation opens on mobile and returns focus after dismissal", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/app-shell"))
	const demo = page.locator("#topbar-sidebar-layout")
	const trigger = demo.locator('[data-slot="sidebar-trigger"]')
	await trigger.click()
	const dialog = page.getByRole("dialog", { name: "Navigation", exact: true })
	await expect(dialog).toBeVisible()
	await expect(dialog.getByRole("link", { name: "Invoices" })).toBeVisible()
	await page.keyboard.press("Escape")
	await expect(dialog).not.toBeVisible()
	await expect(trigger).toBeFocused()
	await trigger.click()
	await dialog.getByRole("link", { name: "Overview", exact: true }).click()
	await expect(dialog).not.toBeVisible()
	await expect(demo.getByRole("heading", { name: "Overview", exact: true })).toBeVisible()
})

test("embedded topbar fits its frame and keeps the sidebar below the header", async ({ page }) => {
	await page.goto(url("/app-shell"))
	await page.addStyleTag({ content: "* { transition-duration: 0s !important }" })
	const shell = page.locator('#topbar-sidebar-layout [data-slot="topbar-sidebar-layout"]')
	await expect(shell).toBeVisible()
	const geometry = await shell.evaluate(el => {
		const frame = el.parentElement!.parentElement!.getBoundingClientRect()
		const root = el.getBoundingClientRect()
		const header = el.querySelector('[data-slot="topbar-header"]')!.getBoundingClientRect()
		const rail = el.querySelector('[data-slot="sidebar-container"], [data-slot="sidebar"]')!.getBoundingClientRect()
		return { rootHeight: root.height, frameHeight: frame.height, headerBottom: header.bottom, railTop: rail.top }
	})
	expect(geometry.rootHeight).toBeLessThanOrEqual(geometry.frameHeight)
	expect(geometry.railTop).toBeGreaterThanOrEqual(geometry.headerBottom)
})

test("header-first desktop navigation collapses and can move to the right", async ({ page }) => {
	await page.goto(url("/app-shell"))
	await page.addStyleTag({ content: "* { transition-duration: 0s !important }" })
	const demo = page.locator("#topbar-sidebar-layout")
	const gap = demo.locator('[data-slot="sidebar-gap"]')
	const original = (await gap.boundingBox())!.width
	await demo.locator('[data-slot="sidebar-trigger"]').click()
	await expect(demo.locator('[data-slot="sidebar"][data-state]')).toHaveAttribute("data-state", "collapsed")
	expect((await gap.boundingBox())!.width).toBeLessThan(original)
	await demo.getByRole("radio", { name: "Right navigation" }).click()
	const content = (await demo.locator('[data-slot="topbar-content"]').boundingBox())!
	const rail = (await demo.locator('[data-slot="sidebar-container"]').boundingBox())!
	expect(rail.x).toBeGreaterThanOrEqual(content.x + content.width - 1)
	await demo.locator('[data-slot="sidebar-trigger"]').click()
	expect((await gap.boundingBox())!.width).toBeCloseTo(original, 0)
})

test("stacked navigation and a composed workspace keep their actions reachable on mobile", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url("/app-shell"))
	const demo = page.locator("#stacked-shell")
	await demo.getByRole("button", { name: "Settings", exact: true }).click()
	await demo.getByRole("textbox", { name: "Workspace name" }).fill("Acme")
	await demo.getByRole("button", { name: "Save changes" }).click()
	await expect(demo.getByRole("status")).toHaveText("Workspace updated.")
	const workspace = page.locator("#composed-workspace")
	await workspace.getByRole("button", { name: /Billing/ }).click()
	await expect(workspace.getByRole("table", { name: "Recent invoices" })).toBeVisible()
	for (const example of [demo, workspace]) {
		const shell = example.locator('[data-slot="stacked-layout"]')
		expect(await shell.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1)
	}
})

test("a header-first shell without navigation uses all available width and supports contained scrolling", async ({ page }) => {
	await page.goto(url("/app-shell"))
	await page.getByRole("heading", { name: "App shell", exact: true }).waitFor()
	/* Mount the shell as a consumer would, importing source and React through the Vite dev server. */
	await page.evaluate(async () => {
		const reactPath = "/node_modules/.vite/deps/react.js"
		const domPath = "/node_modules/.vite/deps/react-dom_client.js"
		const shellPath = "/src/components/layout/app-shell/index.ts"
		const [{ default: React }, { default: ReactDOM }, { TopbarSidebarLayout }] = await Promise.all([import(reactPath), import(domPath), import(shellPath)])
		const host = document.createElement("div")
		host.id = "admin-consumer"
		host.style.cssText = "position:fixed;inset:0;z-index:9999;width:900px;height:360px;background:var(--background)"
		document.body.append(host)
		ReactDOM.createRoot(host).render(React.createElement(TopbarSidebarLayout, { contained: true, logo: "Workspace", sidebarProviderProps: { persist: false, keyboardShortcut: false } },
			React.createElement("div", { style: { height: "1000px" } }, "Long content"), React.createElement("button", null, "Last action")))
	})
	const host = page.locator("#admin-consumer")
	const content = host.locator('[data-slot="topbar-content"]')
	await expect(content).toBeVisible()
	expect((await content.boundingBox())!.width).toBe(900)
	await host.getByRole("button", { name: "Last action" }).click()
	expect(await content.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
	const header = (await host.locator('[data-slot="topbar-header"]').boundingBox())!
	expect(header.y).toBe(0)
	expect((await host.locator('[data-slot="topbar-sidebar-layout"]').boundingBox())!.height).toBe(360)
})

test("custom navigation retains the shell's configured sidebar width", async ({ page }) => {
	await page.goto(url("/app-shell"))
	await page.getByRole("heading", { name: "App shell", exact: true }).waitFor()
	await page.evaluate(async () => {
		const reactPath = "/node_modules/.vite/deps/react.js"
		const domPath = "/node_modules/.vite/deps/react-dom_client.js"
		const shellPath = "/src/components/layout/app-shell/index.ts"
		const [{ default: React }, { default: ReactDOM }, { TopbarSidebarLayout }] = await Promise.all([import(reactPath), import(domPath), import(shellPath)])
		const host = document.createElement("div")
		host.id = "custom-sidebar-consumer"
		host.style.cssText = "position:fixed;inset:0;z-index:9999;width:900px;height:360px;background:var(--background)"
		document.body.append(host)
		ReactDOM.createRoot(host).render(React.createElement(TopbarSidebarLayout, {
			contained: true, sidebarWidth: "320px", sidebarTrigger: false,
			sidebar: React.createElement("nav", null, "Custom navigation"),
			sidebarProviderProps: { persist: false, keyboardShortcut: false },
		}, "Content"))
	})
	const rail = page.locator('#custom-sidebar-consumer [data-slot="topbar-sidebar"]')
	await expect(rail).toBeVisible()
	expect((await rail.boundingBox())!.width).toBe(320)
})
