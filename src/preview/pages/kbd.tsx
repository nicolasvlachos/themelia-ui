import { Kbd, KbdGroup } from "@/components/base/display"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function KbdPage() {
	return (
		<ComponentPage
			title="Keyboard key"
			summary="A key cap for a shortcut written into the interface — a palette hint, a menu accelerator, a line of help. It is the browser's own kbd element underneath, so the meaning survives for a screen reader and in plain text without the styling."
			importPath="@/components/base/display"
			exports={["Kbd", "KbdGroup"]}
		>
			<Example
				id="kbd"
				title="Kbd"
				description="A key or a chord, as the browser's own <kbd>. Pass a chord as one string rather than nesting three of these — a screen reader announcing “K B D command K B D K” is worse than the plain text."
				stacked
				code={`<Kbd>⌘K</Kbd>

// A sequence — pressed one after another — is a group:
<KbdGroup><Kbd>G</Kbd><Kbd>I</Kbd></KbdGroup>`}
			>
				<Stack gap="sm">
					<Stack direction="horizontal" gap="md" align="center">
						<Text size="sm" type="secondary">Open the palette with</Text>
						<Kbd>⌘K</Kbd>
						<Text size="sm" type="secondary">or</Text>
						<Kbd>Ctrl K</Kbd>
						<Text size="sm" type="secondary">· close with</Text>
						<Kbd>Esc</Kbd>
					</Stack>
					<Stack direction="horizontal" gap="md" align="center">
						<Text size="sm" type="secondary">Go to the inbox with</Text>
						{/* A sequence: G, then I. The wider gap between caps says "in turn". */}
						<KbdGroup>
							<Kbd>G</Kbd>
							<Kbd>I</Kbd>
						</KbdGroup>
					</Stack>
				</Stack>
			</Example>

			<Example id="kbd-api" title="API">
				<PropTable
					rows={[
						{ name: "Kbd", type: "component", description: "One key, or one chord pressed together written as a single string — “⌘K”, not three caps. Every native kbd attribute passes through." },
						{ name: "KbdGroup", type: "component", description: "Several Kbd in a row, for a sequence pressed one after another — “G then I”. The caps sit further apart than the characters inside one, and that gap is what tells a reader the keys are pressed in turn rather than together." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
