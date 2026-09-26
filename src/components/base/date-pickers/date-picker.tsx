/**
 * DatePicker — the calendar behind a field. The trigger carries `data-field-control`. The
 * popup is a non-modal Popover so tabbing through the surrounding form still works.
 */
import { CalendarIcon, XIcon } from "lucide-react"
import { useDatesConfig } from "@/lib/ui-provider"
import { format, isValid } from "date-fns"
import { useMemo, useRef, useState, type ReactNode, type Ref } from "react"

import { Button } from "@/components/base/buttons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover"
import { cx } from "@/lib/cx"

import { Calendar } from "./calendar"
import { defaultDatePickerStrings, type DatePickerStrings } from "./date-pickers.strings"
import styles from "./calendar.module.css"
import type {
	CalendarConstraints, DatePreset, DateRangeValue, DateSelectionMode,
} from "./calendar.types"

export interface DatePickerProps extends CalendarConstraints {
	/** The trigger button — the element a caller would focus or measure. */
	ref?: Ref<HTMLButtonElement>
	/**
	 * Applied to the trigger, the only labelable element. Its name comes from the chosen date,
	 * so the field's label must reach it.
	 */
	id?: string
	mode?: DateSelectionMode
	value?: Date | Date[] | DateRangeValue
	onValueChange?: (value: Date | Date[] | DateRangeValue | undefined) => void
	/** How the chosen value is written in the trigger. */
	displayFormat?: string
	placeholder?: string
	disabled?: boolean
	invalid?: boolean
	/** Adds a clear control to the trigger once something is chosen. */
	clearable?: boolean
	/** Overrides this picker's own copy — the clear control and the calendar's captions. */
	strings?: Partial<DatePickerStrings>
	/** Shortcuts down the side — "Last 30 days", "This month". */
	presets?: DatePreset[]
	numberOfMonths?: number
	/** Closes the popup as soon as a complete value is chosen. */
	closeOnSelect?: boolean
	/** A band above the calendar — a title, a mode switch. Use `DatePickerHeader`. */
	header?: ReactNode
	/** A band below it — a summary, Clear and Apply. Use `DatePickerFooter`. */
	footer?: ReactNode
	className?: string
	contentClassName?: string
	"aria-label"?: string
	"aria-labelledby"?: string
	"aria-describedby"?: string
}

function isRange(value: unknown): value is DateRangeValue {
	return !!value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)
}

export function DatePicker({
	ref,
	id,
	mode = "single",
	value,
	onValueChange,
	displayFormat = "d MMM yyyy",
	placeholder,
	disabled = false,
	invalid = false,
	clearable = false,
	strings,
	presets,
	numberOfMonths = mode === "range" ? 2 : 1,
	closeOnSelect = mode === "single",
	header,
	footer,
	className,
	contentClassName,
	/*
	 * Named so they don't fall into `...aria`, which is spread onto the trigger button (DOM
	 * attributes) as well as the calendar.
	 */
	minDate,
	maxDate,
	disabledDates,
	...aria
}: DatePickerProps) {
	const copy = { ...defaultDatePickerStrings, ...strings }
	const bodyRef = useRef<HTMLDivElement>(null)
	/* date-fns locale; translates the month names in the field. */
	const { locale } = useDatesConfig()
	const [open, setOpen] = useState(false)
	if (disabled && open) setOpen(false)

	const dateCount = copy.dateCount
	const label = useMemo<ReactNode>(() => {
		if (!value) return null
		const write = (date: Date) => (isValid(date) ? format(date, displayFormat, { locale }) : null)

		if (value instanceof Date) return write(value)
		if (Array.isArray(value)) {
			if (value.length === 0) return null
			// More than two dates don't fit; show a count.
			if (value.length <= 2) return value.map(write).filter(Boolean).join(", ")
			return dateCount?.(value.length) ?? null
		}
		if (isRange(value)) {
			if (!value.from) return null
			// An open range keeps its trailing dash.
			return value.to ? `${write(value.from)} – ${write(value.to)}` : `${write(value.from)} –`
		}
		return null
	}, [dateCount, displayFormat, value, locale])

	const hasValue = label !== null && label !== ""

	const handleChange = (next: Date | Date[] | DateRangeValue | undefined) => {
		onValueChange?.(next)
		if (!closeOnSelect) return
		// A range is complete only with both ends; closing on the first click would block the second.
		if (mode === "range" && isRange(next) && !next.to) return
		if (mode === "multiple") return
		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			{/*
 * The clear button is a sibling of the trigger (buttons can't nest), placed over the
 * trailing lane the trigger's padding reserves — the same shape as Input's frame.
 */}
			<span className={cx(styles.triggerFrame, clearable && hasValue && styles.triggerFrameClearable)}>
				<PopoverTrigger
					/*
					 * On PopoverTrigger, not the rendered button: Base UI passes the id through `useBaseUiId`
					 * and overwrites one set on the button.
					 */
					id={id}
					ref={ref}
					render={
						<button
							type="button"
							/*
							 * A field that opens a picker, like Select's trigger: as a combobox it may carry
							 * aria-required and aria-invalid, which a plain button may not. Its name comes
							 * from the label, so an unlabelled picker falls back to the placeholder copy.
							 */
							role="combobox"
							aria-haspopup="dialog"
							aria-label={aria["aria-label"] ?? (aria["aria-labelledby"] ? undefined : copy.placeholder)}
							data-field-control=""
							disabled={disabled}
							aria-invalid={invalid || undefined}
							className={cx("date-picker--component", styles.trigger, className)}
							{...aria}
						>
							<span className={cx(!hasValue && styles.triggerPlaceholder)}>
								{hasValue ? label : (placeholder ?? copy.placeholder)}
							</span>
							{/* Always shown: it says the field opens a calendar. */}
							<span className={styles.triggerIcon}>
								<CalendarIcon aria-hidden />
							</span>
						</button>
					}
				/>

				{!!clearable && !!hasValue && (
					<button
						type="button"
						className={styles.triggerClear}
						// Small glyph, full-size target (styles/targets.css).
						data-hit-area
						aria-label={copy.clear}
						disabled={disabled}
						onClick={() => onValueChange?.(undefined)}
					>
						<XIcon aria-hidden />
					</button>
				)}
			</span>

			<PopoverContent
				align="start"
				inset="flush"
				width="auto"
				aria-label={copy.placeholder}
				className={contentClassName}
				/* Focus the calendar's tab stop (selected day or today), per the date-picker dialog pattern. */
				initialFocus={() => bodyRef.current?.querySelector<HTMLElement>('[data-day][tabindex="0"]') ?? true}
			>
				<div ref={bodyRef} className={styles.body}>
					{!!presets?.length && (
						<div className={styles.presets}>
							{presets.map((preset) => (
								<Button
									key={preset.label}
									tone="neutral"
									buttonStyle="ghost"
									onClick={() => handleChange(preset.value())}
								>
									{preset.label}
								</Button>
							))}
						</div>
					)}
					{header}
					<Calendar
						strings={copy}
						mode={mode}
						value={value}
						onValueChange={handleChange}
						numberOfMonths={numberOfMonths}
						minDate={minDate}
						maxDate={maxDate}
						disabledDates={disabledDates}
						{...aria}
					/>
					{footer}
				</div>
			</PopoverContent>
		</Popover>
	)
}
