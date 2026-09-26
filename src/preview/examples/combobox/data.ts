export const COUNTRY_NAMES = [
	"Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
	"Denmark", "Finland", "France", "Germany", "Greece", "Iceland", "Ireland",
	"Italy", "Japan", "Kenya", "Mexico", "Netherlands", "New Zealand", "Norway",
	"Poland", "Portugal", "Spain", "Sweden", "Switzerland",
]

export interface Country {
	code: string
	name: string
	region: string
	capital: string
}

export const COUNTRIES: Country[] = [
	{ code: "GR", name: "Greece", region: "Europe", capital: "Athens" },
	{ code: "GB", name: "United Kingdom", region: "Europe", capital: "London" },
	{ code: "GE", name: "Georgia", region: "Asia", capital: "Tbilisi" },
	{ code: "DE", name: "Germany", region: "Europe", capital: "Berlin" },
	{ code: "GH", name: "Ghana", region: "Africa", capital: "Accra" },
	{ code: "GT", name: "Guatemala", region: "Americas", capital: "Guatemala City" },
	{ code: "GY", name: "Guyana", region: "Americas", capital: "Georgetown" },
	{ code: "GN", name: "Guinea", region: "Africa", capital: "Conakry" },
	{ code: "GA", name: "Gabon", region: "Africa", capital: "Libreville" },
	{ code: "GM", name: "Gambia", region: "Africa", capital: "Banjul" },
]

export const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		const timer = setTimeout(resolve, ms)
		signal?.addEventListener("abort", () => {
			clearTimeout(timer)
			reject(new DOMException("Aborted", "AbortError"))
		})
	})

/** The consumer's filter. The pickers deliberately do none of their own. */
export const matching = (query: string) =>
	COUNTRIES.filter((country) => country.name.toLowerCase().includes(query.toLowerCase()))

/** Like a real endpoint: the first page is instant, a search waits, so the loading row shows. */
export async function searchCountries({ query, limit, signal }: { query: string; limit: number; signal?: AbortSignal }) {
	if (query) await wait(450, signal)
	return matching(query).slice(0, limit)
}
