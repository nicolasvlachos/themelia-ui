/** The theme tweaker: overflowing tab rails, fixed panel chrome, live and persisted edits, corner presets, saved-theme migration and locale input. */
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

for (const theme of ['light', 'dark'] as const) for (const direction of ['ltr', 'rtl'] as const) {
	test(`overflowing theme tabs scroll with buttons and keyboard in ${theme}, ${direction}`, async ({ page }, info) => {
		/* Linux WebKit only: the tab resolves but never takes the click; not reproducible on macOS. */
		test.fixme(info.project.name === 'webkit' && process.platform === 'linux', 'tab never takes the click on Linux WebKit')
		/* Three densities, each clicking across the whole rail: 3s here, past 30s under 6x CPU throttling. */
		test.setTimeout(60_000)
		await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
		await page.setViewportSize({ width: 390, height: 844 })
		await page.goto(url('/card'))
		await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
		const panel = page.getByRole('dialog', { name: 'Theme settings' })
		await page.evaluate(dir => { document.documentElement.dir = dir }, direction)
		for (const density of ['compact', 'default', 'comfortable']) {
			await panel.getByRole('tab', { name: 'Appearance', exact: true }).click()
			await panel.getByLabel('Density', { exact: true }).selectOption(density)
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
			if (density === 'default') await rail.screenshot({ path: info.outputPath(`fade-${direction}-start.png`) })
			const body = panel.locator('[data-slot="scroll-area"]')
			const before = await body.evaluate(el => el.scrollTop)
			await next.click()
			await expect.poll(() => list.evaluate(el => Math.abs(el.scrollLeft))).toBeGreaterThan(0)
			await expect(list).toHaveAttribute('data-fade-start', '')
			await expect(list).toHaveAttribute('data-fade-end', '')
			if (density === 'default') await rail.screenshot({ path: info.outputPath(`fade-${direction}-middle.png`) })
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
			if (density === 'default') await rail.screenshot({ path: info.outputPath(`fade-${direction}-end.png`) })
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
			await panel.screenshot({ path: info.outputPath(`overflow-${theme}-${direction}-${density}.png`), animations: 'disabled' })
		}
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

for (const width of [390, 1440]) {
	for (const density of ['compact', 'default', 'comfortable'] as const) {
		test(`theme panel keeps its controls visible while scrolling at ${width}px in ${density}`, async ({ page }, info) => {
			await page.setViewportSize({ width, height: 740 })
			await page.goto(url('/card'))
			await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
			const panel = page.getByRole('dialog', { name: 'Theme settings', exact: true })
			await panel.getByLabel('Density', { exact: true }).selectOption(density)
			const controlType = await panel.getByLabel('Density', { exact: true }).evaluate(el => getComputedStyle(el).fontSize)
			const closeIcon = panel.getByRole('button', { name: 'Close theme settings' }).locator('svg')
			const iconSize = await closeIcon.evaluate(el => getComputedStyle(el).width)
			await panel.getByRole('tab', { name: 'All theme values', exact: true }).click()
			const body = panel.locator('[data-slot="scroll-area"]')
			await expect.poll(() => body.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
			await expect(panel.getByLabel('Background', { exact: true })).toHaveCSS('font-size', controlType)
			const categories = panel.getByRole('tablist', { name: 'Theme categories' })
			for (const icon of await categories.locator('svg').all()) await expect(icon).toHaveCSS('width', iconSize)
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
			await body.evaluate(el => { el.scrollTop = 0 })
			await panel.screenshot({ path: info.outputPath('theme-panel.png'), animations: 'disabled' })
			await panel.getByRole('tab', { name: 'Appearance', exact: true }).click()
			await expect(panel.getByLabel('Density', { exact: true })).toHaveValue(density)
		})
	}

	test(`app inspector edits the current page and keeps edits after closing/navigation/reload at ${width}px`, async ({ page }, info) => {
		await page.setViewportSize({ width, height: 900 })
		await page.goto(url('/card'))
		const card = page.locator('main .card--component').first()
		const before = await card.evaluate(el => getComputedStyle(el).borderRadius)
		await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
		const inspector = page.getByRole('dialog', { name: /Theme settings|All theme values/ })
		await expect(inspector).toBeVisible()
		await expect.poll(async () => Math.round((await inspector.boundingBox())!.width)).toBe(width === 390 ? 351 : 416)
		await inspector.getByRole('tab', { name: 'All theme values', exact: true }).click()
		await inspector.getByRole('tab', { name: 'Shape & elevation', exact: true }).click()
		await inspector.getByLabel('Radius', { exact: true }).fill('1.25')
		await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--radius').trim())).toBe('1.25rem')
		await expect.poll(() => card.evaluate(el => getComputedStyle(el).borderRadius)).not.toBe(before)
		await page.screenshot({ path: info.outputPath('live-inspector.png'), fullPage: false })
		await inspector.getByRole('button', { name: 'Close theme settings', exact: true }).click()
		await expect(inspector).not.toBeVisible()
		await page.evaluate(() => { location.hash = '/button' })
		await expect(page.locator('main h1')).toHaveText('Button')
		await page.reload()
		await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--radius').trim())).toBe('1.25rem')
		await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
		await inspector.getByRole('button', { name: 'Reset', exact: true }).click()
		await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--radius'))).toBe('')
		await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
	})
}

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

	await page.goto(url('/action-menu'))
	await page.locator('main [aria-haspopup]').first().click()
	const menu = page.locator("[data-slot='dropdown-menu-content']:visible").first()
	await expect(menu).toHaveCSS('border-radius', '20px')
	await expect(menu.getByRole('menuitem').first()).toHaveCSS('border-radius', '10px')
})

test('a saved single radius from before the pair migrates to a pair', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('themelia-ui:app-theme:v1', JSON.stringify({
			version: 2,
			theme: { mode: 'light', shared: { '--radius': '0.875rem' }, light: {}, dark: {} },
			config: { colorScheme: 'light', density: 'default' },
		}))
	})
	await page.goto(url('/input'))
	/* 0.875rem was the Rounded preset, now the default: migration drops it and both radii are the kit's. */
	const fieldRadius = await page.locator('main [data-field-control]').first().evaluate(element => parseFloat(getComputedStyle(element).borderRadius))
	expect(fieldRadius).toBeCloseTo(8, 2)
	await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('themelia-ui:app-theme:v1') ?? '{}').version)).toBe(4)
})

test.describe('from source', () => {
	/* Imports the serializer from source at runtime, which only the dev server serves. */
	test.use({ baseURL: DEV_ORIGIN })

	test('an exported theme reaches inside a provider and follows its data-theme', async ({ page }) => {
		await page.goto(url('/button'))
		await page.locator('main [data-ui-scope] button').first().waitFor()
		const read = () => page.evaluate(() => getComputedStyle(document.querySelector('main [data-ui-scope] button')!).getPropertyValue('--primary').trim())
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

test('a saved spacing factor carries over to the merged density factor', async ({ page }) => {
	await page.addInitScript(() => {
		localStorage.setItem('themelia-ui:app-theme:v1', JSON.stringify({
			version: 3,
			theme: { mode: 'light', shared: { '--space-scale': '1.25' }, light: {}, dark: {} },
			config: { colorScheme: 'light', density: 'default' },
		}))
	})
	await page.goto(url('/input'))
	await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--density-scale').trim())).toBe('1.25')
	await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('themelia-ui:app-theme:v1') ?? '{}').version)).toBe(4)
})

test('the page edits the same app configuration as the header', async ({ page }) => {
	await page.goto(url('/theme-tweaker'))
	await expect(page.getByRole('navigation', { name: 'Page location' })).toContainText('Get started')
	await page.getByRole('tab', { name: 'Provider', exact: true }).click()
	await page.getByLabel('Locale', { exact: true }).fill('de-DE')
	await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click()
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
	await expect(page.getByLabel('Locale', { exact: true })).toHaveValue('de-DE')
	await page.evaluate(() => { location.hash = '/primitive-money' })
	await expect(page.locator('main .money--component').first()).toContainText(',')
	await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
	const inspector = page.getByRole('dialog', { name: /Theme settings|All theme values/ })
	await inspector.getByRole('tab', { name: 'All theme values', exact: true }).click()
	await inspector.getByRole('tab', { name: 'Provider', exact: true }).click()
	await expect(inspector.getByLabel('Locale', { exact: true })).toHaveValue('de-DE')
})

for (const theme of ['light', 'dark'] as const) {
	test(`live workspace and inspector remain accessible on mobile in ${theme}`, async ({ page }, info) => {
		/* An axe audit per inspector tab: ~20s alone, past the 30s default in Firefox under load. */
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
		await page.getByRole('tab', { name: 'Colours', exact: true }).click()
		await page.screenshot({ path: info.outputPath('workspace.png'), fullPage: true })
		await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
		const inspector = page.getByRole('dialog', { name: /Theme settings|All theme values/ })
		await expect(inspector).toBeVisible()
		const audit = await new AxeBuilder({ page }).include('[data-slot=popover-content]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
		expect(audit.violations).toEqual([])
		await page.screenshot({ path: info.outputPath('inspector.png') })
		/* Pixel baselines are macOS-only (tests/README.md, Where these run). */
		if (info.project.name === 'chromium' && process.platform === 'darwin') await expect(inspector).toHaveScreenshot(`theme-widget-${theme}.png`)
		await inspector.getByRole('tab', { name: 'All theme values', exact: true }).click()
		for (const tab of ['Colours', 'States', 'Typography', 'Shape & elevation', 'Structure', 'Provider']) {
			await inspector.getByRole('tab', { name: tab, exact: true }).click()
			const advancedAudit = await new AxeBuilder({ page }).include('[data-slot=popover-content]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
			expect(advancedAudit.violations).toEqual([])
		}
		await inspector.getByRole('tab', { name: 'Colours', exact: true }).click()
		await inspector.locator('[data-slot="scroll-area"]').evaluate(el => { el.scrollTop = 0 })
		await inspector.screenshot({ path: info.outputPath('advanced-inspector.png'), animations: 'disabled' })
		await inspector.getByRole('button', { name: 'Close theme settings', exact: true }).click()
		await expect(page.getByRole('button', { name: 'Customize theme', exact: true })).toBeFocused()
	})
}

test('light and dark colors update the app and portaled inspector independently', async ({ page }) => {
	await page.goto(url('/card'))
	await page.getByRole('button', { name: 'Customize theme', exact: true }).click()
	const inspector = page.getByRole('dialog', { name: /Theme settings|All theme values/ })
	await inspector.getByRole('tab', { name: 'All theme values', exact: true }).click()
	await inspector.getByLabel('Background', { exact: true }).fill('#eeeeee')
	await expect(inspector).toHaveCSS('--background', '#eeeeee')
	await inspector.getByRole('tab', { name: 'Dark', exact: true }).click()
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
	await inspector.getByLabel('Background', { exact: true }).fill('#181828')
	await expect(inspector).toHaveCSS('--background', '#181828')
	await inspector.getByRole('tab', { name: 'Light', exact: true }).click()
	await expect(inspector.getByLabel('Background', { exact: true })).toHaveValue('#eeeeee')
	await expect(inspector).toHaveCSS('--background', '#eeeeee')
	await inspector.getByRole('button', { name: 'Close theme settings', exact: true }).click()
	await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--background').trim())).toBe('#eeeeee')
})

for (const width of [390, 1440]) {
	test(`floating theme controls work without leaving the current page at ${width}px`, async ({ page }, info) => {
		await page.setViewportSize({ width, height: 844 })
		await page.goto(url('/card'))
		const launcher = page.getByRole('button', { name: 'Customize theme', exact: true })
		await expect(launcher).toHaveCSS('position', 'fixed')
		const box = await launcher.boundingBox()
		expect(box!.width).toBeGreaterThanOrEqual(44)
		expect(box!.height).toBeGreaterThanOrEqual(44)
		await page.evaluate(() => window.scrollTo(0, 500))
		expect((await launcher.boundingBox())!.y).toBeCloseTo(box!.y)
		await launcher.click()
		const panel = page.getByRole('dialog', { name: 'Theme settings', exact: true })
		await expect(panel).toBeVisible()
		await page.screenshot({ path: info.outputPath('quick-controls.png') })
		await panel.getByLabel('Accent color', { exact: true }).fill('#7c3aed')
		await expect(panel).toHaveCSS('--primary', '#7c3aed')
		await panel.getByLabel('Accent color', { exact: true }).fill('#7')
		await expect(panel).toContainText('Enter a valid color.')
		await expect(panel).toHaveCSS('--primary', '#7c3aed')
		await panel.getByLabel('Accent color', { exact: true }).fill('#7c3aed')
		await panel.getByRole('radio', { name: 'Dark', exact: true }).click()
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
		await expect(panel).toHaveCSS('--primary', '#7c3aed')
		await panel.getByLabel('Density', { exact: true }).selectOption('comfortable')
		await panel.getByLabel('Corners', { exact: true }).selectOption('1.25rem')
		await panel.getByLabel('Font', { exact: true }).selectOption('Georgia, serif')
		await expect(page.locator('main')).toHaveCSS('font-family', 'Georgia, serif')
		await expect(panel).toHaveCSS('--radius', '1.25rem')
		await expect(panel).toHaveCSS('--radius-sm', '0.625rem')
		await page.evaluate(() => { location.hash = '/button' })
		await expect(page.locator('main h1')).toHaveText('Button')
		await expect(panel).toBeVisible()
		await panel.getByRole('button', { name: 'Close theme settings' }).click()
		await launcher.click()
		await expect(panel.getByLabel('Font', { exact: true })).toHaveValue('Georgia, serif')
		await panel.getByRole('button', { name: 'Reset', exact: true }).click()
		await expect(panel.getByLabel('Font', { exact: true })).toHaveValue('')
		await expect(panel.getByLabel('Corners', { exact: true })).toHaveValue('')
		await page.keyboard.press('Escape')
		await expect(panel).not.toBeVisible()
		await expect(launcher).toBeFocused()
	})
}
