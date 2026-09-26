/**
 * SchemaForm: renders and validates a form described as data.
 *
 * `form` places every section in one surface (dialogs, panels); `cards` gives each its own
 * (long settings pages). `validate()` runs on submit, and a message clears as soon as its
 * field changes.
 */
import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react"

import { ContentBlock } from "@/components/base/display"
import { Empty, ErrorState } from "@/components/base/feedback"
import { cx } from "@/lib/cx"

import { SchemaFormActions } from "./schema-form-actions"
import { SchemaFormFieldRenderer } from "./schema-form-field"
import { defaultSchemaFormStrings } from "./schema-form.strings"
import type {
	ResolvedSchemaFormSection, SchemaFormField, SchemaFormFieldContext, SchemaFormProps,
	SchemaFormSubmitHelpers,
} from "./schema-form.types"
import { isFieldDisabled, resolveSchemaSections, toDomId } from "./schema-form.utils"
import { useSchemaForm } from "./use-schema-form"
import styles from "./schema-form.module.css"

/* One column is the grid default, so it has no class (an empty rule would vanish from the bundle). */
const COLUMN_CLASS = {
	1: undefined,
	2: styles.columns2,
	3: styles.columns3,
}

const WIDTH_CLASS = {
	auto: undefined,
	half: styles.widthHalf,
	third: styles.widthThird,
	full: styles.widthFull,
}

function SectionHeading({ section }: { section: ResolvedSchemaFormSection }) {
	if (!section.title && !section.description) return null

	return (
		<ContentBlock
			title={section.title || undefined}
			description={section.description || undefined}
			className={styles.sectionHeading}
		/>
	)
}

export function SchemaForm({
	schema,
	value,
	defaultValue,
	errors,
	disabled = false,
	layout = "form",
	columns = 2,
	id,
	name,
	title,
	description,
	headerSlot,
	footerSlot,
	actionsSlot,
	emptySlot,
	showActions,
	submitLabel,
	resetLabel,
	submitDisabled = false,
	resetDisabled = false,
	submitting = false,
	onValueChange,
	onFieldChange,
	onSubmit,
	onReset,
	onError,
	renderField,
	renderSection,
	strings,
	className,
	contentClassName,
	sectionClassName,
	fieldClassName,
}: SchemaFormProps) {
	const copy = { ...defaultSchemaFormStrings, ...strings }
	const [submitFailed, setSubmitFailed] = useState(false)
	const [pending, setPending] = useState(false)
	const inFlight = useRef(false)
	const formRef = useRef<HTMLFormElement>(null)
	const [focusInvalid, setFocusInvalid] = useState(0)
	const busy = submitting || pending
	useEffect(() => {
		if (focusInvalid) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]:not([disabled])')?.focus()
	}, [focusInvalid])
	const generatedId = useId()
	const formId = id ?? `schema-form-${generatedId}`

	const form = useSchemaForm({
		fields: schema.fields,
		value,
		defaultValue,
		errors,
		onValueChange,
		onFieldChange,
		requiredError: copy.requiredError,
		validationError: copy.validationError,
		onError,
	})

	const sections = useMemo(
		() => resolveSchemaSections(schema, form.values, copy.defaultSectionTitle, columns, onError),
		[columns, copy.defaultSectionTitle, form.values, onError, schema],
	)
	const hasFields = sections.length > 0

	const helpers: SchemaFormSubmitHelpers = {
		setFieldValue: form.setFieldValue,
		setValues: form.setValues,
		reset: form.reset,
		validate: form.validate,
	}

	const resolvedTitle = title ?? schema.title
	const resolvedDescription = description ?? schema.description

	const showsActions = showActions ?? !!(onSubmit || onReset || actionsSlot)

	const renderFieldNode = (field: SchemaFormField) => {
		const fieldId = `${formId}-${toDomId(field.key)}`
		const context: SchemaFormFieldContext = {
			field,
			value: form.getFieldValue(field.key),
			values: form.values,
			error: form.getFieldError(field.key),
			disabled: disabled || busy || isFieldDisabled(field, form.values, onError),
			required: !!field.required,
			fieldId,
			onValueChange: (next) => form.setFieldValue(field.key, next),
			onError,
		}
		const defaultField = <SchemaFormFieldRenderer {...context} strings={copy} />

		return (
			<div
				key={field.key}
				className={cx(WIDTH_CLASS[field.width ?? "auto"], field.className, fieldClassName)}
			>
				{renderField?.({ ...context, defaultField }) ?? defaultField}
			</div>
		)
	}

	const renderFields = (section: ResolvedSchemaFormSection) => (
		<div className={cx(styles.grid, COLUMN_CLASS[section.columns])}>
			{section.fields.map(renderFieldNode)}
		</div>
	)

	const renderOneSection = (section: ResolvedSchemaFormSection) => {
		const fields = renderFields(section)
		const custom = renderSection?.({ section, fields, values: form.values })
		if (custom !== undefined && custom !== null) {
			return <Fragment key={section.id}>{custom}</Fragment>
		}

		if (layout === "cards") {
			return (
				<ContentBlock
					key={section.id}
					surface="bordered"
					icon={section.icon}
					title={section.title}
					description={section.description}
					className={cx(section.className, sectionClassName)}
				>
					{fields}
					{!!section.footerSlot && (
						<div className={styles.sectionFooter}>{section.footerSlot}</div>
					)}
				</ContentBlock>
			)
		}

		return (
			<section key={section.id} className={cx(section.className, sectionClassName)}>
				<SectionHeading section={section} />
				{fields}
				{!!section.footerSlot && (
					<div className={styles.sectionFooter}>{section.footerSlot}</div>
				)}
			</section>
		)
	}

	const actions =
		actionsSlot ??
		(showsActions ? (
			<SchemaFormActions
				submitLabel={submitLabel ?? copy.submitLabel}
				resetLabel={resetLabel ?? copy.resetLabel}
				showReset={!!onReset}
				disabled={disabled}
				submitDisabled={submitDisabled}
				resetDisabled={resetDisabled}
				submitting={busy}
				onReset={() => { setSubmitFailed(false); onReset?.(form.reset(), helpers) }}
			/>
		) : null)

	const empty = emptySlot ?? (
		<Empty
			title={copy.emptyTitle}
			description={copy.emptyDescription}
			padding="md"
			border
		/>
	)

	const header = !!(resolvedTitle || resolvedDescription || headerSlot) && (
		<ContentBlock
			title={resolvedTitle || undefined}
			description={resolvedDescription || undefined}
			headerEnd={headerSlot}
			className={styles.header}
		/>
	)

	const footer = !!(footerSlot || actions) && (
		<div className={styles.footer}>
			{footerSlot}
			{actions}
		</div>
	)

	const body = (
		<div className={cx(styles.body, contentClassName)}>
			{hasFields ? sections.map(renderOneSection) : empty}
			{submitFailed && <ErrorState className={styles.submitError} title={copy.submitError ?? defaultSchemaFormStrings.submitError} description={false} />}
		</div>
	)

	return (
		<form
			ref={formRef}
			aria-busy={busy || undefined}
			id={formId}
			name={name}
			/* Schema validation runs first so all messages appear together; native constraints are checked after. */
			noValidate
			className={cx("schema-form--component", styles.root, className)}
			onSubmit={async (event) => {
				event.preventDefault()
				if (disabled || submitDisabled || busy || inFlight.current) return
				if (!form.validate()) {
					setFocusInvalid((attempt) => attempt + 1)
					return
				}
				// Native constraints include JSON's parse validity and input type/pattern rules.
				if (!event.currentTarget.reportValidity()) return
				inFlight.current = true
				setSubmitFailed(false)
				setPending(true)
				try {
					await onSubmit?.(form.values, helpers, event)
				} catch (error) {
					setSubmitFailed(true)
					onError?.(error)
				} finally {
					inFlight.current = false
					setPending(false)
				}
			}}
		>
			{layout === "cards" ? (
				<div className={styles.cards}>
					{header}
					{body}
					{footer}
				</div>
			) : (
				<div className={styles.surface}>
					{header}
					{body}
					{footer}
				</div>
			)}
		</form>
	)
}
