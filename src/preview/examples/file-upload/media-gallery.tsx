import { useState } from "react"

import { Stack } from "themelia-ui/base/structure"
import { MediaGallery } from "themelia-ui/base/upload"

import { SAMPLE_IMAGES } from "../../partials/sample-images"

export default function MediaGalleryExample() {
	const [images, setImages] = useState<File[]>(SAMPLE_IMAGES)

	return (
		<Stack style={{ maxWidth: "34rem", width: "100%" }}>
			<MediaGallery value={images} onValueChange={setImages} maxFiles={6} />
		</Stack>
	)
}
