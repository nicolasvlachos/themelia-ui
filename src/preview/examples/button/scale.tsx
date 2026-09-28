import { PlusIcon } from "lucide-react"

import { Button } from "themelia-ui/base/buttons"
import { Checkbox } from "themelia-ui/base/choice-inputs"
import { MonoValue } from "themelia-ui/primitives"
import { UIProvider } from "themelia-ui/ui-provider"

export default function Scale() {
	return (
		<>
			{([0.875, 1, 1.125] as const).map((scale) => (
				<UIProvider key={scale} config={{ scale }}>
					<div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
						{/* A fixed column and type size: the caption sits inside the scaled scope. */}
						<MonoValue
							size="xs"
							style={{ width: "5.5rem", flexShrink: 0, fontSize: "0.75rem" }}
						>
							scale {scale}
						</MonoValue>
						<Button>Save</Button>
						<Button tone="neutral" appearance="outline">Cancel</Button>
						<Button iconOnly aria-label="Add"><PlusIcon /></Button>
						<Checkbox label="Also this" defaultChecked />
					</div>
				</UIProvider>
			))}
		</>
	)
}
