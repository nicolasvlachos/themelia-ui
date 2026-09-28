import { Stack } from "themelia-ui/base/structure"
import { Input, NativeSelect } from "themelia-ui/base/text-inputs"
import { MonoValue } from "themelia-ui/primitives"
import { UIScope } from "themelia-ui/ui-provider"

export default function FormsScale() {
	return (
		<Stack style={{ width: "100%" }}>
			{(["compact", "default", "comfortable"] as const).map((density) => (
				<UIScope key={density} config={{ density }}>
					<Stack direction="horizontal" gap="sm" align="center" justify="start">
						{/* Widths on the wrappers: Input's style lands on the inner control, not its frame. */}
						<MonoValue size="xs" style={{ width: "6rem", flexShrink: 0 }}>
							{density}
						</MonoValue>
						{/* Named even in a geometry demo: a placeholder is not a label. */}
						<div style={{ width: "12rem", flexShrink: 0 }}>
							<Input placeholder="Field" aria-label={`Example field at ${density} density`} />
						</div>
						<div style={{ width: "9rem", flexShrink: 0 }}>
							<NativeSelect defaultValue="a" aria-label={`Example select at ${density} density`}>
								<option value="a">Option</option>
							</NativeSelect>
						</div>
					</Stack>
				</UIScope>
			))}
		</Stack>
	)
}
