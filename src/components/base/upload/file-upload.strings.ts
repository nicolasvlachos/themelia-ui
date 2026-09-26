import { formatFileSize } from "@/components/primitives"

import type { FileConstraints, FileRejection } from "./upload.types"

export interface FileUploadStrings {
	/** The drop target's prompt, singular and plural (two keys, since plurals vary by language). */
	instruction: string
	instructionMultiple: string
	/** Replaces the prompt while a file is over the zone. Falls back to Dropzone's own. */
	dragOver?: string
	/** Announced while a transfer is in flight, named after the file. */
	uploading: (name: string) => string
	/** Names each row's remove control, after the file it removes. */
	remove: (name: string) => string
	/** One refused file as a sentence, from the whole rejection (file, code, bound). */
	rejection: (rejection: FileRejection) => string
	/**
	 * The hint built from the constraints when no `hint` is given ("image/* · up to 5 MB");
	 * empty for none. Optional so older complete strings objects still type-check.
	 */
	constraintHint?: (constraints: Pick<FileConstraints, "accept" | "maxSizeBytes">) => string
}

export const defaultFileUploadStrings: FileUploadStrings = {
	instruction: "Drop a file here, or browse",
	instructionMultiple: "Drop files here, or browse",
	uploading: (name) => `Uploading ${name}`,
	remove: (name) => `Remove ${name}`,
	rejection: ({ file, code, details }) => {
		switch (code) {
			case "invalid-type":
				return `${file.name} is not an accepted file type.`
			case "too-small":
				return `${file.name} is smaller than ${formatFileSize(details.limitBytes ?? 0)}.`
			case "too-large":
				return `${file.name} is larger than ${formatFileSize(details.limitBytes ?? 0)}.`
			case "duplicate":
				return `${file.name} has already been added.`
			case "too-many":
				return `${file.name} exceeds the limit of ${details.maxFiles ?? 0} file${details.maxFiles === 1 ? "" : "s"}.`
			// A validator's own message wins; without one this is all that can be said.
			default:
				return details.customMessage ?? `${file.name} was rejected.`
		}
	},
	constraintHint: ({ accept, maxSizeBytes }) =>
		[accept, maxSizeBytes === undefined ? undefined : `up to ${Math.round(maxSizeBytes / 1024 / 1024)} MB`]
			.filter(Boolean)
			.join(" · "),
}
