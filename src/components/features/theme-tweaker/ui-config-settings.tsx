/**
 * The non-CSS half of a theme: locale, currency and default text size, applied through
 * UIProvider's configuration. The caller owns that config: wire `onChange` to the state
 * passed to UIProvider for live updates. Every field is a slice `UIConfig` declares.
 */
import { InfoIcon } from "lucide-react"

import { Accordion } from "@/components/base/accordion"
import { ContentBlock } from "@/components/base/display"
import { Alert, AlertDescription, AlertMetadata, AlertTitle } from "@/components/base/feedback"
import { FormField } from "@/components/base/forms"
import { Input } from "@/components/base/text-inputs"
import { Select, ToggleField } from "@/components/base/choice-inputs"
import { SliderField } from "@/components/base/value-inputs"
import { Stack } from "@/components/base/structure"
import type { UIConfig } from "@/lib/ui-provider"
import { cx } from "@/lib/cx"

import {
	defaultUIConfigSettingsStrings, type UIConfigSettingsStrings,
} from "./ui-config-settings.strings"
import { createSerializableUIConfig } from "./theme-tweaker.utils"
import styles from "./theme-tweaker.module.css"

export interface UIConfigSettingsProps {
	config: UIConfig
	onChange: (config: UIConfig) => void
	strings?: UIConfigSettingsStrings
	className?: string
}

const WEEKDAYS = [
	"sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
] as const

function options(values: readonly string[], strings: UIConfigSettingsStrings) {
	return values.map((value) => ({
		value,
		label:
			strings.options[value] ??
			value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase()),
	}))
}

export function UIConfigSettings({
	config,
	onChange,
	strings = defaultUIConfigSettingsStrings,
	className,
}: UIConfigSettingsProps) {
	const resolved = createSerializableUIConfig(config)

	/** Merges one level deep, as deep as this panel edits. */
	const updateSlice = <K extends "formatting" | "money" | "dates" | "typography" | "overlay">(
		slice: K,
		key: string,
		value: unknown,
	) => {
		onChange({ ...resolved, [slice]: { ...(resolved[slice] as object), [key]: value } })
	}

	const updateRoot = (key: "colorScheme" | "density" | "scale", value: unknown) => {
		onChange({ ...resolved, [key]: value })
	}

	return (
		<Stack gap="lg" className={cx("ui-config-settings--component", styles.providerSettings, className)}>
			<ContentBlock title={strings.title} description={strings.description} />

			<Alert tone="info" role="note">
				<InfoIcon aria-hidden />
				<AlertTitle>{strings.boundaryTitle}</AlertTitle>
				<AlertDescription>{strings.boundaryDescription}</AlertDescription>
				<AlertMetadata
					items={[
						{ label: strings.summary.locale, value: resolved.formatting?.locale ?? strings.options.default },
						{ label: strings.summary.currency, value: resolved.money?.defaultCurrency ?? strings.options.default },
						{
							label: strings.summary.density,
							value: strings.options[resolved.density ?? "default"] ?? resolved.density,
						},
						{
							label: strings.summary.textSize,
							value:
								strings.options[resolved.typography?.defaultTextSize ?? "sm"] ??
								resolved.typography?.defaultTextSize,
						},
					]}
				/>
			</Alert>

			<Accordion
				multiple
				defaultValue={["regional"]}
				surface="bordered"
				media="none"
				items={[
					{
						value: "regional",
						title: strings.sections.regional.title,
						description: strings.sections.regional.description,
						content: (
							<div className={styles.settingsGrid}>
								<FormField label={strings.labels.locale}>
									<Input
										value={resolved.formatting?.locale ?? ""}
										onChange={(event) => updateSlice("formatting", "locale", event.target.value)}
									/>
								</FormField>
								<FormField label={strings.labels.firstDay}>
									<Select
										value={String(resolved.dates?.weekStartsOn ?? 1)}
										options={WEEKDAYS.map((day, index) => ({
											value: String(index),
											label: strings.options[day] ?? day,
										}))}
										onValueChange={(next) =>
											next !== undefined && updateSlice("dates", "weekStartsOn", Number(next))
										}
									/>
								</FormField>
								<FormField label={strings.labels.dateFormat}>
									<Input
										value={resolved.dates?.format ?? ""}
										onChange={(event) => updateSlice("dates", "format", event.target.value)}
										className={styles.monoInput}
									/>
								</FormField>
							</div>
						),
					},
					{
						value: "presentation",
						title: strings.sections.presentation.title,
						description: strings.sections.presentation.description,
						content: (
							<div className={styles.settingsGrid}>
								<FormField label={strings.labels.colorScheme}>
									<Select
										value={resolved.colorScheme}
										options={options(["light", "dark", "system"], strings)}
										onValueChange={(next) => next !== undefined && updateRoot("colorScheme", next)}
									/>
								</FormField>
								<ToggleField
									label={strings.labels.darkMenus}
									description={strings.darkMenusDescription}
									value={resolved.overlay?.darkMenus ?? true}
									onValueChange={(next) => updateSlice("overlay", "darkMenus", next)}
								/>
								<FormField label={strings.labels.density}>
									<Select
										value={resolved.density}
										options={options(["compact", "default", "comfortable"], strings)}
										onValueChange={(next) => next !== undefined && updateRoot("density", next)}
									/>
								</FormField>
								<FormField label={strings.labels.textSize}>
									<Select
										value={resolved.typography?.defaultTextSize}
										options={options(
											["inherit", "xs", "pxs", "sm", "base", "lg", "xl"],
											strings,
										)}
										onValueChange={(next) =>
											next !== undefined && updateSlice("typography", "defaultTextSize", next)
										}
									/>
								</FormField>
								<FormField label={strings.labels.scale}>
									<SliderField
										aria-label={strings.labels.scale}
										value={resolved.scale ?? 1}
										min={0.75}
										max={1.35}
										step={0.025}
										/* Typed at the call site: the slider declares `never` so callers annotate their own shape. */
										onValueChange={(next: number) => updateRoot("scale", next)}
									/>
								</FormField>
								<FormField label={strings.labels.typographyScale}>
									<SliderField
										aria-label={strings.labels.typographyScale}
										value={resolved.typography?.scale ?? 1}
										min={0.85}
										max={1.25}
										step={0.025}
										onValueChange={(next: number) => updateSlice("typography", "scale", next)}
									/>
								</FormField>
							</div>
						),
					},
					{
						value: "money",
						title: strings.sections.money.title,
						description: strings.sections.money.description,
						content: (
							<div className={styles.settingsGrid}>
								<FormField label={strings.labels.defaultCurrency}>
									<Input
										value={resolved.money?.defaultCurrency ?? ""}
										onChange={(event) =>
											updateSlice("money", "defaultCurrency", event.target.value.toUpperCase())
										}
									/>
								</FormField>
								<FormField label={strings.labels.displayCurrency}>
									<Input
										value={resolved.money?.displayCurrency ?? ""}
										placeholder={strings.displayCurrencyPlaceholder}
										onChange={(event) =>
											updateSlice(
												"money",
												"displayCurrency",
												event.target.value.toUpperCase() || undefined,
											)
										}
									/>
								</FormField>
								<FormField label={strings.labels.moneyFormat}>
									<Select
										value={resolved.money?.formatMode}
										options={options(["decimal", "with-code", "with-symbol"], strings)}
										onValueChange={(next) =>
											next !== undefined && updateSlice("money", "formatMode", next)
										}
									/>
								</FormField>
								<ToggleField
									label={strings.labels.dualPricing}
									description={strings.dualPricingDescription}
									value={resolved.money?.dualPricingEnabled ?? false}
									onValueChange={(next) => updateSlice("money", "dualPricingEnabled", next)}
								/>
								<FormField label={strings.labels.dualPricingMode}>
									<Select
										value={resolved.money?.displayMode}
										options={options(["primary-only", "dual", "dynamic"], strings)}
										onValueChange={(next) =>
											next !== undefined && updateSlice("money", "displayMode", next)
										}
									/>
								</FormField>
								<FormField label={strings.labels.dualPricingLayout}>
									<Select
										value={resolved.money?.layout}
										options={options(["inline", "stacked"], strings)}
										onValueChange={(next) =>
											next !== undefined && updateSlice("money", "layout", next)
										}
									/>
								</FormField>
							</div>
						),
					},
				]}
			/>
		</Stack>
	)
}
