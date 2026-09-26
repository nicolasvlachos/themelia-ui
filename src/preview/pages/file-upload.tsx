import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FileUploadPage() {
	return (
		<ComponentPage>
			<Example
				example="file-upload/file-upload"
				title="FileUpload"
				description="A labelled region with a real file input stretched over it, not a div with drag handlers — browsing has to work from the keyboard, and drag-and-drop is the enhancement on top."
			/>

			<Example id="upload-rule" title="Validation is not the dialog's job">
				<Callout label="Rule">
					<code>accept</code> is a hint to the file dialog, not a guarantee: a dropped file
					never passed through the dialog, and the dialog itself offers an “all files”
					escape. Every constraint is re-checked here, and each file gets its own verdict —
					one refusal out of eight still lets the other seven through, and says which
					failed and why.
				</Callout>
			</Example>

			<Example
				example="file-upload/media-upload"
				title="One image: AvatarUpload and ImageUpload"
				description="Add an image, replace it, or remove it. The second set starts with a stored image. On touch screens, a small edit strip keeps the change action visible."
			/>

			<Example
				example="file-upload/upload-queue"
				title="Files on their way: upload progress"
				description="Each row shows what its status means: a spinner and a bar while it moves, a check when it lands, the reason and a retry when it fails. The component owns none of that state."
			/>

			<Example
				example="file-upload/upload-tray"
				title="UploadTray"
				description="The same rows with a drop target above them and a summary beneath — for uploads that outlive the screen they started on. Adding files does NOT write to items: the tray reports the drop, the caller starts the transfer and reports back, which is what keeps one tray usable over fetch, XHR, or a resumable protocol."
			/>

			<Example
				example="file-upload/media-gallery"
				title="MediaGallery"
				description="Chosen images as reorderable tiles rather than a list of filenames — a gallery, where the ORDER is part of the value and the first tile is the cover. Pass showCover={false} when the order carries no meaning; a badge saying “Cover” on a set that has no cover is worse than no badge."
			/>

			<Example id="upload-queue-rule" title="It reports, it does not transfer">
				<Callout label="Rule">
					Nothing in this module uploads. The queue renders the status the caller hands
					it, so the same list works over fetch, XHR, a resumable protocol, or a mock in
					a test — and the component never has to know which.
				</Callout>
			</Example>

			<Example id="file-upload-api" title="FileUpload API">
				<PropTable owner="FileUpload" />
				<PropTable symbols={["useFileDropTarget", "validateFileSelection", "Dropzone", "FilePickerInput", "PreviewImage"]} />
			</Example>
			<Example id="image-upload-api" title="ImageUpload and AvatarUpload API">
				<PropTable owner="ImageUpload" />
				<PropTable symbols={["AvatarUpload"]} />
			</Example>
			<Example id="upload-queue-api" title="Upload queue API">
				<PropTable owners={["UploadTray", "UploadItem"]} />
				<PropTable symbols={["MediaGallery"]} />
			</Example>
		</ComponentPage>
	)
}
