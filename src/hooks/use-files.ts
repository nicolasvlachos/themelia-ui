/**
 * useFiles — selection, validation and de-duplication for a file input. It writes no
 * copy (a rejection carries a code and its numbers; the component's strings make the
 * message) and does not upload.
 */
import { useCallback, useRef, useState } from "react"

import { formatFileSize } from "@/components/primitives"

export type FileRejectionCode =
	| "invalid-type"
	| "too-small"
	| "too-large"
	| "too-many"
	| "duplicate"
	| "custom"

/** The numbers behind a rejection, for the component to write copy from. */
export interface FileRejectionDetails {
	extension?: string
	minimumBytes?: number
	maximumBytes?: number
	maximumFiles?: number
	/** Only ever what a `customValidator` returned. The hook writes no prose. */
	customMessage?: string
}

export interface FileRejection {
	file: File
	code: FileRejectionCode
	details: FileRejectionDetails
}

export interface FileValidationRules {
	maxSize?: number
	minSize?: number
	/** With or without the dot, in any case: "pdf", ".PDF". */
	allowedExtensions?: string[]
	maxFiles?: number
	/** `true` accepts; a string rejects with that message; `false` rejects without one. */
	customValidator?: (file: File) => boolean | string
}

export interface FileMeta {
	id: string
	file: File
	name: string
	size: number
	/** Already formatted, so a list does not format the same number on every render. */
	formattedSize: string
	type: string
	extension: string
	lastModified: number
}

export interface FileProcessingResult {
	accepted: FileMeta[]
	/** The whole set after this call, accepted entries included. */
	files: FileMeta[]
	rejections: FileRejection[]
}

export interface UseFilesReturn {
	files: FileMeta[]
	/** Appends. Returns what happened, so a caller can react without an effect. */
	addFiles: (incoming: FileList | File[]) => FileProcessingResult
	/** Replaces. */
	setFiles: (incoming: FileList | File[]) => FileProcessingResult
	remove: (id: string) => void
	removeAll: () => void
	rejections: FileRejection[]
	/** The same rejections keyed by file name, for a per-row lookup. */
	rejectionsByName: Record<string, FileRejection>
}

/* A counter beside the timestamp: files picked in the same millisecond need distinct ids. */
let counter = 0
function nextId() {
	return `${Date.now().toString(36)}-${(counter++).toString(36)}`
}

function extensionOf(file: File) {
	return file.name.split(".").pop()?.toLowerCase() ?? ""
}

/** Identity for de-duplication: name, size, type and mtime (File objects differ per pick). */
function fingerprint(file: File) {
	return `${file.name} ${file.size} ${file.type} ${file.lastModified}`
}

function toMeta(file: File): FileMeta {
	return {
		id: nextId(),
		file,
		name: file.name,
		size: file.size,
		formattedSize: formatFileSize(file.size),
		type: file.type,
		extension: extensionOf(file),
		lastModified: file.lastModified,
	}
}

function validate(file: File, rules?: FileValidationRules): FileRejection | undefined {
	const extension = extensionOf(file)

	if (rules?.minSize !== undefined && file.size < rules.minSize) {
		return { file, code: "too-small", details: { minimumBytes: rules.minSize } }
	}
	if (rules?.maxSize !== undefined && file.size > rules.maxSize) {
		return { file, code: "too-large", details: { maximumBytes: rules.maxSize } }
	}
	if (
		rules?.allowedExtensions &&
		!rules.allowedExtensions.some(
			(allowed) => allowed.toLowerCase().replace(/^\./, "") === extension,
		)
	) {
		return { file, code: "invalid-type", details: { extension } }
	}
	if (rules?.customValidator) {
		let result: boolean | string
		// A validator that throws rejects the file rather than taking the picker down.
		try {
			result = rules.customValidator(file)
		} catch {
			result = false
		}
		if (result !== true) {
			return {
				file,
				code: "custom",
				details: { customMessage: typeof result === "string" && result ? result : undefined },
			}
		}
	}
	return undefined
}

export function useFiles(rules?: FileValidationRules): UseFilesReturn {
	const [files, setFilesState] = useState<FileMeta[]>([])
	const [rejections, setRejections] = useState<FileRejection[]>([])
	/* A ref beside the state, so two picks in one tick de-duplicate against the current set. */
	const current = useRef<FileMeta[]>([])

	const process = useCallback(
		(incoming: FileList | File[], replace: boolean): FileProcessingResult => {
			const list = Array.isArray(incoming) ? incoming : Array.from(incoming)
			const previous = current.current
			let next = replace ? [] : [...previous]
			const seen = new Set(next.map((meta) => fingerprint(meta.file)))
			const accepted: FileMeta[] = []
			const rejected: FileRejection[] = []

			for (const file of list) {
				const key = fingerprint(file)
				if (seen.has(key)) {
					rejected.push({ file, code: "duplicate", details: {} })
					continue
				}

				const rejection = validate(file, rules)
				if (rejection) {
					rejected.push(rejection)
					continue
				}

				// Checked after validation, so an invalid file is not what fills the quota.
				if (rules?.maxFiles !== undefined && next.length >= rules.maxFiles) {
					rejected.push({ file, code: "too-many", details: { maximumFiles: rules.maxFiles } })
					continue
				}

				const meta = toMeta(file)
				accepted.push(meta)
				next.push(meta)
				seen.add(key)
			}

			/* A replace that accepted nothing keeps the existing valid selection. */
			if (replace && accepted.length === 0 && rejected.length > 0) next = previous

			current.current = next
			setFilesState(next)
			setRejections(rejected)
			return { accepted, files: next, rejections: rejected }
		},
		[rules],
	)

	const addFiles = useCallback(
		(incoming: FileList | File[]) => process(incoming, false),
		[process],
	)
	const setFiles = useCallback(
		(incoming: FileList | File[]) => process(incoming, true),
		[process],
	)

	const remove = useCallback((id: string) => {
		const next = current.current.filter((meta) => meta.id !== id)
		current.current = next
		setFilesState(next)
	}, [])

	const removeAll = useCallback(() => {
		current.current = []
		setFilesState([])
		setRejections([])
	}, [])

	return {
		files,
		addFiles,
		setFiles,
		remove,
		removeAll,
		rejections,
		rejectionsByName: Object.fromEntries(rejections.map((r) => [r.file.name, r])),
	}
}
