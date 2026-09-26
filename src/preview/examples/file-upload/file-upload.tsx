import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"
import { FileUpload, type FileRejection } from "themelia-ui/base/upload"

import { SAMPLE_IMAGES } from "../../partials/sample-images"

export default function FileUploadExample() {
	const [files, setFiles] = useState<File[]>([])
	const [rejected, setRejected] = useState<FileRejection[]>([])

	return (
		<Stack gap="xl" style={{ maxWidth: "34rem", width: "100%" }}>
			<FormField label="Attachments" helperText="Drag files in, or click to browse.">
				<FileUpload
					multiple
					accept=".pdf,image/*"
					maxSizeBytes={5 * 1024 * 1024}
					maxFiles={4}
					value={files}
					onValueChange={setFiles}
					onRejectedFiles={setRejected}
				/>
			</FormField>
			{rejected.length > 0 && (
				<Text size="xs" type="secondary">
					Last refusal code: {rejected[0]?.code}
				</Text>
			)}
			<FormField label="Compact" helperText="A single row, for a zone inside a form rather than one owning a page.">
				<FileUpload compact accept=".csv" />
			</FormField>
			<FormField label="With transfer progress">
				{/* Seeded with files: `progress` is keyed by file name. */}
				<FileUpload
					multiple
					value={SAMPLE_IMAGES}
					progress={{ "cover.png": 62, "detail.png": 100 }}
					hint="Pass progress keyed by file name; this component does not transfer."
				/>
			</FormField>
			<FormField label="Invalid" error="At least one attachment is required.">
				<FileUpload invalid />
			</FormField>
		</Stack>
	)
}
