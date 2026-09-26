import type { FileConstraints, FileRejection } from "./upload.types"

export interface ValidateOptions extends FileConstraints {
	incoming: File[]
	current: File[]
	maxFiles: number
	/** Adds to the current list rather than replacing it. */
	append: boolean
}

export interface ValidationResult {
	accepted: File[]
	nextFiles: File[]
	rejections: FileRejection[]
}

/** Identity for duplicate detection: name alone is not enough, and a `File` has no id. */
function fingerprint(file: File) {
	return [file.name, file.size, file.type, file.lastModified].join("|")
}

/** `accept` is only a hint to the dialog (drops bypass it), so it is enforced here too. */
function matchesAccept(file: File, accept?: string) {
	if (!accept?.trim()) return true

	const name = file.name.toLowerCase()
	const type = file.type.toLowerCase()

	return accept
		.split(",")
		.map((part) => part.trim().toLowerCase())
		.filter(Boolean)
		.some((rule) => {
			if (rule.startsWith(".")) return name.endsWith(rule)
			if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1))
			return type === rule
		})
}

function validateOne(file: File, options: FileConstraints): FileRejection | undefined {
	const { accept, minSizeBytes, maxSizeBytes, validateFile } = options

	if (!matchesAccept(file, accept)) {
		return { file, code: "invalid-type", details: {} }
	}
	if (minSizeBytes !== undefined && file.size < minSizeBytes) {
		return { file, code: "too-small", details: { limitBytes: minSizeBytes } }
	}
	if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
		return { file, code: "too-large", details: { limitBytes: maxSizeBytes } }
	}

	if (validateFile) {
		let result: boolean | string
		try {
			result = validateFile(file)
		} catch {
			// A validator that throws is one rejection, not a crash of the whole selection.
			result = false
		}
		if (result !== true) {
			return {
				file,
				code: "custom",
				details: { customMessage: typeof result === "string" ? result : undefined },
			}
		}
	}

	return undefined
}

/** Validates a selection; each file gets its own verdict, so one rejection does not stop the rest. */
export function validateFileSelection({
	incoming,
	current,
	maxFiles,
	append,
	...constraints
}: ValidateOptions): ValidationResult {
	const nextFiles = append ? [...current] : []
	const seen = new Set(nextFiles.map(fingerprint))
	const accepted: File[] = []
	const rejections: FileRejection[] = []

	for (const file of incoming) {
		const rejection = validateOne(file, constraints)
		if (rejection) {
			rejections.push(rejection)
			continue
		}

		const id = fingerprint(file)
		if (seen.has(id)) {
			rejections.push({ file, code: "duplicate", details: {} })
			continue
		}
		if (nextFiles.length >= maxFiles) {
			rejections.push({ file, code: "too-many", details: { maxFiles } })
			continue
		}

		accepted.push(file)
		nextFiles.push(file)
		seen.add(id)
	}

	return { accepted, nextFiles, rejections }
}
