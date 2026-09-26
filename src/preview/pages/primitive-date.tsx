import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PrimitiveDatePage() {
	return (
		<ComponentPage>
			<Example
				example="primitive-date/date"
				title="Dates and times"
				description="Each renders a <time dateTime> so the value is machine-readable regardless of how it is displayed — which is what makes a formatted date still sortable, copyable, and parseable."
			/>

			<Example
				example="primitive-date/date-locale"
				title="Localised names"
				description="date-fns translates month and weekday names from a LOCALE OBJECT, not from a BCP-47 tag. It cannot be derived from `formatting.locale`, because the locales are modules and importing all of them to look one up by tag would put every language in every bundle — so the consumer imports the one it needs and puts it on the provider. NAMES is the whole of it: the pattern owns the order and the punctuation, so `EEEE d MMMM yyyy` under `de` gives “Donnerstag 12 März 2026” where German writes “Donnerstag, 12. März 2026”, and under `ja` it gives day-month-year where Japanese writes year-month-day. That is the intended trade — one date shape across a product is usually what an admin app wants, and `dates.format` is where it lives — but a product that follows each reader’s conventions sets the pattern per locale as well as the locale."
			/>

			<Example id="date-rule" title="date-fns, not hand-rolled Date">
				<Callout label="Rule">
					Formatting, parsing, and arithmetic go through <code>date-fns</code>. Native{" "}
					<code>Date</code> arithmetic is where month-end, daylight saving, and the
					zero-indexed month all quietly produce wrong answers, and every product
					reinvents the same three helpers to work around it. A primitive still ACCEPTS a
					Date, a string, or a timestamp — it just does not do the maths itself.
				</Callout>
			</Example>

			<Example
				example="primitive-date/date-range"
				title="DateRange"
				description="Same month collapses to 3–7 March; same year keeps both months; across years keeps everything. A format string cannot express that, because which parts are redundant depends on the two values."
			/>

			<Example
				example="primitive-date/relative-time"
				title="RelativeTime"
				description="A relative label answers “is this recent?” at a glance and answers nothing else — so the exact timestamp stays in the time element's dateTime rather than being thrown away for it."
			/>

			<Example
				example="primitive-date/relative-time-shape"
				title="Suffix and precision"
				description="The suffix is on by default: a bare duration beside a row of dates reads as a length rather than a moment. includeSeconds separates “less than a minute” from something more precise, which only matters for a feed measured in seconds."
			/>

			<Example
				example="primitive-date/relative-time-locale"
				title="In another language"
				description="Two levels. A date-fns locale on the provider translates the wording date-fns already knows; formatRelativeTime replaces it entirely, for a product whose own catalogue already has these strings — relative time is not a format string in any language, since it pluralises and several languages inflect the unit by the number."
			/>

			<Example id="relative-time-rule" title="Pass the clock in">
				<Callout label="Rule">
					<code>now</code> exists so the comparison point can be supplied. A component that
					reads the clock itself renders differently on the server and the client, produces
					a different snapshot on every test run, and never updates once mounted anyway.
					Left unset it reads the clock once, which is right for a page that is about to be
					navigated away from and wrong for anything long-lived.
				</Callout>
			</Example>

			<Example
				example="primitive-date/duration"
				title="Duration"
				description="Separate from the date primitives on purpose: a duration has no timezone, no calendar, and no daylight saving, and the moment it is modelled as a Date it acquires all three."
			/>

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
