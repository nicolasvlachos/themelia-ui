export interface Customer {
	id: string
	name: string
	email: string
	plan: string
	spend: number
	lastSeen: string
}

export const CUSTOMERS: Record<string, Customer> = {
	"c-1": { id: "c-1", name: "Northwind Traders", email: "ops@northwind.test", plan: "Scale", spend: 48_200, lastSeen: "2026-08-27T09:12:00Z" },
	"c-2": { id: "c-2", name: "Contoso Ltd", email: "billing@contoso.test", plan: "Team", spend: 12_400, lastSeen: "2026-08-25T16:40:00Z" },
	"c-3": { id: "c-3", name: "Fabrikam Inc", email: "hello@fabrikam.test", plan: "Starter", spend: 1_950, lastSeen: "2026-08-20T11:05:00Z" },
}

export const wait = (ms: number, signal?: AbortSignal) =>
	new Promise<void>((resolve, reject) => {
		const timer = setTimeout(resolve, ms)
		signal?.addEventListener("abort", () => {
			clearTimeout(timer)
			reject(new DOMException("Aborted", "AbortError"))
		})
	})
