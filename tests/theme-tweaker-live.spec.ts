/** The theme tweaker: overflowing tab rails, the panel's fixed chrome, corner presets, locale input, exported themes and accessible panels. */
import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { DEV_ORIGIN, url } from "./routes"

const runtimeErrors = new WeakMap<Page, string[]>()
test.beforeEach(({ page }) => {
	const errors: string[] = []
	runtimeErrors.set(page, errors)
	page.on('pageerror', error => errors.push(error.message))
})
test.afterEach(({ page }) => expect(runtimeErrors.get(page)).toEqual([]))

/* Direction decides which edge fades and which way the buttons scroll. */
for (const direction of ['ltr', 'rtl'] as const) {
	test(`overflowing theme tabs scroll with buttons and keyboard in ${direction}`, async ({ page }, info) => {
		/* Linux WebKit only: the tab resolves but never takes the click; not reproducible on macOS. */
		test.fixme(info.project.name === 'webkit' && process.platform === 'linux', 'tab never takes the click on Linux WebKit')
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(url('/card'))
		await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
		const panel = page.getByRole('dialog', { name: 'Theme settings' })
		await page.evaluate(dir => { document.documentElement.dir = dir }, direction)
		await panel.getByRole('tab', { name: 'All theme values', exact: true }).click()
		const list = panel.getByRole('tablist', { name: 'Theme categories' })
		const rail = list.locator('..')
		const next = rail.getByRole('button', { name: 'Scroll tabs forward' })
		const previous = rail.getByRole('button', { name: 'Scroll tabs backward' })
		await expect(next).toBeEnabled()
		await expect(previous).toBeDisabled()
		await expect(list).not.toHaveAttribute('data-fade-start')
		await expect(list).toHaveAttribute('data-fade-end', '')
		await expect(list).toHaveCSS('mask-image', direction === 'ltr' ? /to left/ : /to right/)
		const body = panel.locator('[data-slot="scroll-area"]')
		const before = await body.evaluate(el => el.scrollTop)
		await next.click()
		await expect.poll(() => list.evaluate(el => Math.abs(el.scrollLeft))).toBeGreaterThan(0)
		await expect(list).toHaveAttribute('data-fade-start', '')
		await expect(list).toHaveAttribute('data-fade-end', '')
		await expect(list.getByRole('tab', { name: 'Colours', exact: true })).toHaveAttribute('aria-selected', 'true')
		for (let i = 0; i < 10; i++) {
			const remaining = await list.evaluate(el => el.scrollWidth - el.clientWidth - Math.abs(el.scrollLeft))
			if (remaining <= 1) break
			const target = await list.evaluate(el => Math.min(el.scrollWidth - el.clientWidth, Math.abs(el.scrollLeft) + el.clientWidth * 0.75))
			await next.click()
			await expect.poll(() => list.evaluate(el => Math.abs(el.scrollLeft))).toBeGreaterThanOrEqual(target - 1)
		}
		await expect(next).toBeDisabled()
		await expect(previous).toBeEnabled()
		await expect(list).toHaveAttribute('data-fade-start', '')
		await expect(list).not.toHaveAttribute('data-fade-end')
		await expect(list).toHaveCSS('mask-image', direction === 'ltr' ? /to right/ : /to left/)
		await expect(list.getByRole('tab', { name: 'Provider', exact: true })).toBeInViewport()
		await previous.click()
		await expect(next).toBeEnabled()
		await list.getByRole('tab', { name: 'Colours', exact: true }).focus({ preventScroll: true })
		await page.keyboard.press('End')
		await expect(list.getByRole('tab', { name: 'Provider', exact: true })).toBeFocused()
		await expect(next).toBeDisabled()
		await page.keyboard.press('Home')
		await expect(previous).toBeDisabled()
		expect(await body.evaluate(el => el.scrollTop)).toBe(before)
	})
}

test('tab overflow controls disappear when the row fits after resizing', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 })
	await page.goto(url('/theme-tweaker'))
	const list = page.getByRole('tablist', { name: 'Theme categories' })
	const rail = list.locator('..')
	await expect(rail.getByRole('button', { name: 'Scroll tabs forward' })).toBeVisible()
	await page.setViewportSize({ width: 1440, height: 900 })
	await expect(rail.getByRole('button')).toHaveCount(0)
	await expect(list).toHaveCSS('mask-image', 'none')
	await page.setViewportSize({ width: 390, height: 844 })
	await expect(rail.getByRole('button', { name: 'Scroll tabs forward' })).toBeVisible()
})

test('overflow edge fades can be disabled through the TabList prop', async ({ page }) => {
	await page.goto(url('/tabs'))
	const list = page.getByRole('tablist', { name: 'Scrollable sections' })
	await expect(list).toHaveAttribute('data-fade-end', '')
	await page.getByText('Fade overflowing edges', { exact: true }).click()
	await expect(list).toHaveCSS('mask-image', 'none')
	await list.locator('..').getByRole('button', { name: 'Scroll tabs forward' }).click()
	await expect.poll(() => list.evaluate(el => el.scrollLeft)).toBeGreaterThan(0)
	await expect(list).toHaveCSS('mask-image', 'none')
	await page.getByText('Fade overflowing edges', { exact: true }).click()
	await expect(list).toHaveCSS('mask-image', /linear-gradient/)
})

test("the provider preview updates formatting without remounting the editor", async ({ page }) => {
	await page.goto(url("/theme-tweaker"))
	const amount = page.locator("main .money--component").first()
	await expect(amount).toContainText("1,234.56")
	await page.getByRole("tab", { name: "Provider", exact: true }).click()
	const locale = page.getByLabel("Locale", { exact: true })
	await locale.evaluate(el => el.setAttribute("data-mounted-probe", "same-input"))
	await locale.fill("de-DE")
	await expect(amount).toContainText("1.234,56")
	await expect(locale).toHaveAttribute("data-mounted-probe", "same-input")
})

test("an unfinished locale keeps the last valid preview and remains editable", async ({ page }) => {
	const errors: string[] = []
	page.on("pageerror", error => errors.push(error.message))
	await page.goto(url("/theme-tweaker"))
	await page.getByRole("tab", { name: "Provider", exact: true }).click()
	const locale = page.getByLabel("Locale", { exact: true })
	await locale.fill("d")
	await expect(locale).toHaveValue("d")
	await expect(page.locator("main .money--component").first()).toContainText("1,234.56")
	await locale.fill("de-DE")
	await expect(page.locator("main .money--component").first()).toContainText("1.234,56")
	expect(errors).toEqual([])
})

test('theme panel keeps its controls visible while scrolling', async ({ page }) => {
	await page.goto(url('/card'))
	await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
	const panel = page.getByRole('dialog', { name: 'Theme settings', exact: true })
	await panel.getByRole('tab', { name: 'All theme values', exact: true }).click()
	const body = panel.locator('[data-slot="scroll-area"]')
	await expect.poll(() => body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
	const categories = panel.getByRole('tablist', { name: 'Theme categories' })
	const colours = categories.getByRole('tab', { name: 'Colours', exact: true })
	await colours.focus()
	await page.keyboard.press('End')
	const provider = categories.getByRole('tab', { name: 'Provider', exact: true })
	await expect(provider).toBeFocused()
	await expect(provider).toHaveAttribute('aria-selected', 'true')
	await expect(panel.getByRole('tabpanel', { name: 'Provider', exact: true })).toBeVisible()
	await page.keyboard.press('Home')
	await expect(colours).toBeFocused()
	await body.evaluate(el => { el.scrollTop = 0 })
	await expect(panel).toHaveCSS('opacity', '1')
	const header = panel.getByRole('heading', { name: 'Theme settings' })
	const navigation = panel.getByRole('tablist', { name: 'Theme editor view' })
	const reset = panel.getByRole('button', { name: 'Reset', exact: true })
	const chrome = [header, navigation, reset]
	const positions = await Promise.all(chrome.map(el => el.boundingBox()))
	await body.evaluate(el => { el.scrollTop = el.scrollHeight })
	await expect.poll(() => body.evaluate(el => el.scrollTop)).toBeGreaterThan(0)
	for (const [index, element] of chrome.entries()) {
		await expect(element).toBeInViewport()
		expect((await element.boundingBox())!.y).toBeCloseTo(positions[index]!.y, 0)
	}
})

test('a corner preset moves both radii as a pair: containers take one, their contents the other', async ({ page }) => {
	await page.goto(url('/card'))
	const launcher = page.getByRole('button', { name: 'Customize theme', exact: true })
	await launcher.click()
	const panel = page.getByRole('dialog', { name: 'Theme settings', exact: true })
	await panel.getByLabel('Corners', { exact: true }).selectOption('1.25rem')
	await expect(page.locator('main .card--component').first()).toHaveCSS('border-radius', '20px')

	await page.keyboard.press('Escape')
	await page.goto(url('/button'))
	const buttonRadius = await page.locator('main .button--component').first().evaluate(element => parseFloat(getComputedStyle(element).borderRadius))
	expect(buttonRadius).toBeCloseTo(10, 2)

	await page.goto(url('/input'))
	const fieldRadius = await page.locator('main [data-field-control]').first().evaluate(element => parseFloat(getComputedStyle(element).borderRadius))
	expect(fieldRadius).toBeCloseTo(10, 2)

	// A menu hangs off a control, so it takes the control's radius, and its rows nest in its inset.
	await page.goto(url('/action-menu'))
	await page.locator('main [aria-haspopup]').first().click()
	const menu = page.locator("[data-slot='dropdown-menu-content']:visible").first()
	await expect(menu).toHaveCSS('border-radius', `${fieldRadius}px`)
	const [menuRadius, inset, rowRadius] = await menu.evaluate((element) => {
		const row = element.querySelector('[role="menuitem"]')!
		return [element, element, row].map((node, index) =>
			parseFloat(index === 1 ? getComputedStyle(node).paddingTop : getComputedStyle(node).borderTopLeftRadius))
	})
	expect(rowRadius).toBeCloseTo(Math.max(0, menuRadius - inset), 1)
})

test.describe('from source', () => {
	/* Imports the serializer from source at runtime, which only the dev server serves. */
	test.use({ baseURL: DEV_ORIGIN })

	test('an exported theme reaches inside a provider and follows its data-theme', async ({ page }) => {
		await page.goto(url('/button'))
		await page.locator('main [data-ui-scope] button').first().waitFor()
		/* A variable keeps its light-dark() pair unresolved; a colour that uses it resolves to one half. */
		await page.evaluate(() => {
			const probe = document.createElement('span')
			probe.id = 'primary-probe'
			probe.style.color = 'var(--primary)'
			document.querySelector('main [data-ui-scope] button')!.append(probe)
		})
		const read = () => page.evaluate(() => getComputedStyle(document.getElementById('primary-probe')!).color)
		await page.evaluate(async () => {
			const { serializeTheme, createTheme } = await import('/src/components/features/theme-tweaker/theme-tweaker.utils.ts')
			const style = document.createElement('style')
			style.textContent = serializeTheme(createTheme({ light: { '--primary': 'rgb(255, 0, 0)' }, dark: { '--primary': 'rgb(0, 0, 255)' } }))
			document.head.append(style)
			document.documentElement.classList.remove('dark', 'light')
			document.documentElement.setAttribute('data-theme', 'light')
		})
		await expect.poll(read).toBe('rgb(255, 0, 0)')
		await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
		await expect.poll(read).toBe('rgb(0, 0, 255)')
	})
})

/* Both themes: this audit keeps axe's colour-contrast rule. */
for (const theme of ['light', 'dark'] as const) {
	test(`every theme tweaker panel is accessible on a phone in ${theme}`, async ({ page }) => {
		/* An axe audit per panel. */
		test.setTimeout(90_000)
		await page.emulateMedia({ colorScheme: theme })
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(url('/theme-tweaker'))
		await expect(page.locator('main h1')).toHaveText('Theme tweaker')
		for (const tab of ['Colours', 'States', 'Typography', 'Shape & elevation', 'Structure', 'Provider']) {
			await page.getByRole('tab', { name: tab, exact: true }).click()
			const audit = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
			expect(audit.violations).toEqual([])
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
		}
	})
}
