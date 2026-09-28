import { useState } from "react"

import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { AvatarUpload, ImageUpload, defaultFileUploadStrings } from "themelia-ui/base/upload"

import { SAMPLE_IMAGE_URL } from "../../partials/sample-images"

export default function MediaUpload() {
	const [error, setError] = useState<string>()

	return (
		<Stack direction={{ base: "vertical", sm: "horizontal" }} align="start" style={{ width: "100%" }}>
			<Stack style={{ maxWidth: "26rem", width: "100%" }}>
				<FormField label="Profile photo" helperText="Nothing stored yet.">
					<AvatarUpload />
				</FormField>
				<FormField label="Cover image" helperText="PNG or JPEG, up to 2 MB." error={error}>
					<ImageUpload accept="image/png,image/jpeg" maxSizeBytes={2_000_000}
						onRejectedFiles={(rejections) => setError(defaultFileUploadStrings.rejection(rejections[0]!))}
						onValueChange={() => setError(undefined)} />
				</FormField>
			</Stack>
			<Stack style={{ maxWidth: "26rem", width: "100%" }}>
				<FormField label="Profile photo" helperText="Your current profile photo.">
					<AvatarUpload previewUrl={SAMPLE_IMAGE_URL} />
				</FormField>
				<FormField label="Cover image" helperText="Choosing a file replaces it.">
					<ImageUpload previewUrl={SAMPLE_IMAGE_URL} />
				</FormField>
			</Stack>
		</Stack>
	)
}
