import { MetadataList, type MetadataInlineListItem } from "themelia-ui/base/display"
import { Stack } from "themelia-ui/base/structure"

// Typed for the inline layout, which has no second line to put a description on.
const SUMMARY: MetadataInlineListItem[] = [
	{ label: "Created", value: { kind: "date", value: "2026-08-14" } },
	{ label: "By", value: "Alice Mercer" },
	{ label: "Version", value: { kind: "mono", value: "v3.2" } },
]

export default function MetadataInline() {
	return (
		<Stack>
			<MetadataList layout="inline" itemSeparator items={SUMMARY} />
			<MetadataList layout="inline" itemSeparator="—" size="sm" items={SUMMARY} />
		</Stack>
	)
}
