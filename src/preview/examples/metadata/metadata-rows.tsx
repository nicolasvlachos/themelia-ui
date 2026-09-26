import { MetadataList } from "themelia-ui/base/display"

import { FACTS } from "./data"

export default function MetadataRows() {
	return (
		<MetadataList layout="rows" itemSeparator items={FACTS} />
	)
}
