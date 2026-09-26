import { MetadataList } from "themelia-ui/base/display"

import { FACTS } from "./data"

export default function MetadataDensity() {
	return (
		<MetadataList density="compact" columns={2} items={FACTS.slice(0, 4)} title="Invoice" titleSeparator />
	)
}
