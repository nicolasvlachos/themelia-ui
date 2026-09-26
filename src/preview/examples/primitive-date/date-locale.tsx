import { de, ja } from "date-fns/locale"

import { MetadataList } from "themelia-ui/base/display"
import { DatePrimitive } from "themelia-ui/primitives"
import { UIProvider } from "themelia-ui/ui-provider"

import { WHEN } from "./data"

export default function DateLocale() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" /> },
				{
					label: "German names",
					value: (
						<UIProvider config={{ dates: { locale: de } }}>
							<DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />
						</UIProvider>
					),
				},
				{
					label: "Japanese names",
					value: (
						<UIProvider config={{ dates: { locale: ja } }}>
							<DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />
						</UIProvider>
					),
				},
			]}
		/>
	)
}
