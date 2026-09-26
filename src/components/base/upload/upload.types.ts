/** Stable, machine-readable reason a local file was refused. */
export type FileRejectionCode =
	| "invalid-type"
	| "too-small"
	| "too-large"
	| "too-many"
	| "duplicate"
	| "custom"

/** The numbers behind a rejection, for the component to write copy from. */
export interface FileRejectionDetails {
	/** The bound that was exceeded, in bytes. */
	limitBytes?: number
	/** The file cap, for `too-many`. */
	maxFiles?: number
	/** Only ever what a `FileValidator` returned. Nothing here is written by the kit. */
	customMessage?: string
}

/** One refused file: a code and numbers, which `FileUploadStrings` turns into a sentence. */
export interface FileRejection {
	file: File
	code: FileRejectionCode
	details: FileRejectionDetails
}

/** Return `true` to accept, `false` for the default message, or a message of your own. */
export type FileValidator = (file: File) => boolean | string

export interface FileConstraints {
	/** Native accept filter, e.g. `.pdf,image/*`. Enforced here as well as by the dialog. */
	accept?: string
	minSizeBytes?: number
	maxSizeBytes?: number
	/** Runs after the type and size checks. */
	validateFile?: FileValidator
}
