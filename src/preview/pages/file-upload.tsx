import { useState } from "react"

import { FormField } from "@/components/base/forms"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import {
	AvatarUpload, FileUpload, ImageUpload, MediaGallery, UploadProgressList, UploadTray,
	defaultFileUploadStrings, type FileRejection, type UploadItem,
} from "@/components/base/upload"

import { MEASURE } from "../partials/measures"
import { SAMPLE_IMAGES, SAMPLE_IMAGE_URL } from "../partials/sample-images"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const QUEUE: UploadItem[] = [
	{ id: "1", name: "report.pdf", size: 234_400, status: "uploading", progress: 62 },
	{ id: "2", name: "photo.jpg", size: 1_100_000, status: "done" },
	{ id: "3", name: "big.zip", size: 85_800_000, status: "error", error: "Larger than 5 MB." },
]

export function FileUploadPage() {
	const [files, setFiles] = useState<File[]>([])
	const [rejected, setRejected] = useState<FileRejection[]>([])
	const [error, setError] = useState<string>()
	const [images, setImages] = useState<File[]>(SAMPLE_IMAGES)
	const items = QUEUE

	return (
		<ComponentPage
			title="Upload"
			summary="Choosing files, one image, and files on their way — one family. A dropzone and a picker, an image picker that previews in its final shape, and progress for transfers the caller runs. Nothing here transfers anything: the value is File objects, and sending them is the caller's business."
			importPath="@/components/base/upload"
			exports={["FileUpload", "Dropzone", "FilePickerInput", "PreviewImage", "ImageUpload", "AvatarUpload", "UploadProgressList", "UploadTray", "MediaGallery", "useFileDropTarget", "validateFileSelection"
			]}
		>
			<Example
				id="file-upload"
				title="FileUpload"
				description="A labelled region with a real file input stretched over it, not a div with drag handlers — browsing has to work from the keyboard, and drag-and-drop is the enhancement on top."
				stacked
				code={`<FileUpload
  multiple
  accept=".pdf,image/*"
  maxSizeBytes={5 * 1024 * 1024}
  maxFiles={4}
  value={files}
  onValueChange={setFiles}
  onRejectedFiles={setRejected}
/>`}
			>
				<Stack gap="xl" style={MEASURE.wide}>
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
			</Example>

			<Example id="upload-rule" title="Validation is not the dialog's job" stacked>
				<Callout label="Rule">
					<code>accept</code> is a hint to the file dialog, not a guarantee: a dropped file
					never passed through the dialog, and the dialog itself offers an “all files”
					escape. Every constraint is re-checked here, and each file gets its own verdict —
					one refusal out of eight still lets the other seven through, and says which
					failed and why.
				</Callout>
			</Example>

			<Example
				id="media-upload"
				title="One image: AvatarUpload and ImageUpload"
				description="Add an image, replace it, or remove it. The second set starts with a stored image. On touch screens, a small edit strip keeps the change action visible."
				stacked
				code={`<AvatarUpload onValueChange={setAvatar} />
<ImageUpload previewUrl={coverUrl} onValueChange={setCover} />`}
			>
				<Stack direction={{ base: "vertical", sm: "horizontal" }} gap="2xl" align="start" style={{ width: "100%" }}>
					<Stack gap="xl" style={MEASURE.field}>
						<FormField label="Profile photo" helperText="Nothing stored yet.">
							<AvatarUpload />
						</FormField>
						<FormField label="Cover image" helperText="PNG or JPEG, up to 2 MB." error={error}>
							<ImageUpload accept="image/png,image/jpeg" maxSizeBytes={2_000_000}
								onRejectedFiles={(rejections) => setError(defaultFileUploadStrings.rejection(rejections[0]!))}
								onValueChange={() => setError(undefined)} />
						</FormField>
					</Stack>
					<Stack gap="xl" style={MEASURE.field}>
						<FormField label="Profile photo" helperText="Your current profile photo.">
							<AvatarUpload previewUrl={SAMPLE_IMAGE_URL} />
						</FormField>
						<FormField label="Cover image" helperText="Choosing a file replaces it.">
							<ImageUpload previewUrl={SAMPLE_IMAGE_URL} />
						</FormField>
					</Stack>
				</Stack>
			</Example>

			<Example
				id="upload-queue"
				title="Files on their way: upload progress"
				description="Each row shows what its status means: a spinner and a bar while it moves, a check when it lands, the reason and a retry when it fails. The component owns none of that state."
				stacked
				code={`<UploadProgressList items={items} onRetry={retry} onRemove={remove} />`}
			>
				<Stack style={MEASURE.wide}>
					<UploadProgressList items={items} onRetry={() => {}} onRemove={() => {}} />
				</Stack>
			</Example>

			<Example
				id="upload-tray"
				title="UploadTray"
				description="The same rows with a drop target above them and a summary beneath — for uploads that outlive the screen they started on. Adding files does NOT write to items: the tray reports the drop, the caller starts the transfer and reports back, which is what keeps one tray usable over fetch, XHR, or a resumable protocol."
				stacked
				code={`<UploadTray
  items={items}
  onAddFiles={start}
  onRetry={retry}
  onRemove={remove}
  onClearAll={clear}
/>`}
			>
				<Stack style={MEASURE.wide}>
					<UploadTray
						items={items}
						onAddFiles={() => {}}
						onRetry={() => {}}
						onRemove={() => {}}
						onClearAll={() => {}}
					/>
				</Stack>
			</Example>

			<Example
				id="media-gallery"
				title="MediaGallery"
				description="Chosen images as reorderable tiles rather than a list of filenames — a gallery, where the ORDER is part of the value and the first tile is the cover. Pass showCover={false} when the order carries no meaning; a badge saying “Cover” on a set that has no cover is worse than no badge."
				stacked
				code={`<MediaGallery
  value={images}
  onValueChange={setImages}
  maxFiles={6}
/>`}
			>
				<Stack style={MEASURE.wide}>
					<MediaGallery value={images} onValueChange={setImages} maxFiles={6} />
				</Stack>
			</Example>

			<Example id="upload-queue-rule" title="It reports, it does not transfer" stacked>
				<Callout label="Rule">
					Nothing in this family uploads. The queue renders the status the caller hands
					it, so the same list works over fetch, XHR, a resumable protocol, or a mock in
					a test — and the component never has to know which.
				</Callout>
			</Example>

			<Example id="file-upload-api" title="FileUpload API">
				<PropTable owner="FileUpload"
					rows={[
						{ name: "value / onValueChange", type: "File[]", description: "The chosen files. Controlled." },
						{ name: "accept / maxFiles / maxSizeBytes", type: "string / number / number", description: "Constraints. Checked before onValueChange, not after." },
						{ name: "onRejectedFiles", type: "(rejections: FileRejection[]) => void", description: "Files that failed validation, with a reason code each." },
						{ name: "multiple / selectionMode", type: 'boolean / "replace" | "append"', description: "Whether more than one file is accepted, and whether a second drop replaces the set or adds to it." },
						{ name: "compact", type: "boolean", default: "false", description: "A single row rather than a panel, for a zone inside a form rather than one owning a page." },
						{ name: "showList / showRejections", type: "boolean", default: "true", description: "The chosen files and the refused ones. Turn them off only when something else on the page shows them." },
						{ name: "invalid / hint", type: "boolean / ReactNode", description: "Field state and the line under the zone — the constraint text a reader needs BEFORE they choose." },
						{ name: "useFileDropTarget", type: "hook", description: "The drop behaviour on its own, for a custom target." },
						{ name: "validateFileSelection", type: "function", description: "The same validation as a plain call, so a caller can pre-check." },
						{ name: "Dropzone", type: "component", description: "The drop target on its own, for a surface that wants the drag behaviour without FileUpload\u2019s list and validation around it." },
						{ name: "FilePickerInput", type: "component", description: "The hidden <input type=\"file\"> and the control that opens it, so a caller can put the browse affordance anywhere without re-deriving the accept and multiple wiring." },
						{ name: "PreviewImage", type: "component", description: "A thumbnail for a File that has not been uploaded yet. It owns the object URL and revokes it on unmount \u2014 the leak that makes a long upload session grow without bound." },
					]}
				/>
			</Example>
			<Example id="image-upload-api" title="ImageUpload and AvatarUpload API">
				<PropTable owner="ImageUpload"
					rows={[
						{ name: "previewUrl", type: "string", description: "An already-stored image. Uncontrolled removal clears its preview. When value is controlled, clear both value and previewUrl in onValueChange to remove it." },
						{ name: "value / onValueChange", type: "File | null", description: "The chosen file." },
						{ name: "AvatarUpload", type: "component", description: "The round variant, sized for a profile image." },
						{ name: "accept / maxSizeBytes", type: "string / number", description: "Constraints, same as FileUpload." },
						{ name: "onRejectedFiles", type: "(rejections: FileRejection[]) => void", description: "Report invalid files through FormField's error prop. Error and helper text are associated with the native input." },
					]}
				/>
			</Example>
			<Example id="upload-queue-api" title="Upload queue API">
				<PropTable owner="UploadTray"
					rows={[
						{ name: "items", type: "UploadItem[]", description: "id, name, size, status, and progress or error. Entirely caller-owned." },
						{ name: "status", api: "UploadItem.status", type: '"queued" | "uploading" | "done" | "error"', description: "Drives the row's icon, bar, and trailing control." },
						{ name: "onRetry / onRemove", type: "(id: string) => void", description: "Supplying them renders the retry and dismiss controls." },
						{ name: "UploadTray", type: "component", description: "The same list docked as a tray, for uploads that outlive the page they started on." },
						{ name: "MediaGallery", type: "component", description: "Chosen images as reorderable tiles, for a gallery rather than a queue." },
						{ name: "UploadTray onCancel / onClearAll / strings", type: "(id) => void / () => void / Partial<UploadTrayStrings>", description: "Stopping one transfer and emptying the tray. Supplying the handlers is what renders the controls; `strings` names them." },
						{ name: "UploadTray showSummary", type: "boolean", default: "true", description: "The counts row above the list — \"Uploading 1, Uploaded 1, Failed 1\"." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
