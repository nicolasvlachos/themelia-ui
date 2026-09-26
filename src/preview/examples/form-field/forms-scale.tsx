import { Stack } from "themelia-ui/base/structure"
import { Input, NativeSelect } from "themelia-ui/base/text-inputs"
import { MonoValue } from "themelia-ui/primitives"
import { Scope } from "themelia-ui/ui-provider"

export default function FormsScale() {
	return (
		<Stack gap="lg" style={{ width: "100%" }}>
			{[1, 0.875, 1.125].map((scale) => (
				<Scope key={scale} vars={{ "--density-scale": scale }}>
					<Stack direction="horizontal" gap="md" align="center" justify="start">
						{/* Widths on the wrappers: Input's style lands on the inner control, not its frame. */}
						<MonoValue size="xs" style={{ width: "3.5rem", flexShrink: 0, fontSize: "0.75rem" }}>
							{scale}
						</MonoValue>
						{/* Named even in a geometry demo: a placeholder is not a label. */}
						<div style={{ width: "12rem", flexShrink: 0 }}>
							<Input placeholder="Field" aria-label={`Example field at density ${scale}`} />
						</div>
						<div style={{ width: "9rem", flexShrink: 0 }}>
							<NativeSelect defaultValue="a" aria-label={`Example select at density ${scale}`}>
								<option value="a">Option</option>
							</NativeSelect>
						</div>
					</Stack>
				</Scope>
			))}
		</Stack>
	)
}
