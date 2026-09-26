import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

/* Every test starts from an empty document, so one root cannot leave state for the next. */
afterEach(() => {
	/* SSR test files run in the `node` environment, where there is no document to clean. */
	if (typeof document === "undefined") return

	cleanup()
	for (const element of [document.documentElement, document.body]) {
		for (const attribute of [...element.attributes]) {
			if (attribute.name.startsWith("data-")) element.removeAttribute(attribute.name)
		}
	}
})
