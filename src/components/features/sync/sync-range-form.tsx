/**
 * SyncRangeForm: the body of a "reconcile the last N hours" dialog. It renders no buttons:
 * the overlay's footer submits it through `formId` (`form={id}`), so native validation runs
 * first. react-hook-form handles the two controlled groups, the external reset and the
 * awaited submit.
 */
import { useEffect, useMemo } from "react"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"

import { CardCheckboxGroup, CardRadioGroup } from "@/components/base/choice-inputs"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { Label } from "@/components/base/label"
import { useFormErrors } from "@/hooks/use-form-errors"
import { cx } from "@/lib/cx"

import { defaultSyncRangeFormStrings } from "./sync.strings"
import type { SyncRangeFormProps, SyncRangeFormSubmit, SyncRangeFormValues } from "./sync.types"
import styles from "./sync.module.css"

/** The default window: a day. */
const DEFAULT_HOURS = "24"

/**
 * The default mapping: the window id parsed as a number. Throws rather than coercing
 * (`Number("since-last-run")` is NaN); non-numeric ids need `transformSubmit`.
 */
function defaultTransformSubmit(value: SyncRangeFormValues): SyncRangeFormSubmit {
	const hours = Number(value.hours)
	if (!Number.isFinite(hours)) {
		throw new TypeError(
			`SyncRangeForm cannot read "${value.hours}" as a number of hours. Pass transformSubmit for a non-numeric vocabulary.`,
		)
	}
	return { hours, options: [...value.options] }
}

export function SyncRangeForm<TSubmit = SyncRangeFormSubmit>({
	formId,
	options,
	syncOptions,
	value,
	defaultValue,
	onValueChange,
	transformSubmit,
	onSubmit,
	onError,
	resetKey,
	disabled = false,
	submitting = false,
	errors,
	strings,
	className,
}: SyncRangeFormProps<TSubmit>) {
	const copy = { ...defaultSyncRangeFormStrings, ...strings }

	// A server may answer with a list per field; show the first.
	const flattened = useMemo(
		() =>
			Object.fromEntries(
				Object.entries(errors ?? {}).map(([key, message]) => [
					key,
					Array.isArray(message) ? message[0] : message,
				]),
			) as Record<string, string | undefined>,
		[errors],
	)
	const { getError } = useFormErrors(flattened)

	const initialValue = useMemo<SyncRangeFormValues>(
		() => ({
			hours: defaultValue?.hours ?? DEFAULT_HOURS,
			options: [...(defaultValue?.options ?? [])],
		}),
		[defaultValue?.hours, defaultValue?.options],
	)

	const {
		control,
		getValues,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<SyncRangeFormValues>({ defaultValues: value ?? initialValue })

	const busy = disabled || submitting || isSubmitting

	/** Controlled: the outside value is authoritative. */
	useEffect(() => {
		if (value !== undefined) reset(value)
	}, [reset, value])

	/** Uncontrolled: the key is the signal to start over. */
	useEffect(() => {
		if (resetKey === undefined) return
		reset(value ?? initialValue)
	}, [initialValue, reset, resetKey, value])

	const submit: SubmitHandler<SyncRangeFormValues> = async (values) => {
		try {
			const transform =
				transformSubmit ?? (defaultTransformSubmit as unknown as (v: SyncRangeFormValues) => TSubmit)
			await onSubmit(transform(values), values)
		} catch (error) {
			// A throwing transform lands here too.
			onError?.(error)
		}
	}

	const hoursError = getError("hours")

	return (
		<form
			id={formId}
			onSubmit={handleSubmit(submit)}
			aria-busy={busy || undefined}
			className={cx("sync-range-form--component", styles.form, className)}
		>
			<section className={styles.section}>
				<Stack gap="xs">
					<Label>{copy.hoursLabel}</Label>
					<Text size="xs" type="secondary">{copy.hoursDescription}</Text>
				</Stack>

				<Controller
					name="hours"
					control={control}
					rules={{ required: copy.hoursRequired }}
					render={({ field }) => (
						<CardRadioGroup
							options={options}
							value={field.value}
							onValueChange={(hours) => {
								field.onChange(hours)
								// `getValues()`, not closed-over state: the other group may have changed since this render.
								onValueChange?.({ ...getValues(), hours })
							}}
							name={field.name}
							columns={2}
							invalid={!!hoursError}
							disabled={busy}
						/>
					)}
				/>

				{!!hoursError && <Text size="xs" type="error">{hoursError}</Text>}
			</section>

			{!!syncOptions?.length && (
				// A framed section: secondary to the window.
				<section className={styles.optional}>
					<Stack gap="md">
						<Stack gap="xs">
							<Label>{copy.optionsLabel}</Label>
							<Text size="xs" type="secondary">{copy.optionsDescription}</Text>
						</Stack>

						<Controller
							name="options"
							control={control}
							render={({ field }) => (
								<CardCheckboxGroup
									options={syncOptions}
									value={field.value}
									onValueChange={(next) => {
										field.onChange(next)
										onValueChange?.({ ...getValues(), options: next })
									}}
									columns={2}
									disabled={busy}
								/>
							)}
						/>
					</Stack>
				</section>
			)}
		</form>
	)
}
