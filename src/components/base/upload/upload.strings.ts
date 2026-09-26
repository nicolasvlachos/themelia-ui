import { defaultFileUploadStrings, type FileUploadStrings } from "./file-upload.strings"

export interface MediaGalleryStrings {
	/** Badge on the first tile (hidden with `showCover={false}`). */
	cover: string
	/** The tile that opens the file picker. */
	add: string
	/** Names a tile, with its position and how to move it. */
	position: (name: string, index: number, total: number) => string
	/** Names the control that removes one tile, after its file. */
	remove: (name: string) => string
}

export const defaultMediaGalleryStrings: MediaGalleryStrings = {
	cover: "Cover",
	add: "Add images",
	position: (name, index, total) =>
		`${name}, position ${index} of ${total}. Use the arrow keys to reorder.`,
	remove: (name) => `Remove ${name}`,
}

export interface MediaUploadStrings {
	/** Shown in the empty frame, and again over a filled one. */
	empty: string
	overlay: string
	/** Names the control that discards the current file. */
	remove: string
}

export const defaultAvatarUploadStrings: MediaUploadStrings = {
	empty: "Add a photo",
	overlay: "Change photo",
	remove: "Remove photo",
}

export const defaultImageUploadStrings: MediaUploadStrings = {
	empty: "Drop an image here, or browse",
	overlay: "Change image",
	remove: "Remove image",
}

export interface UploadProgressListStrings {
	/** A word per row status; keyed by status, so a new status is a type error until named. */
	status: Record<"queued" | "uploading" | "done" | "error" | "cancelled", string>
	/** The three row controls, each named after the file it acts on. */
	cancel: (name: string) => string
	retry: (name: string) => string
	remove: (name: string) => string
	/** Names the progress bar of a row that is mid-upload. */
	uploading: (name: string) => string
	/**
	 * Announced when a row finishes (uploaded, failed or cancelled). Optional so older
	 * complete strings objects still type-check.
	 */
	settled?: (name: string, status: string) => string
}

export const defaultUploadProgressListStrings: UploadProgressListStrings = {
	status: {
		queued: "Queued",
		uploading: "Uploading",
		done: "Uploaded",
		error: "Failed",
		cancelled: "Cancelled",
	},
	cancel: (name) => `Cancel ${name}`,
	retry: (name) => `Retry ${name}`,
	remove: (name) => `Remove ${name}`,
	uploading: (name) => `Uploading ${name}`,
	settled: (name, status) => `${name}: ${status}`,
}

/* An UploadTray is a FileUpload with a list, so its strings extend both. */
export interface UploadTrayStrings extends FileUploadStrings, UploadProgressListStrings {
	/** The control that empties the tray. */
	clearAll: string
}

export const defaultUploadTrayStrings: UploadTrayStrings = {
	...defaultFileUploadStrings,
	...defaultUploadProgressListStrings,
	clearAll: "Clear all",
}

export interface DropzoneStrings {
	/** The prompt, singular and plural (two keys, since plurals vary by language). */
	instruction: string
	instructionMultiple: string
	/** Replaces the prompt while something is over the box. */
	dragOver: string
	/** A second line under the prompt — the accepted types, the size cap. */
	helper: string
}

export const defaultDropzoneStrings: DropzoneStrings = {
	instruction: "Drop a file here, or browse",
	instructionMultiple: "Drop files here, or browse",
	dragOver: "Release to add",
	helper: "",
}

export interface FilePickerStrings {
	/** Shown when nothing is chosen. */
	empty: string
	clear: string
}

export const defaultFilePickerStrings: FilePickerStrings = {
	empty: "No file chosen",
	clear: "Remove file",
}
