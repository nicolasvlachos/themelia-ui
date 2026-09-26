import { SearchIcon } from "lucide-react"

import { Empty, SearchGlassIllustration } from "themelia-ui/base/feedback"
import { Grid } from "themelia-ui/base/structure"

export default function EmptyMedia() {
	return (
		<Grid columns={{ base: 1, md: 3 }} gap="xl">
			<Empty
				padding="sm"
				border
				mediaVariant="icon"
				media={<SearchIcon />}
				title="icon"
				description="A glyph in a muted tile."
			/>
			<Empty
				padding="sm"
				border
				mediaVariant="icon-soft"
				media={<SearchIcon />}
				title="icon-soft"
				description="The same tile, quieter."
			/>
			<Empty
				padding="sm"
				border
				mediaVariant="illustration"
				media={<SearchGlassIllustration />}
				title="illustration"
				description="No chrome, and room below."
			/>
		</Grid>
	)
}
