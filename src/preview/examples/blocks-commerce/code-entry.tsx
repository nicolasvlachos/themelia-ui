import { useState } from "react"

import { CodeEntry } from "themelia-ui/admin/patterns/commerce"
import { AdaptiveGrid, GridCell } from "themelia-ui/base/structure"

function CodeEntryDemo({ gift = false }: { gift?: boolean }) {
	const [appliedCode, setAppliedCode] = useState<string | undefined>(gift ? "GC-4417-92AB" : undefined)
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState(false)
	return <CodeEntry
		kind={gift ? "gift" : "discount"}
		appliedCode={appliedCode}
		appliedDiscount={!gift && appliedCode ? "25.00 EUR" : undefined}
		balance={gift && appliedCode ? "45.00 EUR" : undefined}
		error={error}
		loading={loading}
		onApply={async code => {
			setLoading(true)
			setError(undefined)
			await new Promise(resolve => setTimeout(resolve, 600))
			if (code.toUpperCase() === (gift ? "GC-4417-92AB" : "WELCOME10")) setAppliedCode(code.toUpperCase())
			else setError(gift ? "Gift card not found. Try GC-4417-92AB." : "Code not found. Try WELCOME10.")
			setLoading(false)
		}}
		onRemove={() => { setAppliedCode(undefined); setError(undefined) }}
	/>
}

export default function CodeEntryExample() {
	/* Two instances: empty on the left, applied on the right, covering both kinds. */
	return (
		<AdaptiveGrid minColumnWidth="lg" gap="xl">
			<GridCell>
				<CodeEntryDemo />
			</GridCell>
			<GridCell>
				<CodeEntryDemo gift />
			</GridCell>
		</AdaptiveGrid>
	)
}
