import { MetadataList } from "themelia-ui/base/display"

import { FACTS } from "./data"

export default function MetadataSize() {
	return (
		<MetadataList size="sm" columns={2} items={FACTS.slice(0, 4)} title="Invoice" titleSeparator />
	)
}
