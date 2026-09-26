import { useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { Text } from "themelia-ui/base/typography"
import { MediaLibrary } from "themelia-ui/features/media-library"

import { ASSETS, COLLECTIONS } from "./data"

export default function BulkActions() {
	const [assets, setAssets] = useState(ASSETS)
	const [selected, setSelected] = useState<string[]>([ASSETS[0]!.id, ASSETS[1]!.id])
	const [note, setNote] = useState<string | null>(null)

	return (
		<>
			{/*
			 * `transform` makes this box the containing block for the floating bar, so it docks
			 * to the example rather than the viewport. The same applies in an app: a floating
			 * bar inside a transformed ancestor docks to that ancestor.
			 */}
			<div style={{ transform: "translate(0)", position: "relative", width: "100%" }}>
				<MediaLibrary
					items={assets}
					collections={COLLECTIONS}
					value={selected}
					onValueChange={setSelected}
					bulkActions={({ selectedCount, clearSelection }) => (
						<>
							<Button
								type="button"
								tone="neutral"
								buttonStyle="ghost"
								onClick={() => {
									setAssets((current) => current.map((asset) => selected.includes(asset.id) ? { ...asset, public: true } : asset))
									setNote(`Made ${selectedCount} assets public`)
									clearSelection()
								}}
							>
								Make public
							</Button>
							<Button
								type="button"
								tone="destructive"
								buttonStyle="ghost"
								onClick={() => {
									setAssets((current) => current.filter((asset) => !selected.includes(asset.id)))
									setNote(`Deleted ${selectedCount}`)
									clearSelection()
								}}
							>
								Delete
							</Button>
						</>
					)}
				/>
			</div>
			{!!note && <Text role="status" size="sm" type="secondary">{note}</Text>}
		</>
	)
}
