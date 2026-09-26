import { de, ja } from "date-fns/locale"

import { DatePrimitive, DateRange, DateTime, Duration, RelativeTime, Time } from "@/components/primitives"
import { UIProvider } from "@/lib/ui-provider"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"
import { SpecimenList } from "../partials/specimen-list"

const WHEN = new Date("2026-03-12T09:30:00")

const MARCH_3 = new Date("2026-03-03T00:00:00")
const MARCH_7 = new Date("2026-03-07T00:00:00")
const APRIL_2 = new Date("2026-04-02T00:00:00")
const NEXT_JAN = new Date("2027-01-09T00:00:00")

const NOW = new Date("2026-03-12T09:30:00")
const HOURS_AGO = new Date("2026-03-12T06:05:00")
const DAYS_AGO = new Date("2026-03-05T09:30:00")
const MONTHS_AGO = new Date("2025-11-02T09:30:00")
const SECONDS_AGO = new Date("2026-03-12T09:29:38")

export function PrimitiveDatePage() {
	return (
		<ComponentPage
			title="Dates & times"
			summary="A moment, the span between two, how long ago one was, and how long something took. Every date primitive goes through one parse and takes its date-fns locale from the provider’s dates config, so one setting translates all of them. Duration sits beside them as a length rather than a moment — no calendar, no timezone, no daylight saving — which is why it is a separate component."
			importPath="@/components/primitives"
			exports={["DatePrimitive", "Time", "DateTime", "Date", "DateRange", "formatDateRange", "RelativeTime", "Duration"]}
		>
			<Example
				id="date"
				title="Dates and times"
				description="Each renders a <time dateTime> so the value is machine-readable regardless of how it is displayed — which is what makes a formatted date still sortable, copyable, and parseable."
				stacked
				code={`<DatePrimitive value={WHEN} />
<Time value={WHEN} />
<DateTime value={WHEN} />
<DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />
<DatePrimitive value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<DatePrimitive value={WHEN} />`, value: <DatePrimitive value={WHEN} /> },
						{ code: `<Time value={WHEN} />`, value: <Time value={WHEN} /> },
						{ code: `<DateTime value={WHEN} />`, value: <DateTime value={WHEN} /> },
						{ code: `<DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />`, value: <DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" /> },
						{ code: `<DatePrimitive value={null} />`, value: <DatePrimitive value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="date-locale"
				title="Localised names"
				description="date-fns translates month and weekday names from a LOCALE OBJECT, not from a BCP-47 tag. It cannot be derived from `formatting.locale`, because the locales are modules and importing all of them to look one up by tag would put every language in every bundle — so the consumer imports the one it needs and puts it on the provider. NAMES is the whole of it: the pattern owns the order and the punctuation, so `EEEE d MMMM yyyy` under `de` gives “Donnerstag 12 März 2026” where German writes “Donnerstag, 12. März 2026”, and under `ja` it gives day-month-year where Japanese writes year-month-day. That is the intended trade — one date shape across a product is usually what an admin app wants, and `dates.format` is where it lives — but a product that follows each reader’s conventions sets the pattern per locale as well as the locale."
				stacked
				code={`import { de } from "date-fns/locale"

<UIProvider config={{ formatting: { locale: "de-DE" }, dates: { locale: de } }}>
  <DatePrimitive value={when} pattern="EEEE d MMMM yyyy" />
</UIProvider>`}
			>
				<SpecimenList
					items={[
						{
							code: `{/* no dates.locale */}`,
							value: <DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />,
						},
						{
							code: `dates: {{ locale: de }}`,
							value: (
								<UIProvider config={{ dates: { locale: de } }}>
									<DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />
								</UIProvider>
							),
						},
						{
							code: `dates: {{ locale: ja }}`,
							value: (
								<UIProvider config={{ dates: { locale: ja } }}>
									<DatePrimitive value={WHEN} pattern="EEEE d MMMM yyyy" />
								</UIProvider>
							),
						},
					]}
				/>
			</Example>

			<Example id="date-rule" title="date-fns, not hand-rolled Date" stacked>
				<Callout label="Rule">
					Formatting, parsing, and arithmetic go through <code>date-fns</code>. Native{" "}
					<code>Date</code> arithmetic is where month-end, daylight saving, and the
					zero-indexed month all quietly produce wrong answers, and every product
					reinvents the same three helpers to work around it. A primitive still ACCEPTS a
					Date, a string, or a timestamp — it just does not do the maths itself.
				</Callout>
			</Example>

			<Example
				id="date-range"
				title="DateRange"
				description="Same month collapses to 3–7 March; same year keeps both months; across years keeps everything. A format string cannot express that, because which parts are redundant depends on the two values."
				stacked
				code={`<DateRange start={MARCH_3} end={MARCH_7} />
<DateRange start={MARCH_3} end={APRIL_2} />
<DateRange start={MARCH_3} end={NEXT_JAN} />
<DateRange start={MARCH_3} end={APRIL_2} separator=" to " />
<DateRange start={MARCH_3} end={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<DateRange start={MARCH_3} end={MARCH_7} />`, value: <DateRange start={MARCH_3} end={MARCH_7} /> },
						{ code: `<DateRange start={MARCH_3} end={APRIL_2} />`, value: <DateRange start={MARCH_3} end={APRIL_2} /> },
						{ code: `<DateRange start={MARCH_3} end={NEXT_JAN} />`, value: <DateRange start={MARCH_3} end={NEXT_JAN} /> },
						{ code: `<DateRange start={MARCH_3} end={APRIL_2} separator=" to " />`, value: <DateRange start={MARCH_3} end={APRIL_2} separator=" to " /> },
						{ code: `<DateRange start={MARCH_3} end={null} />`, value: <DateRange start={MARCH_3} end={null} /> },
					]}
				/>
			</Example>

			<Example
				id="relative-time"
				title="RelativeTime"
				description="A relative label answers “is this recent?” at a glance and answers nothing else — so the exact timestamp stays in the time element's dateTime rather than being thrown away for it."
				stacked
				code={`<RelativeTime value={HOURS_AGO} now={NOW} />
<RelativeTime value={DAYS_AGO} now={NOW} />
<RelativeTime value={MONTHS_AGO} now={NOW} />
<RelativeTime value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<RelativeTime value={HOURS_AGO} now={NOW} />`, value: <RelativeTime value={HOURS_AGO} now={NOW} /> },
						{ code: `<RelativeTime value={DAYS_AGO} now={NOW} />`, value: <RelativeTime value={DAYS_AGO} now={NOW} /> },
						{ code: `<RelativeTime value={MONTHS_AGO} now={NOW} />`, value: <RelativeTime value={MONTHS_AGO} now={NOW} /> },
						{ code: `<RelativeTime value={null} />`, value: <RelativeTime value={null} /> },
					]}
				/>
			</Example>

			<Example
				id="relative-time-shape"
				title="Suffix and precision"
				description="The suffix is on by default: a bare duration beside a row of dates reads as a length rather than a moment. includeSeconds separates “less than a minute” from something more precise, which only matters for a feed measured in seconds."
				stacked
				code={`<RelativeTime value={date} now={now} addSuffix={false} />
<RelativeTime value={date} now={now} includeSeconds />`}
			>
				<SpecimenList
					items={[
						{ code: `addSuffix  (default)`, value: <RelativeTime value={DAYS_AGO} now={NOW} /> },
						{ code: `addSuffix={false}`, value: <RelativeTime value={DAYS_AGO} now={NOW} addSuffix={false} /> },
						{ code: `includeSeconds`, value: <RelativeTime value={SECONDS_AGO} now={NOW} includeSeconds /> },
						{ code: `{/* without includeSeconds */}`, value: <RelativeTime value={SECONDS_AGO} now={NOW} /> },
					]}
				/>
			</Example>

			<Example
				id="relative-time-locale"
				title="In another language"
				description="Two levels. A date-fns locale on the provider translates the wording date-fns already knows; formatRelativeTime replaces it entirely, for a product whose own catalogue already has these strings — relative time is not a format string in any language, since it pluralises and several languages inflect the unit by the number."
				stacked
				code={`import { de } from "date-fns/locale"

<UIProvider config={{ dates: { locale: de } }}>…</UIProvider>

{/* or hand the wording over completely */}
<UIProvider
  config={{ dates: { formatRelativeTime: (date, now) => t.relative(date, now) } }}
/>`}
			>
				<SpecimenList
					items={[
						{
							code: `{/* built-in */}`,
							value: <RelativeTime value={DAYS_AGO} now={NOW} />,
						},
						{
							code: `dates: {{ locale: de }}`,
							value: (
								<UIProvider config={{ dates: { locale: de } }}>
									<RelativeTime value={DAYS_AGO} now={NOW} />
								</UIProvider>
							),
						},
						{
							code: `dates: {{ formatRelativeTime }}`,
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
			</Example>

			<Example id="relative-time-rule" title="Pass the clock in" stacked>
				<Callout label="Rule">
					<code>now</code> exists so the comparison point can be supplied. A component that
					reads the clock itself renders differently on the server and the client, produces
					a different snapshot on every test run, and never updates once mounted anyway.
					Left unset it reads the clock once, which is right for a page that is about to be
					navigated away from and wrong for anything long-lived.
				</Callout>
			</Example>

			<Example
				id="duration"
				title="Duration"
				description="Separate from the date primitives on purpose: a duration has no timezone, no calendar, and no daylight saving, and the moment it is modelled as a Date it acquires all three."
				stacked
				code={`<Duration value={45} />
<Duration value={4520} />
<Duration value={90} from="minutes" />
<Duration value={4520} maxParts={1} />
<Duration value={4520} unitDisplay="short" />
<Duration value={null} />`}
			>
				<SpecimenList
					items={[
						{ code: `<Duration value={45} />`, value: <Duration value={45} /> },
						{ code: `<Duration value={4520} />`, value: <Duration value={4520} /> },
						{ code: `<Duration value={90} from="minutes" />`, value: <Duration value={90} from="minutes" /> },
						{ code: `<Duration value={4520} maxParts={1} />`, value: <Duration value={4520} maxParts={1} /> },
						{ code: `<Duration value={4520} unitDisplay="short" />`, value: <Duration value={4520} unitDisplay="short" /> },
						{ code: `<Duration value={null} />`, value: <Duration value={null} /> },
					]}
				/>
			</Example>

			<Example id="date-api" title="DatePrimitive API">
				<PropTable owner="DatePrimitive"
					rows={[
						{ name: "value", type: "Date | string | number | null", description: "Whatever the API returned. Parsed once, here." },
						{ name: "pattern", type: "string", description: "A date-fns pattern, when the default is not what this column needs. Falls back to the scope's dateFormat." },
						{ name: "Time / DateTime", type: "component", description: "The same value at a different granularity. Three components rather than a granularity prop, because a column shows one of them and never switches." },
						{ name: "parseDateInput()", type: "(input) => Date | null", description: "The single parse every date primitive goes through." },
						{ name: "UIProvider dates", api: "UIProvider.config.dates", type: "DatesConfig", description: "weekStartsOn, format, locale (the date-fns Locale OBJECT — what actually translates month and weekday names), and formatRelativeTime." },
						{ name: "Date", type: "component", description: "DatePrimitive, exported under its natural name as well. The alias exists because `Date` collides with the global in a file that also constructs one — import whichever reads better at the call site." },
					]}
				/>
			</Example>

			<Example id="date-range-api" title="DateRange API">
				<PropTable owner="DateRange"
					rows={[
						{ name: "start / end", type: "Date | string | number | null", description: "Either end may be absent — an open range is a real state, not an error." },
						{ name: "pattern", type: "string", description: "A date-fns pattern for both ends, when the collapsing is not wanted." },
						{ name: "separator", type: "string", description: "Between the two ends. An en dash by default." },
						{ name: "formatDateRange()", type: "(start, end, options) => string", description: "The same collapsing outside React." },
					]}
				/>
			</Example>

			<Example id="relative-time-api" title="RelativeTime API">
				<PropTable owner="RelativeTime"
					rows={[
						{ name: "value", type: "Date | string | number | null", description: "The moment being described." },
						{ name: "now", type: "Date | string | number", description: "The comparison point. Supply it for anything rendered on a server or asserted in a test." },
						{ name: "addSuffix", type: "boolean", default: "true", description: "“7 days ago” rather than “7 days”. A bare duration beside a row of dates reads as a length rather than a moment." },
						{ name: "includeSeconds", type: "boolean", default: "false", description: "Separates “less than a minute” from something more precise. Only worth it for a feed measured in seconds." },
						{ name: "formatRelativeTime", type: "(date, now) => string", description: "Replaces the wording for this value. Falls back to the scope's dates.formatRelativeTime, then to date-fns." },
						{ name: "UIProvider dates.locale", api: "UIProvider.config.dates.locale", type: "Locale", description: "A date-fns locale OBJECT translates the built-in wording. It cannot be derived from a BCP-47 tag — the locales are modules, and importing all of them to look one up would put every language in every bundle." },
					]}
				/>
			</Example>

			<Example id="duration-api" title="Duration API">
				<PropTable owner="Duration"
					rows={[
						{ name: "value", type: "number | null", description: "The length. Seconds unless from says otherwise." },
						{ name: "from", type: "DurationUnit", description: "The unit value is given in." },
						{ name: "maxParts", type: "number", description: "How many units before truncating. “2 hours 14 minutes 3 seconds” is rarely useful — the reader wants the magnitude and the tail is noise." },
						{ name: "unitDisplay", type: '"long" | "short" | "narrow"', description: "How each unit is written." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
