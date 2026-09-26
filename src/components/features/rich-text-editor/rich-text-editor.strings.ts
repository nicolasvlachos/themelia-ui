export interface RichTextEditorStrings {
	/** Names the editable surface for a screen reader. */
	editorLabel: string
	/** Names the HTML source textarea. */
	sourceLabel: string
	/** Names the formatting toolbar as a whole. */
	toolbarLabel?: string
	/** Toolbar labels. Each is both the accessible name and the tooltip. */
	toolbar: {
		bold: string
		italic: string
		strike: string
		bulletList: string
		orderedList: string
		blockquote: string
		undo: string
		redo: string
		sourceCode: string
	}
	counts: {
		characters: string
		words: string
	}
}

export const defaultRichTextEditorStrings: RichTextEditorStrings = {
	editorLabel: "Rich text editor",
	sourceLabel: "HTML source",
	toolbarLabel: "Formatting",
	toolbar: {
		bold: "Bold",
		italic: "Italic",
		strike: "Strike",
		bulletList: "Bullet list",
		orderedList: "Ordered list",
		blockquote: "Quote",
		undo: "Undo",
		redo: "Redo",
		sourceCode: "Source code",
	},
	counts: {
		characters: "characters",
		words: "words",
	},
}

/** Resolved fallback when an older complete strings object omits the additive label. */
export const defaultRichTextEditorToolbarLabel = "Formatting"
