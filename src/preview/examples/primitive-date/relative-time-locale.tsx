import { de } from "date-fns/locale"

import { MetadataList } from "themelia-ui/base/display"
import { RelativeTime } from "themelia-ui/primitives"
import { UIProvider } from "themelia-ui/ui-provider"

import { DAYS_AGO, NOW } from "./data"

export default function RelativeTimeLocale() {
	return (
		<MetadataList
			layout="rows"
			items={[
				{ label: "Default", value: <RelativeTime value={DAYS_AGO} now={NOW} /> },
				{
					label: "German wording",
					value: (
						<UIProvider config={{ dates: { locale: de } }}>
							<RelativeTime value={DAYS_AGO} now={NOW} />
						</UIProvider>
					),
				},
				{
					label: "Custom wording",
					value: (
						<UIProvider
							config={{
								dates: {
									formatRelativeTime: (date, now) =>
										`${Math.round((now.getTime() - date.getTime()) / 86_400_000)}d`,
								},
							}}
						>
							<RelativeTime value={DAYS_AGO} now={NOW} />
						</UIProvider>
					),
				},
			]}
		/>
	)
}
