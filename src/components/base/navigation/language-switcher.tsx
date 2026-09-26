/**
 * LanguageSwitcher — pick the interface language. Each option is named in its own language
 * and carries `lang`, so a screen reader pronounces it correctly.
 */
import { CheckIcon, GlobeIcon } from "lucide-react"
import { resolveStrings } from "@/lib/strings"

import { defaultLanguageSwitcherStrings, type LanguageSwitcherStrings } from "./navigation.strings"
import { useId, type ComponentProps } from "react"

import { Button } from "@/components/base/buttons"
import { PillRadioGroup } from "@/components/base/choice-inputs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/base/dropdown-menu"
import { cx } from "@/lib/cx"

export interface LocaleOption {
	/** BCP 47 tag — "en", "nl", "pt-BR". */
	value: string
	/** The language's name IN that language — "Nederlands", not "Dutch". */
	label: string
}

export type LanguageSwitcherVariant = "menu" | "pills"

export interface LanguageSwitcherProps extends Omit<ComponentProps<"div">, "onSelect"> {
	locales: LocaleOption[]
	value?: string
	onSelect?: (value: string) => void
	/** `pills` for two or three languages; `menu` once there are more. */
	variant?: LanguageSwitcherVariant
	label?: string
	/** Overrides the default name for every switcher. */
	strings?: Partial<LanguageSwitcherStrings>
}

export function LanguageSwitcher({
	locales,
	value,
	onSelect,
	variant = "menu",
	label,
	strings,
	className,
	...props
}: LanguageSwitcherProps) {
	const copy = resolveStrings(defaultLanguageSwitcherStrings, strings)
	const active = locales.find((locale) => locale.value === value)
	const nameId = useId()
	const valueId = useId()

	if (variant === "pills") {
		return (
			<div className={cx("language-switcher--component", className)} {...props}>
				{/* No `name`: the pills are not a form field, and a shared one would collide between switchers. */}
				<PillRadioGroup
					aria-label={label ?? copy.label}
					value={value ?? null}
					onValueChange={(next) => next && onSelect?.(next)}
					options={locales.map((locale) => ({
						value: locale.value,
						// A node, so `lang` reaches the text the screen reader actually speaks.
						label: <span lang={locale.value}>{locale.label}</span>,
					}))}
				/>
			</div>
		)
	}

	return (
		<div className={cx("language-switcher--component", className)} {...props}>
			{/* The name starts with the label and ends with the visible language, so it contains what is shown. */}
			<span id={nameId} hidden>
				{label ?? copy.label}
			</span>
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button
							tone="neutral"
							buttonStyle="ghost"
							aria-labelledby={active ? `${nameId} ${valueId}` : label ? undefined : nameId}
						>
							<GlobeIcon />
							{active ? (
								<span id={valueId} lang={active.value}>
									{active.label}
								</span>
							) : (
								label
							)}
						</Button>
					}
				/>
				<DropdownMenuContent align="end">
					{locales.map((locale) => (
						<DropdownMenuItem
							key={locale.value}
							lang={locale.value}
							onClick={() => onSelect?.(locale.value)}
							// A tick marks the current one; a highlighted row would read as hover.
							trailing={locale.value === value ? <CheckIcon aria-hidden /> : undefined}
						>
							{locale.label}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
