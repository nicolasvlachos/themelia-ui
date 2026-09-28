/**
 * ThemeTweaker: edit the kit's public theme contract live and export the result.
 *
 * Variables preview instantly through the cascade; provider defaults update only when the
 * caller passes the edited config (from `onConfigChange`) to UIProvider. CSS and config
 * export together so locale and currency travel with a theme. A standalone export needs
 * every variable's value, which `captureResolvedTheme` reads from the target: a colour reads
 * back as its unresolved `light-dark()` pair, so one read gives both modes.
 */
import { resolveStrings } from "@/lib/strings"
import {
	CheckCircle2Icon, CopyIcon, DownloadIcon, LayoutGridIcon, MoonIcon, PaletteIcon,
	RotateCcwIcon, SearchIcon, Settings2Icon, ShapesIcon, ShieldCheckIcon, SunIcon, TypeIcon,
} from "lucide-react"
import {
	forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState,
	type ReactNode,
} from "react"

import { Empty } from "@/components/base/feedback"
import { Accordion } from "@/components/base/accordion"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Input } from "@/components/base/text-inputs"
import { ContentBlock, VisuallyHidden } from "@/components/base/display"
import { DecimalInput } from "@/components/base/forms-numeric"
import { FormField } from "@/components/base/forms"
import { Grid, Stack } from "@/components/base/structure"
import { Heading, Text, textClassName } from "@/components/base/typography"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/base/item"
import { OverlayClose } from "@/components/base/overlay"
import { ColorInput, SliderField } from "@/components/base/value-inputs"
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/navigation"
import { ToggleField } from "@/components/base/choice-inputs"
import { MonoValue } from "@/components/primitives"
import { ActionDialog, useOverlayVisibility } from "@/components/features/overlays"
import { cx } from "@/lib/cx"

import { ThemeScope } from "./theme-scope"
import { UIConfigSettings } from "./ui-config-settings"
import { defaultThemeTweakerFields } from "./theme-tweaker.fields"
import { defaultThemeTweakerStrings, type ThemeTweakerStrings } from "./theme-tweaker.strings"
import {
	deriveThemeElevation, deriveThemePalette, deriveThemeTypeScale,
} from "@/lib/theming"
import type {
	ThemeDefinition, ThemeMode, ThemeOverrides, ThemeTweakerField, ThemeTweakerGroup,
	ThemeTweakerProps, ThemeTweakerRangeControl, ThemeTweakerSection,
} from "./theme-tweaker.types"
import {
	countThemeOverrides, createSerializableUIConfig, createTheme, createThemeExportArtifact,
	downloadTextFile, downloadTheme, splitLightDark, themeToStyle,
} from "./theme-tweaker.utils"
import { useAppliedTheme } from "./use-applied-theme"
import styles from "./theme-tweaker.module.css"

const GROUPS: readonly ThemeTweakerGroup[] = [
	"colors", "states", "typography", "shape", "structure", "defaults",
]

const GROUP_ICONS: Record<ThemeTweakerGroup, ReactNode> = {
	colors: <PaletteIcon />,
	states: <ShieldCheckIcon />,
	typography: <TypeIcon />,
	shape: <ShapesIcon />,
	structure: <LayoutGridIcon />,
	defaults: <Settings2Icon />,
}

type ActionStatus = "idle" | "copied" | "exported"

interface VisibleThemeSection {
	group: ThemeTweakerGroup
	section: ThemeTweakerSection
	fields: ThemeTweakerField[]
}

function parseRangeValue(value: string, control: ThemeTweakerRangeControl): number {
	const parsed = Number.parseFloat(value)
	if (!Number.isFinite(parsed)) return control.fallback ?? control.min
	return Math.min(control.max, Math.max(control.min, parsed))
}

function serializeRangeValue(value: number, control: ThemeTweakerRangeControl): string {
	return `${Number(value.toFixed(control.decimalPlaces ?? 3))}${control.unit ?? ""}`
}

function resolveInspectionTarget(
	target: ThemeTweakerProps["target"],
	self: HTMLDivElement | null,
): HTMLElement | null {
	if (target === "document") return document.documentElement
	if (target === "self" || target === null) return self
	if (typeof target === "function") return target()
	return target ?? self
}

/**
 * What every variable resolves to at `element`: shared values as declared there, and each
 * colour's two halves, split from its `light-dark()` pair. A custom property keeps the pair
 * unresolved, so one read gives both modes.
 */
function captureResolvedTheme(
	theme: ThemeDefinition,
	fields: readonly ThemeTweakerField[],
	element: HTMLElement | null,
): ThemeDefinition {
	if (!element || typeof window === "undefined") return createTheme(theme)

	const computed = window.getComputedStyle(element)
	const shared: ThemeOverrides = {}
	const light: ThemeOverrides = {}
	const dark: ThemeOverrides = {}
	for (const field of fields) {
		const value = computed.getPropertyValue(field.name).trim()
		if (!value) continue
		if (field.scope === "shared") {
			shared[field.name] = value
			continue
		}
		const halves = splitLightDark(value)
		light[field.name] = halves ? halves[0] : value
		dark[field.name] = halves ? halves[1] : value
	}
	return createTheme({ mode: theme.mode, shared, light, dark })
}

function updateThemeVariable(
	theme: ThemeDefinition,
	field: ThemeTweakerField,
	raw: string,
): ThemeDefinition {
	const bucket = field.scope === "shared" ? "shared" : theme.mode
	const next = { ...theme[bucket] }
	// An emptied field removes the override: an empty custom property resolves to nothing.
	if (raw.trim().length === 0) delete next[field.name]
	else next[field.name] = raw
	return { ...theme, [bucket]: next }
}

interface ThemeExportBlockProps {
	title: string
	description: string
	code: string
	copyLabel: string
	downloadLabel: string
	downloading?: boolean
	onCopy: () => void
	onDownload: () => void
}

function ThemeExportBlock({
	title, description, code, copyLabel, downloadLabel, downloading = false, onCopy, onDownload,
}: ThemeExportBlockProps) {
	const titleId = useId()

	return (
		<section aria-labelledby={titleId} className={styles.exportBlock}>
			<div className={styles.exportBlockHeader}>
				<Stack gap="sm" className={styles.minWidth}>
					<Heading id={titleId} level={3}>{title}</Heading>
					<Text type="secondary">{description}</Text>
				</Stack>
				<Stack direction="horizontal" gap="sm" align="center" wrap>
					<Button type="button" tone="neutral" appearance="outline" onClick={onCopy}>
						<CopyIcon />
						{copyLabel}
					</Button>
					<Button type="button" loading={downloading} onClick={onDownload}>
						<DownloadIcon />
						{downloadLabel}
					</Button>
				</Stack>
			</div>
			{/* Focusable because it scrolls, so keyboard readers can reach it. */}
			<pre
				tabIndex={0}
				aria-label={title}
				className={cx(styles.exportCode, textClassName({ size: "xs", lineHeight: "relaxed", mono: true }))}
			>
				<code>{code}</code>
			</pre>
		</section>
	)
}

interface ThemeVariableFieldProps {
	field: ThemeTweakerField
	value: string
	/** What the variable currently computes to, used as the placeholder. */
	effectiveValue: string
	onChange: (value: string) => void
	onReset: () => void
	strings: ThemeTweakerStrings
}

function ThemeVariableField({
	field, value, effectiveValue, onChange, onReset, strings,
}: ThemeVariableFieldProps) {
	const id = `theme-variable-${useId().replace(/:/g, "")}`

	const resetAction = (
		<Button
			type="button"
			tone="neutral"
			appearance="ghost"
			iconOnly
			aria-label={`${strings.resetVariable}: ${field.label}`}
			title={strings.resetVariable}
			disabled={!value}
			onClick={onReset}
		>
			<RotateCcwIcon />
		</Button>
	)

	const placeholder = field.placeholder ?? effectiveValue ?? strings.inheritValue

	let control: ReactNode

	if (field.kind === "color") {
		control = (
			<div className={styles.controlRow}>
				<ColorInput
					id={id}
					aria-label={field.label}
					value={value}
					// Falls back to the computed value, then the variable, so an untouched field still shows its colour.
					previewValue={value || effectiveValue || `var(${field.name})`}
					strings={{ picker: strings.chooseColor(field.label) }}
					onValueChange={onChange}
					placeholder={placeholder}
					className={styles.controlInput}
				/>
				{resetAction}
			</div>
		)
	} else if (field.control?.type === "range") {
		const control_ = field.control
		const current = parseRangeValue(value || effectiveValue, control_)
		control = (
			<Stack gap="sm">
				<SliderField
					id={`${id}-slider`}
					aria-label={strings.adjustVariable(field.label)}
					value={current}
					min={control_.min}
					max={control_.max}
					step={control_.step}
					onValueChange={(next: number) => onChange(serializeRangeValue(next, control_))}
				/>
				<div className={styles.controlRow}>
					<DecimalInput
						id={id}
						aria-label={field.label}
						value={String(current)}
						decimalPlaces={control_.decimalPlaces ?? 3}
						min={control_.min}
						max={control_.max}
						allowEmpty
						// No blur normalisation: it would rewrite what the reader is still deciding on.
						normalizeOnBlur={false}
						endAdornment={control_.unit}
						onChange={(event) => {
							const next = event.target.value.trim()
							onChange(next ? `${next}${control_.unit ?? ""}` : "")
						}}
						className={cx(styles.numberInput, textClassName({ size: "inherit", mono: true }))}
					/>
					{resetAction}
				</div>
			</Stack>
		)
	} else {
		control = (
			<div className={styles.controlRow}>
				<Input
					id={id}
					aria-label={field.label}
					value={value}
					onChange={(event) => onChange(event.target.value)}
					placeholder={placeholder}
					className={cx(styles.controlInput, textClassName({ size: "inherit", mono: true }))}
				/>
				{resetAction}
			</div>
		)
	}

	return (
		<FormField
			label={
				<span className={styles.fieldLabel}>
					<Text tag="span" size="inherit" weight="medium" truncate>
						{field.label}
					</Text>
					<MonoValue size="xs" type="secondary">{field.name}</MonoValue>
				</span>
			}
			className={styles.field}
		>
			{control}
		</FormField>
	)
}

function DefaultThemePreview({ strings }: { strings: ThemeTweakerStrings }) {
	return (
		<ContentBlock
			surface="bordered"
			icon={<PaletteIcon />}
			title={strings.previewTitle}
			description={strings.previewDescription}
		>
			<Stack>
				<Stack direction="horizontal" gap="sm" wrap>
					<Badge tone="success">{strings.previewSuccess}</Badge>
					<Badge tone="warning">{strings.previewWarning}</Badge>
					<Badge tone="neutral">{strings.previewContract}</Badge>
				</Stack>

				<Item surface="muted">
					<ItemMedia variant="icon"><PaletteIcon /></ItemMedia>
					<ItemContent>
						<ItemTitle>{strings.previewItemTitle}</ItemTitle>
						<ItemDescription>{strings.previewItemDescription}</ItemDescription>
					</ItemContent>
					<CheckCircle2Icon aria-hidden className={styles.previewCheck} />
				</Item>

				<FormField label={strings.previewFieldLabel}>
					<Input placeholder={strings.previewFieldPlaceholder} />
				</FormField>

				<Button type="button">{strings.previewAction}</Button>
			</Stack>
		</ContentBlock>
	)
}

/**
 * Edits the kit's public theme contract live and exports the result. Controlled through
 * `value` / `onValueChange` for the theme and `config` / `onConfigChange` for the provider
 * settings. Set `apply={false}` when the application owns theme application; `preview={false}`
 * edits the actual app without a sample preview.
 */
export const ThemeTweaker = forwardRef<HTMLDivElement, ThemeTweakerProps>(function ThemeTweaker(
	{
		value,
		defaultValue,
		onValueChange,
		onModeChange,
		fields = defaultThemeTweakerFields,
		target = "self",
		apply = true,
		manageModeClass = true,
		preview,
		fileName = "theme.css",
		config,
		defaultConfig,
		onConfigChange,
		providerFileName = "ui.config.ts",
		showIntro = true,
		selectors,
		onExport,
		onCopy,
		onReset,
		onError,
		actionsSlot,
		strings,
		className,
		...props
	},
	forwardedRef,
) {
	const copy = resolveStrings(defaultThemeTweakerStrings, strings)

	const [internalTheme, setInternalTheme] = useState(() => createTheme(defaultValue))
	const theme = useMemo(() => (value ? createTheme(value) : internalTheme), [internalTheme, value])

	const [internalConfig, setInternalConfig] = useState(() =>
		createSerializableUIConfig(defaultConfig),
	)
	const providerConfig = useMemo(
		() => createSerializableUIConfig(config ?? internalConfig),
		[config, internalConfig],
	)

	const [group, setGroup] = useState<ThemeTweakerGroup>("colors")
	const [search, setSearch] = useState("")
	const [derivePalette, setDerivePalette] = useState(true)
	const [baseTypeSize, setBaseTypeSize] = useState(16)
	const [typeRatio, setTypeRatio] = useState(1.2)
	const [elevationIntensity, setElevationIntensity] = useState(0.8)
	const [actionStatus, setActionStatus] = useState<ActionStatus>("idle")
	const [exporting, setExporting] = useState(false)

	// `overlayProps` is exactly the open/change pair ActionDialog wants.
	const exportDialog = useOverlayVisibility()

	const selfRef = useRef<HTMLDivElement>(null)
	useImperativeHandle(forwardedRef, () => selfRef.current as HTMLDivElement)

	useAppliedTheme({ apply, manageModeClass, selfRef, target, theme })

	const [resolvedTheme, setResolvedTheme] = useState<ThemeDefinition>(() => createTheme(theme))
	const [effectiveValues, setEffectiveValues] = useState<Record<string, string>>({})

	/*
	 * Deferred by a timeout: the effect that applies the theme must land before this reads
	 * the resolved values, and same-commit effects run in mount order.
	 */
	useEffect(() => {
		if (typeof window === "undefined") return
		const timer = window.setTimeout(() => {
			const element = resolveInspectionTarget(target, selfRef.current)
			if (!element) return
			const resolved = captureResolvedTheme(theme, fields, element)
			/* A colour shows the half for the mode being edited. */
			setEffectiveValues(
				Object.fromEntries(
					fields.map((field) => [
						field.name,
						(field.scope === "shared" ? resolved.shared : resolved[theme.mode])[field.name] ?? "",
					]),
				),
			)
			setResolvedTheme(resolved)
		}, 0)
		return () => window.clearTimeout(timer)
	}, [apply, fields, target, theme])

	const serialization = useMemo(() => {
		try {
			// The edits layered over the resolved snapshot.
			const exportTheme = createTheme({
				mode: theme.mode,
				shared: { ...resolvedTheme.shared, ...theme.shared },
				light: { ...resolvedTheme.light, ...theme.light },
				dark: { ...resolvedTheme.dark, ...theme.dark },
			})
			return {
				artifact: createThemeExportArtifact(
					theme,
					fileName,
					{ selectors },
					{ resolvedTheme: exportTheme, providerConfig, providerFileName },
				),
				error: null,
			}
		} catch (error) {
			return { artifact: null, error }
		}
	}, [fileName, providerConfig, providerFileName, resolvedTheme, selectors, theme])

	const { artifact, error: serializationError } = serialization
	const cssText = artifact?.cssText ?? `/* ${copy.invalidTheme} */\n`
	const overrideCount = useMemo(() => countThemeOverrides(theme), [theme])

	const query = search.trim().toLowerCase()

	/* Search spans every group, so a known token name is found regardless of its tab. */
	const visibleFields = useMemo(
		() =>
			fields.filter((field) => {
				if (!query) return field.group === group
				return [field.name, field.label, field.description].some((part) =>
					part?.toLowerCase().includes(query),
				)
			}),
		[fields, group, query],
	)

	const visibleSections = useMemo(() => {
		const sections = new Map<string, VisibleThemeSection>()
		for (const field of visibleFields) {
			const key = `${field.group}:${field.section}`
			const existing = sections.get(key)
			if (existing) existing.fields.push(field)
			else sections.set(key, { group: field.group, section: field.section, fields: [field] })
		}
		return [...sections.values()]
	}, [visibleFields])

	const commit = (next: ThemeDefinition) => {
		if (value === undefined) setInternalTheme(next)
		onValueChange?.(next)
		setActionStatus("idle")
	}

	const applyModeRecipe = (overrides: ThemeOverrides) => {
		commit({ ...theme, [theme.mode]: { ...theme[theme.mode], ...overrides } })
	}

	const applySharedRecipe = (overrides: ThemeOverrides) => {
		commit({ ...theme, shared: { ...theme.shared, ...overrides } })
	}

	const setMode = (mode: ThemeMode) => {
		if (mode === theme.mode) return
		commit({ ...theme, mode })
		onModeChange?.(mode)
	}

	const copyToClipboard = async (text: string) => {
		try {
			if (onCopy) await onCopy(text)
			else if (typeof navigator !== "undefined" && navigator.clipboard) {
				await navigator.clipboard.writeText(text)
			} else {
				throw new Error("No clipboard here. Pass onCopy for this environment.")
			}
			setActionStatus("copied")
		} catch (error) {
			onError?.(error)
		}
	}

	const exportTheme = async () => {
		try {
			if (serializationError) throw serializationError
			if (!artifact) throw new Error(copy.invalidTheme)
			setExporting(true)
			if (onExport) await onExport(artifact)
			else downloadTheme(artifact)
			setActionStatus("exported")
		} catch (error) {
			onError?.(error)
		} finally {
			setExporting(false)
		}
	}

	const exportProviderConfig = () => {
		try {
			if (!artifact) throw serializationError ?? new Error(copy.invalidTheme)
			downloadTextFile({
				fileName: artifact.providerFileName,
				text: artifact.providerConfigText,
				mimeType: "text/typescript;charset=utf-8",
			})
			setActionStatus("exported")
		} catch (error) {
			onError?.(error)
		}
	}

	const reset = () => {
		const previous = theme
		commit(createTheme({ mode: theme.mode }))
		onReset?.(previous)
	}

	const statusMessage = serializationError
		? copy.invalidTheme
		: actionStatus === "copied"
			? copy.copiedStatus
			: actionStatus === "exported"
				? copy.exportedStatus
				: null

	const recipeControls =
		group === "colors" ? (
			<ContentBlock surface="bordered">
				<ToggleField
					label={copy.autoPalette}
					description={copy.autoPaletteDescription}
					value={derivePalette}
					onValueChange={setDerivePalette}
				/>
			</ContentBlock>
		) : group === "typography" ? (
			<ContentBlock surface="bordered" title={copy.typeRecipeTitle} description={copy.typeRecipeDescription}>
				<Grid columns={{ base: 1, sm: 2 }} gap="sm">
					<FormField label={copy.baseTypeSize}>
						<SliderField
							aria-label={copy.baseTypeSize}
							value={baseTypeSize}
							min={14}
							max={20}
							step={1}
							onValueChange={(next: number) => {
								setBaseTypeSize(next)
								applySharedRecipe(deriveThemeTypeScale({ baseSize: next, ratio: typeRatio }))
							}}
						/>
					</FormField>
					<FormField label={copy.typeRatio}>
						<SliderField
							aria-label={copy.typeRatio}
							value={typeRatio}
							min={1.125}
							max={1.333}
							step={0.01}
							onValueChange={(next: number) => {
								setTypeRatio(next)
								applySharedRecipe(deriveThemeTypeScale({ baseSize: baseTypeSize, ratio: next }))
							}}
						/>
					</FormField>
				</Grid>
			</ContentBlock>
		) : group === "shape" ? (
			<ContentBlock
				surface="bordered"
				title={copy.elevationRecipeTitle}
				description={copy.elevationRecipeDescription}
			>
				<FormField label={copy.elevationIntensity}>
					<SliderField
						aria-label={copy.elevationIntensity}
						value={elevationIntensity}
						min={0}
						max={1}
						step={0.05}
						onValueChange={(next: number) => {
							setElevationIntensity(next)
							applySharedRecipe(deriveThemeElevation({ intensity: next }))
						}}
					/>
				</FormField>
			</ContentBlock>
		) : null

	const content = (
		<div className={cx(styles.layout, preview !== false && styles.layoutWithPreview)}>
			<div className={styles.controls}>
				<Stack>
					{showIntro && (
						<Stack gap="sm">
							<Stack direction="horizontal" gap="sm" align="center" wrap>
								<Heading level={2}>{copy.title}</Heading>
								<Badge tone="neutral">{copy.changedCount(overrideCount)}</Badge>
							</Stack>
							<Text type="secondary">{copy.description}</Text>
						</Stack>
					)}

					<div className={styles.toolbar}>
						<Stack direction="horizontal" gap="sm" align="center" wrap>
							<Tabs value={theme.mode} onValueChange={(next) => setMode(next as ThemeMode)}>
								<TabList variant="enclosed">
									<Tab value="light"><SunIcon />{copy.lightMode}</Tab>
									<Tab value="dark"><MoonIcon />{copy.darkMode}</Tab>
								</TabList>
							</Tabs>
						</Stack>

						<Stack direction="horizontal" gap="sm" align="center" justify="end" wrap={false}>
							<Button
								type="button"
								tone="neutral"
								appearance="outline"
								disabled={!!serializationError}
								onClick={() => {
									setActionStatus("idle")
									exportDialog.show()
								}}
							>
								<DownloadIcon />
								{copy.export}
							</Button>
							{actionsSlot}
						</Stack>
					</div>

					<FormField label={<VisuallyHidden>{copy.searchLabel}</VisuallyHidden>}>
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={copy.searchPlaceholder}
							startIcon={SearchIcon}
							clearable
							onClear={() => setSearch("")}
						/>
					</FormField>
				</Stack>

				<Tabs value={group} onValueChange={(next) => {
					setSearch("")
					setGroup(next as ThemeTweakerGroup)
				}}>
					<TabList variant="enclosed" edgeFade label={copy.groupNavigationLabel}>
						{GROUPS.map((one) => (
							<Tab key={one} value={one}>
								{GROUP_ICONS[one]}
								<Text tag="span" size="inherit" weight="medium">{copy.groups[one]}</Text>
							</Tab>
						))}
					</TabList>
					<TabPanel value={group}>
						<Stack>
							<Stack gap="sm">
								<Stack direction="horizontal" gap="sm" align="center" wrap>
									<Heading level={3} size="base">{query ? copy.allGroups : copy.groups[group]}</Heading>
									{!!query && (
										<Badge tone="neutral" role="status" aria-live="polite">
											{copy.searchResults(visibleFields.length)}
										</Badge>
									)}
								</Stack>
								<Text type="secondary">
									{query ? copy.searchHint : copy.groupDescriptions[group]}
								</Text>
							</Stack>

							{!query && recipeControls}

							{group === "defaults" && !query ? (
								<UIConfigSettings
									config={providerConfig}
									onChange={(next) => {
										if (config === undefined) setInternalConfig(next)
										onConfigChange?.(next)
										setActionStatus("idle")
									}}
									strings={copy.providerSettings}
								/>
							) : visibleSections.length > 0 ? (
								<Accordion
									// Remounted per group and search, so the new list's first section opens.
									key={`${group}:${query}`}
									multiple
									defaultValue={[`${visibleSections[0]!.group}:${visibleSections[0]!.section}`]}
									surface="bordered"
									media="none"
									items={visibleSections.map((section) => {
										const scopes = new Set(section.fields.map((field) => field.scope))
										const scopeLabel =
											scopes.size > 1
												? copy.mixedScope
												: scopes.has("shared")
													? copy.sharedScope
													: theme.mode === "light"
														? copy.lightMode
														: copy.darkMode

										return {
											value: `${section.group}:${section.section}`,
											// While searching, titles name their group (section names repeat across groups).
											title: query
												? copy.groupSectionLabel(
														copy.groups[section.group],
														copy.sections[section.section],
													)
												: copy.sections[section.section],
											description: copy.variableCount(section.fields.length),
											badge: <Badge tone="neutral">{scopeLabel}</Badge>,
											content: (
												<div className={styles.fields}>
													{section.fields.map((field) => {
														const bucket = field.scope === "shared" ? "shared" : theme.mode
														return (
															<ThemeVariableField
																key={field.name}
																field={field}
																value={theme[bucket][field.name] ?? ""}
																effectiveValue={effectiveValues[field.name] ?? ""}
																strings={copy}
																onChange={(next) => {
																	// With the recipe on, `--primary` pulls the whole palette with it.
																	if (field.name === "--primary" && derivePalette && next.trim()) {
																		applyModeRecipe(
																			deriveThemePalette({ primary: next, mode: theme.mode }),
																		)
																		return
																	}
																	commit(updateThemeVariable(theme, field, next))
																}}
																onReset={() => commit(updateThemeVariable(theme, field, ""))}
															/>
														)
													})}
												</div>
											),
										}
									})}
								/>
							) : (
								<Empty border title={copy.emptySearch} description={false} />
							)}
						</Stack>
					</TabPanel>
				</Tabs>
			</div>

			{preview !== false && (
				<div className={styles.preview}>{preview ?? <DefaultThemePreview strings={copy} />}</div>
			)}

			<ActionDialog
				{...exportDialog.overlayProps}
				title={copy.exportDialogTitle}
				description={copy.exportDialogDescription}
				showCloseButton={false}
				showCancel={false}
				showConfirm={false}
				width="xl"
				/* The dialog is portaled out of the ThemeScope, so the edited variables are carried onto its surface. */
				surfaceStyle={themeToStyle(theme)}
				className={theme.mode}
				footer={
					<div className={styles.exportFooter}>
						<Button
							type="button"
							tone="neutral"
							appearance="ghost"
							disabled={overrideCount === 0}
							onClick={reset}
						>
							<RotateCcwIcon />
							{copy.reset}
						</Button>
						{/* `render`: the Button is the close itself and keeps its geometry. */}
						<OverlayClose render={<Button type="button" tone="neutral" appearance="outline" />}>
							{copy.close}
						</OverlayClose>
					</div>
				}
			>
				<Stack>
					<ThemeExportBlock
						title={copy.cssOutputLabel}
						description={copy.cssOutputDescription}
						code={cssText}
						copyLabel={copy.copy}
						downloadLabel={exporting ? copy.exportPending : copy.downloadCss}
						downloading={exporting}
						onCopy={() => void copyToClipboard(cssText)}
						onDownload={() => void exportTheme()}
					/>
					<ThemeExportBlock
						title={copy.providerOutputLabel}
						description={copy.providerOutputDescription}
						code={artifact?.providerConfigText ?? ""}
						copyLabel={copy.copyProvider}
						downloadLabel={copy.downloadProvider}
						onCopy={() => void copyToClipboard(artifact?.providerConfigText ?? "")}
						onDownload={exportProviderConfig}
					/>
					{!!statusMessage && (
						<Text
							tag="div"
							size="xs"
							type={serializationError ? "error" : "secondary"}
							role="status"
							aria-live="polite"
						>
							{statusMessage}
						</Text>
					)}
				</Stack>
			</ActionDialog>
		</div>
	)

	if (target === "self") {
		return (
			<ThemeScope
				{...props}
				ref={selfRef}
				theme={apply ? theme : createTheme({ mode: theme.mode })}
				className={cx("theme-tweaker--component", styles.root, styles.rootScoped, className)}
			>
				{content}
			</ThemeScope>
		)
	}

	return (
		<div {...props} ref={selfRef} className={cx("theme-tweaker--component", styles.root, className)}>
			{content}
		</div>
	)
})
