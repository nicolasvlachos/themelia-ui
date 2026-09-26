import { Example } from "../partials/example"
import { ComponentPage } from "../partials/component-page"
import { PropTable } from "../partials/prop-table"

export function ButtonPage() {
	return (
		<ComponentPage>
			<Example
				example="button/tone-style"
				title="Tone × style"
				description="Seven tones by three treatments. The matrix is generated, so a new tone is four variables rather than nine rules."
			/>

			<Example
				example="button/scale"
				title="Scale, not size"
				description="There is no size prop. Geometry comes from one scale factor, so every button on a surface is the same button — a denser region is a scope, which moves its controls together instead of one at a time."
			/>

			<Example
				example="button/state"
				title="State"
				description="A loading button keeps its label's space, so it cannot resize under a cursor that is already over it. The pair below is the same button in both states — identical width, and the label is still there for a screen reader under aria-busy."
			/>

			<Example
				example="button/icon-only"
				title="Icon only"
				description="A square button sized to its own height. The label becomes the accessible name."
			/>

			<Example
				example="button/group"
				title="Group"
				description="Adjacent buttons that read as one control: the seam collapses to a single hairline and inner corners square off."
			/>

			<Example
				example="button/button-variants"
				title="Three buttons that are not styles"
				description="A style prop cannot express these, because each changes what the button IS rather than how it looks. TextButton reads as a link but stays a button, so a screen reader announces &quot;button&quot; and Space activates it — anything that navigates should be a real anchor even when it looks identical. LoaderButton owns its pending state and can run the handler itself. TooltipButton makes the tooltip the accessible NAME, which is the commonest way an icon button stops being usable without a mouse."
			/>

			<Example
				example="button/button-group-parts"
				title="Separators and text inside a group"
				description="A group welds its children into one control, so a divider inside it is not a Separator — that would draw a full-height rule against the group's own border. ButtonGroupSeparator is the seam, and ButtonGroupText is a label that sits in the run without becoming pressable."
			/>

			<Example
				id="api"
				title="API">
				<PropTable owner="Button"
					rows={[
						{ name: "tone", type: "SemanticTone", default: "primary", description: "Semantic colour intent. Resolves through the provider when omitted." },
						{ name: "buttonStyle", type: '"solid" | "outline" | "ghost"', default: "solid", description: "Fill treatment, independent of tone." },
						{ name: "iconOnly", type: "boolean", default: "false", description: "Square button sized to its height." },
						{ name: "fullWidth", type: "boolean", default: "false", description: "Stretches to the container." },
						{ name: "loading", type: "boolean", default: "false", description: "Shows a spinner and blocks interaction without resizing." },
						{ name: "render", type: "ReactElement", description: "The element the button becomes — an anchor, a router link. The label keeps its wrapper, so a link still sizes like a button." },
						{ name: "TextButton tone", type: "SemanticTone", default: '"primary"', description: "A button that reads as a link. It carries its own `data-slot` so nothing downstream mistakes it for a ghost button that should line up with controls — it is inline prose." },
						{ name: "LoaderButton loading / onClick", type: "boolean / () => void | Promise<void>", description: "Omit loading and the button holds the state itself, from the promise the handler returns. It also announces the wait, which Button's own loading prop does not." },
						{ name: "TooltipButton tooltip", type: "string", required: true, description: "Shown on hover and focus, AND used as the accessible name. That pairing is the point: an icon button with a tooltip and no aria-label is unnamed to everyone not using a mouse." },
						{ name: "ButtonGroupSeparator / ButtonGroupText", type: "component", description: "The seam between welded buttons, and a label that sits in the run without becoming pressable. A plain Separator here would draw a full-height rule against the group's own border." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
