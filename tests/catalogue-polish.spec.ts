/** Catalogue blocks keep edits, toggled values and tabs working, without overflow, at every width, density and theme. */
import { expect, test } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { visitRoute } from "./routes"

const sections = ["catalogue-seo", "catalogue-inventory", "catalogue-vendor", "catalogue-booking"]

for (const theme of ["light", "dark"] as const) {
	for (const width of [1440, 390, 320]) {
		test(`catalogue blocks at ${width}px in ${theme}`, async ({ page }, info) => {
			test.setTimeout(90_000)
			const errors: string[] = []
			page.on("pageerror", error => errors.push(error.message))
			await page.setViewportSize({ width, height: 900 })
			await page.emulateMedia({ colorScheme: theme })
			await visitRoute(page, "/blocks-catalogue")
			const seo = page.locator("#catalogue-seo")
			await seo.getByRole("button", { name: "Edit listing" }).first().click()
			const dialog = page.getByRole("dialog", { name: "Edit search appearance" })
			await dialog.getByRole("textbox", { name: "Page title" }).fill("Updated catalogue listing")
			await dialog.getByRole("button", { name: "Save changes" }).click()
			await expect(dialog).not.toBeVisible()
			await expect(seo.getByText("Updated catalogue listing", { exact: true })).toBeVisible()
			await seo.getByRole("button", { name: "Edit listing" }).first().click()
			await dialog.getByRole("textbox", { name: "Page title" }).fill("Discarded draft")
			await dialog.getByRole("button", { name: "Cancel", exact: true }).click()
			await expect(seo.getByText("Updated catalogue listing", { exact: true })).toBeVisible()
			const inventory = page.locator("#catalogue-inventory")
			const available = inventory.getByRole("textbox", { name: "Available", exact: true })
			await available.fill("37")
			await expect(inventory.locator(".inventory-section--summary")).toContainText("37")
			await inventory.getByText("Track quantity", { exact: true }).click()
			await expect(available).not.toBeVisible()
			await inventory.getByText("Track quantity", { exact: true }).click()
			await expect(available).toHaveValue("37")
			await inventory.getByText("Requires shipping", { exact: true }).click()
			await expect(inventory.getByRole("textbox", { name: "Weight" })).not.toBeVisible()
			await inventory.getByText("Requires shipping", { exact: true }).click()
			await expect(inventory.getByRole("textbox", { name: "Weight" })).toHaveValue("0.42")
			const vendors = page.locator("#catalogue-vendor")
			await vendors.getByRole("tab", { name: "Performance" }).click()
			await expect(vendors.getByText("1,284", { exact: true })).toBeVisible()
			await vendors.getByRole("tab", { name: "Overview" }).click()
			await expect(vendors.getByText("6 days", { exact: true })).toBeVisible()
			for (const density of ["Compact", "Default", "Comfortable"]) {
				/* The docs Density select is hidden on narrow viewports, so switch it at desktop width. */
				await page.setViewportSize({ width: 1440, height: 900 })
				await page.getByLabel("Density", { exact: true }).selectOption({ label: density })
				await page.setViewportSize({ width, height: 900 })
				for (const id of sections) {
					const section = page.locator(`#${id}`)
					expect(await section.evaluate(el => el.scrollWidth - el.clientWidth), `${id} in ${density}`).toBeLessThanOrEqual(1)
					const overflow = await section.locator(".adaptive-grid--component, .inventory-section--group, .vendor-profile--component").evaluateAll(items => items.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => ({ className: el.className, width: el.clientWidth, scrollWidth: el.scrollWidth, children: [...el.children].map(child => ({ tag: child.tagName, width: child.getBoundingClientRect().width, scrollWidth: child.scrollWidth })) })))
					expect(overflow, `${id} in ${density}`).toEqual([])
				}
			}
			await page.setViewportSize({ width: 1440, height: 900 })
			await page.getByLabel("Density", { exact: true }).selectOption({ label: "Default" })
			await page.setViewportSize({ width, height: 900 })
			/* Captured for review, not compared. */
			for (const id of sections) await page.locator(`#${id}`).screenshot({ path: info.outputPath(`${id}.png`) })
			expect((await new AxeBuilder({ page }).include("main").analyze()).violations).toEqual([])
			expect(errors).toEqual([])
		})
	}
}
