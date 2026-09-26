/** Visual contracts measured directly: empty copy, numeric steppers, selection carets, preview tabs, nested radii and selected calendar ranges. */
import { expect, test } from "@playwright/test"
import { auditTextContrast } from "./helpers/contrast"
import { url } from "./routes"

for (const theme of ["light", "dark"] as const) {
	test.describe(theme, () => {
		test.use({ colorScheme: theme, reducedMotion: "reduce" })

		for (const width of [390, 1440]) {
			test(`empty copy and numeric steppers keep their alignment at ${width}px`, async ({ page }) => {
				await page.setViewportSize({ width, height: 900 })
				for (const route of ["/empty", "/decimal-input", "/percentage-input"]) {
					await page.goto(url(route))
					await page.locator("main h1").waitFor()
					for (const density of ["compact", "default", "comfortable"]) {
						await page.locator("main").evaluate((el, density) => el.setAttribute("data-density", density), density)
						if (route === "/empty") {
							const copy = page.locator("main .empty--title, main .empty--description")
							expect(await copy.count()).toBeGreaterThan(4)
							for (const el of await copy.all()) await expect(el).toHaveCSS("text-align", "center")
						} else {
							const geometry = await page.locator("main .decimal-input--component[data-field-shell]").evaluateAll(shells =>
								shells.flatMap(shell => {
									const box = shell.getBoundingClientRect()
									return [...shell.querySelectorAll(":scope > button")].map(button => {
										const b = button.getBoundingClientRect()
										return { top: b.top - box.top, bottom: box.bottom - b.bottom, height: b.height }
									})
								}),
							)
							expect(geometry.length, `${route} needs real steppers`).toBeGreaterThanOrEqual(2)
							for (const button of geometry) {
								expect(button.height).toBeGreaterThan(0)
								expect(Math.abs(button.top - button.bottom), `${route}/${density}`).toBeLessThanOrEqual(1)
							}
						}
					}
				}
			})
		}

		test("selection and editing carets follow the active theme", async ({ page }) => {
			await page.goto(url("/input"))
			const field = page.getByRole("textbox", { name: "Input", exact: true })
			const colors = await field.evaluate(element => {
				const selection = getComputedStyle(element, "::selection")
				const probe = document.createElement("span")
				probe.style.cssText = [
					"position:absolute",
					"visibility:hidden",
					"background-color:var(--primary)",
					"color:var(--primary-foreground)",
					"caret-color:var(--primary-accent)",
				].join(";")
				element.parentElement!.appendChild(probe)
				const expected = getComputedStyle(probe)
				const result = {
					selectionBackground: selection.backgroundColor,
					selectionColor: selection.color,
					caret: getComputedStyle(element).caretColor,
					primary: expected.backgroundColor,
					primaryForeground: expected.color,
					primaryAccent: expected.caretColor,
				}
				probe.remove()
				return result
			})

			expect(colors.selectionBackground).toBe(colors.primary)
			expect(colors.selectionColor).toBe(colors.primaryForeground)
			expect(colors.caret).toBe(colors.primaryAccent)
		})

		test("preview chrome uses quiet tabs and the surface radius", async ({ page }) => {
			await page.goto(url("/breadcrumbs"))
			await page.addStyleTag({ content: `
				:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
					--radius: 14px; --radius-sm: 9px;
				}
			` })
			const example = page.locator("main .example--component").first()
			const tabs = example.getByRole("group", { name: "Example view" })
			const frame = tabs.locator("..")
			const preview = tabs.getByRole("button", { name: "Preview", exact: true })
			const code = tabs.getByRole("button", { name: "Code", exact: true })

			await expect(frame).toHaveCSS("border-radius", "14px")
			await expect(preview).toHaveAttribute("aria-pressed", "true")
			await expect(preview).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
			await expect(preview).toHaveCSS("box-shadow", "none")
			const indicator = await preview.evaluate(element => {
				const style = getComputedStyle(element, "::after")
				return { color: style.backgroundColor, height: style.height }
			})
			expect(indicator.height).toBe("2px")
			expect(indicator.color).not.toBe("rgba(0, 0, 0, 0)")

			await code.click()
			await expect(code).toHaveAttribute("aria-pressed", "true")
			await expect(preview).toHaveAttribute("aria-pressed", "false")
		})

		test("nested feature and block surfaces step down from structural shells", async ({ page }) => {
			const radiusOverride = `
				:root, [data-ui-scope], [data-density], [data-theme], .light, .dark {
					--radius: 18px;
					--radius-sm: 5px;
				}
			`

			await page.goto(url("/blocks-commerce"))
			await page.addStyleTag({ content: radiusOverride })
			await expect(page.locator("#invoice-mini .content-block--component").first()).toHaveCSS("border-radius", "18px")
			await expect(page.locator("#cart-summary .summary-panel--component")).toHaveCSS("border-radius", "5px")

			await page.goto(url("/ai-chat"))
			await page.addStyleTag({ content: radiusOverride })
			const chat = page.locator("#chat .ai-chat--component")
			await expect(chat).toHaveCSS("border-radius", "18px")
			await expect(chat.locator(".ai-tool-call--component")).toHaveCSS("border-radius", "5px")
			await expect(chat.locator(".ai-chat-queue--component")).toHaveCSS("border-radius", "5px")
		})

		test("a selected calendar range retains contrast and follows the primary color", async ({ page }) => {
			await page.clock.setFixedTime(new Date("2026-06-17T10:30:00Z"))
			await page.goto(url("/calendar"))
			const calendar = page.locator("main .calendar--component").first()
			await calendar.getByRole("button", { name: "10 June 2026", exact: true }).click()
			await calendar.getByRole("button", { name: "15 June 2026", exact: true }).click()
			await page.mouse.move(0, 0)
			await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" })
			await expect(calendar.locator("[data-in-range]")).toHaveCount(6)
			await expect(calendar.locator("button[data-selected]")).toHaveCount(2)
			const contrast = await page.evaluate(auditTextContrast, {
				rootSelector: "main .calendar--component",
				// The calendar's range band is explicitly painted behind its day buttons.
				backgroundPseudoSelector: "[role=gridcell][data-in-range]",
			})
			expect(contrast).toEqual([])
			const cell = calendar.locator("[data-in-range]:not([data-range-start]):not([data-range-end])").first()
			const before = await cell.evaluate(el => getComputedStyle(el, "::before").backgroundColor)
			await page.addStyleTag({ content: ":root, [data-ui-scope], [data-theme], .light, .dark { --primary: oklch(0.6 0.2 300); }" })
			await expect.poll(() => cell.evaluate(el => getComputedStyle(el, "::before").backgroundColor)).not.toBe(before)
		})
	})
}
