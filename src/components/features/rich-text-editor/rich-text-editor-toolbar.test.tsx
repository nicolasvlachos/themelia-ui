import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BoldIcon, ItalicIcon } from "lucide-react"
import { describe, expect, it, vi } from "vitest"

import { defaultRichTextEditorStrings } from "./rich-text-editor.strings"
import { RichTextEditorToolbar } from "./rich-text-editor-toolbar"

describe("RichTextEditorToolbar", () => {
	it("composes the shared named toolbar and its roving focus model", async () => {
		render(
			<RichTextEditorToolbar
				buttons={[
					{ id: "bold", icon: BoldIcon, label: "Bold", isActive: () => false, run: vi.fn() },
					{ id: "italic", icon: ItalicIcon, label: "Italic", isActive: () => false, run: vi.fn() },
				]}
				hideSourceToggle
				sourceMode={false}
				toggleSourceMode={vi.fn()}
				strings={defaultRichTextEditorStrings}
			/>,
		)

		const toolbar = screen.getByRole("toolbar", { name: "Formatting" })
		expect(toolbar).toHaveClass("rich-text-editor-toolbar--component", "toolbar--component")

		const bold = screen.getByRole("button", { name: "Bold" })
		const italic = screen.getByRole("button", { name: "Italic" })
		expect([bold, italic].filter((button) => button.tabIndex === 0)).toHaveLength(1)

		bold.focus()
		await userEvent.keyboard("{ArrowRight}")
		expect(italic).toHaveFocus()
	})
})
