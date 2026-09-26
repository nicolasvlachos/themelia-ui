import { PlusIcon } from "lucide-react"

import {
	Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText, LoaderButton, TextButton,
	TooltipButton,
} from "@/components/base/buttons"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"
import { MonoValue } from "@/components/primitives"
import { Checkbox } from "@/components/base/choice-inputs"
import { UIProvider } from "@/lib/ui-provider"
import type { ButtonStyle, ButtonTone } from "@/components/base/buttons"

import { Example } from "../partials/example"
import { ComponentPage } from "../partials/component-page"
import { PropTable } from "../partials/prop-table"

const TONES: ButtonTone[] = [
	"neutral", "primary", "secondary", "info", "success", "warning", "destructive",
]
const STYLES: ButtonStyle[] = ["solid", "outline", "ghost"]

export function ButtonPage() {
	return (
		<ComponentPage
			title="Button"
			summary="The action primitive. Presentation splits along two independent axes: tone is semantic colour intent, buttonStyle is fill treatment."
			importPath="@/components/base/buttons"
			exports={[
				"Button", "ButtonGroup", "ButtonGroupSeparator", "ButtonGroupText",
				"TextButton", "LoaderButton", "TooltipButton",
			]}
		>
			<Example
				id="tone-style"
				title="Tone × style"
				description="Seven tones by three treatments. The matrix is generated, so a new tone is four variables rather than nine rules."
				stacked
				code={`<Button tone="destructive" buttonStyle="ghost">Delete</Button>`}
			>
				{STYLES.map((buttonStyle) => (
					<div key={buttonStyle} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
						{TONES.map((tone) => (
							<Button key={tone} tone={tone} buttonStyle={buttonStyle}>
								{tone}
							</Button>
						))}
					</div>
				))}
			</Example>

			<Example
				id="scale"
				title="Scale, not size"
				description="There is no size prop. Geometry comes from one scale factor, so every button on a surface is the same button — a denser region is a scope, which moves its controls together instead of one at a time."
				stacked
				code={`{/* not this */}
<Button>Save</Button>

{/* this — the whole region stays in proportion */}
<UIProvider config={{ scale: 0.875 }}>
  <Toolbar />
</UIProvider>`}
			>
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
							<Button tone="neutral" buttonStyle="outline">Cancel</Button>
							<Button iconOnly aria-label="Add"><PlusIcon /></Button>
							<Checkbox label="Also this" defaultChecked />
						</div>
					</UIProvider>
				))}
			</Example>

			<Example
				id="state"
				title="State"
				description="A loading button keeps its label's space, so it cannot resize under a cursor that is already over it. The pair below is the same button in both states — identical width, and the label is still there for a screen reader under aria-busy."
				code={`<Button>Save changes</Button>
<Button loading>Save changes</Button>
<Button disabled>Disabled</Button>`}
			>
				<Button>Save changes</Button>
				<Button loading>Save changes</Button>
				<Button disabled>Disabled</Button>
				<Button tone="neutral" buttonStyle="outline" loading>
					Loading
				</Button>
			</Example>

			<Example
				id="icon-only"
				title="Icon only"
				description="A square button sized to its own height. The label becomes the accessible name."
				code={`<Button iconOnly aria-label="Settings">⚙</Button>`}
			>
				<Button iconOnly aria-label="Add"><PlusIcon /></Button>
				<Button tone="neutral" buttonStyle="outline" iconOnly aria-label="Edit">✎</Button>
				<Button tone="destructive" buttonStyle="ghost" iconOnly aria-label="Delete">🗑</Button>
			</Example>

			<Example
				id="group"
				title="Group"
				description="Adjacent buttons that read as one control: the seam collapses to a single hairline and inner corners square off."
				code={`<ButtonGroup>\n  <Button buttonStyle="outline" tone="neutral">Day</Button>\n  <Button buttonStyle="outline" tone="neutral">Week</Button>\n</ButtonGroup>`}
			>
				<ButtonGroup>
					<Button tone="neutral" buttonStyle="outline">Day</Button>
					<Button tone="neutral" buttonStyle="outline">Week</Button>
					<Button tone="neutral" buttonStyle="outline">Month</Button>
				</ButtonGroup>
				<ButtonGroup orientation="vertical">
					<Button tone="neutral" buttonStyle="outline">Top</Button>
					<Button tone="neutral" buttonStyle="outline">Bottom</Button>
				</ButtonGroup>
			</Example>

			<Example
				id="button-variants"
				title="Three buttons that are not styles"
				description="A style prop cannot express these, because each changes what the button IS rather than how it looks. TextButton reads as a link but stays a button, so a screen reader announces &quot;button&quot; and Space activates it — anything that navigates should be a real anchor even when it looks identical. LoaderButton owns its pending state and can run the handler itself. TooltipButton makes the tooltip the accessible NAME, which is the commonest way an icon button stops being usable without a mouse."
				stacked
				code={`<TextButton onClick={undo}>Undo</TextButton>
<LoaderButton onClick={async () => save()}>Save</LoaderButton>
<TooltipButton tooltip="Archive" iconOnly><ArchiveIcon /></TooltipButton>`}
			>
				<Stack direction="horizontal" gap="xl" wrap align="center">
					<Text size="xs" type="secondary">
						Changed your mind? <TextButton>Undo the import</TextButton>
					</Text>
					<LoaderButton
						tone="neutral"
						buttonStyle="outline"
						onClick={() => new Promise((resolve) => setTimeout(resolve, 1200))}
					>
						Save and wait
					</LoaderButton>
					<TooltipButton tooltip="Archive this order" tone="neutral" buttonStyle="outline">
						Archive
					</TooltipButton>
				</Stack>
			</Example>

			<Example
				id="button-group-parts"
				title="Separators and text inside a group"
				description="A group welds its children into one control, so a divider inside it is not a Separator — that would draw a full-height rule against the group's own border. ButtonGroupSeparator is the seam, and ButtonGroupText is a label that sits in the run without becoming pressable."
				stacked
				code={`<ButtonGroup>
  <Button>Day</Button>
  <ButtonGroupSeparator />
  <ButtonGroupText>of</ButtonGroupText>
  <Button>Week</Button>
</ButtonGroup>`}
			>
				<Stack direction="horizontal" gap="xl" wrap align="center">
					<ButtonGroup>
						<Button tone="neutral" buttonStyle="outline">Day</Button>
						<ButtonGroupSeparator />
						<Button tone="neutral" buttonStyle="outline">Week</Button>
						<ButtonGroupSeparator />
						<Button tone="neutral" buttonStyle="outline">Month</Button>
					</ButtonGroup>
					<ButtonGroup>
						<ButtonGroupText>Show</ButtonGroupText>
						<Button tone="neutral" buttonStyle="outline">All</Button>
						<Button tone="neutral" buttonStyle="outline">Open</Button>
					</ButtonGroup>
				</Stack>
			</Example>

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
