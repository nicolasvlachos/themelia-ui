import { MetadataList } from "themelia-ui/base/display"

import { FACTS } from "./data"

export default function MetadataGrid() {
	return (
		<MetadataList items={FACTS} columns={3} />
	)
}
