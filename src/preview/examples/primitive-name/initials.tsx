import { MetadataList } from "themelia-ui/base/display"
import { Initials } from "themelia-ui/primitives"

export default function InitialsExample() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "First and last", value: <Initials value="Jane McDonald" /> },
				{ label: "Short name", value: <Initials value="Mei Chen" /> },
				{ label: "One character", value: <Initials value="Jane McDonald" maxCharacters={1} /> },
				{ label: "First two words", value: <Initials value="Ana Sofia Reyes" strategy="first-words" /> },
				{ label: "Three characters", value: <Initials value="Ana Sofia Reyes" maxCharacters={3} /> },
				{ label: "No letters, with fallback", value: <Initials value="—" fallback="?" /> },
				{ label: "No name", value: <Initials value={null} /> },
			]}
		/>
	)
}
