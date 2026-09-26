import { MetadataList } from "themelia-ui/base/display"
import { InlineList } from "themelia-ui/primitives"

import { THREE } from "./data"

export default function InlineListLocale() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "British English", value: <InlineList items={THREE} locale="en-GB" /> },
				{ label: "American English", value: <InlineList items={THREE} locale="en-US" /> },
				{ label: "Spanish", value: <InlineList items={THREE} locale="es-ES" /> },
				{ label: "German", value: <InlineList items={THREE} locale="de-DE" /> },
				{ label: "Japanese", value: <InlineList items={THREE} locale="ja-JP" /> },
			]}
		/>
	)
}
