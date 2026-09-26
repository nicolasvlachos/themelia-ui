export interface UIConfigSettingsStrings {
	title: string
	description: string
	boundaryTitle: string
	/** Says why these settings behave differently from the CSS ones. */
	boundaryDescription: string
	summary: { locale: string; currency: string; density: string; textSize: string }
	sections: {
		regional: { title: string; description: string }
		presentation: { title: string; description: string }
		money: { title: string; description: string }
	}
	labels: Record<
		| "locale" | "defaultCurrency" | "displayCurrency" | "moneyFormat" | "firstDay"
		| "dateFormat" | "textSize" | "density" | "scale" | "typographyScale"
		| "colorScheme" | "darkMenus" | "dualPricing" | "dualPricingMode" | "dualPricingLayout"
		| "secondaryEmphasis",
		string
	>
	darkMenusDescription: string
	dualPricingDescription: string
	displayCurrencyPlaceholder: string
	/** Display names for enum values, keyed by the value itself. */
	options: Record<string, string>
}

export const defaultUIConfigSettingsStrings: UIConfigSettingsStrings = {
	title: "Application defaults",
	description: "The display behaviour that ships alongside the exported CSS.",
	boundaryTitle: "Apply defaults through your provider",
	boundaryDescription:
		"Pass the edited configuration to UIProvider to apply it live. Connect ThemeTweaker's onConfigChange to your configuration state and pass that state to the provider. No remount is needed.",
	summary: { locale: "Locale", currency: "Currency", density: "Density", textSize: "Text size" },
	sections: {
		regional: {
			title: "Regional formatting",
			description: "Locale, dates, and the currency amounts are written in.",
		},
		presentation: {
			title: "Presentation",
			description: "Colour scheme, geometry scale, and the default type step.",
		},
		money: {
			title: "Money",
			description: "How an amount is written, and whether a second currency shows.",
		},
	},
	labels: {
		locale: "Locale",
		defaultCurrency: "Default currency",
		displayCurrency: "Display currency",
		moneyFormat: "Money format",
		firstDay: "First day of week",
		dateFormat: "Date format",
		textSize: "Default text size",
		density: "Density",
		scale: "Geometry scale",
		typographyScale: "Type scale",
		colorScheme: "Colour scheme",
		darkMenus: "Dark menus",
		dualPricing: "Dual pricing",
		dualPricingMode: "When the second value shows",
		dualPricingLayout: "Layout",
		secondaryEmphasis: "Secondary emphasis",
	},
	darkMenusDescription: "Dropdown and context menus render dark on a light page too.",
	dualPricingDescription: "Show a converted currency beside the primary one.",
	displayCurrencyPlaceholder: "Optional",
	options: {
		default: "Default",
		light: "Light",
		dark: "Dark",
		system: "System",
		compact: "Compact",
		comfortable: "Comfortable",
		inherit: "Inherit",
		xxs: "XXS",
		xs: "XS",
		pxs: "PXS",
		sm: "SM",
		base: "Base",
		lg: "LG",
		xl: "XL",
		decimal: "Decimal",
		"with-code": "With code",
		"with-symbol": "With symbol",
		"primary-only": "Primary only",
		dual: "Always",
		dynamic: "Only when they differ",
		inline: "Inline",
		stacked: "Stacked",
		discrete: "Discrete",
		muted: "Muted",
		match: "Match",
		hidden: "Hidden",
		sunday: "Sunday",
		monday: "Monday",
		tuesday: "Tuesday",
		wednesday: "Wednesday",
		thursday: "Thursday",
		friday: "Friday",
		saturday: "Saturday",
	},
}
