import { FieldGroup, FormField } from "@/components/base/forms"
import { MonoValue } from "@/components/primitives"
import { Stack } from "@/components/base/structure"
import { FieldShell, Input, NativeSelect } from "@/components/base/text-inputs"
import { Scope } from "@/lib/ui-provider"

import { MEASURE } from "../partials/measures"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function FormFieldPage() {
	return (
		<ComponentPage
			title="Form field"
			summary="The label, the supporting line, and the error, wired to whatever control sits inside. One supporting line, not three stacked hints."
			importPath="@/components/base/forms"
			exports={["FormField", "FieldGroup"]}
		>
			<Example
				id="form-field"
				title="FormField"
				description="Exactly one supporting line, resolved as error || helperText || hint. They replace each other rather than stacking, so a field never grows or shifts as validation state changes."
				stacked
				code={`<FormField
  label="Email"
  required
  hint="We only use this for receipts."
  error={errors.email}
>
  <Input type="email" />
</FormField>`}
			>
				<Stack gap="xl" style={MEASURE.field}>
					<FormField label="Email" required hint="We only use this for receipts.">
						<Input type="email" placeholder="you@example.com" />
					</FormField>
					<FormField label="Workspace" helperText="Lowercase letters and dashes only.">
						<Input defaultValue="acme-corp" />
					</FormField>
					<FormField label="Card number" error="That card number is not valid.">
						<Input defaultValue="4242 4242" />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="form-field-composition"
				title="Custom control composition"
				description="The render-function path hands the label, validation, support, and required wiring to a control even when consumer wrappers hide its actual input. FieldShell exposes the same adapter one level deeper."
				stacked
				code={`<FormField label="Weight" error={errors.weight}>
  {(fieldProps) => (
    <FieldShell {...fieldProps} end="kg">
      {(controlProps) => <WrappedNumberInput controlProps={controlProps} />}
    </FieldShell>
  )}
</FormField>`}
			>
				<div style={MEASURE.field}>
					<FormField label="Weight" required hint="Use the packaged weight.">
						{(fieldProps) => (
							<FieldShell {...fieldProps} end="kg">
								{(controlProps) => (
									<div style={{ display: "contents" }}>
										<Input type="number" defaultValue="24" {...controlProps} />
									</div>
								)}
							</FieldShell>
						)}
					</FormField>
				</div>
			</Example>

			<Example
				id="horizontal-fields"
				title="Horizontal fields"
				description="Label beside the control for settings rows, where a column of stacked labels wastes the width and separates each label from its value."
				stacked
				code={`<FormField orientation="horizontal" label="Display name">
  <Input />
</FormField>`}
			>
				<Stack gap="lg" style={{ width: "100%" }}>
					<FormField orientation="horizontal" label="Display name" hint="Shown on invoices.">
						<Input defaultValue="Acme Corporation" />
					</FormField>
					<FormField orientation="horizontal" label="Billing email" required>
						<Input type="email" defaultValue="billing@acme.com" />
					</FormField>
				</Stack>
			</Example>

			<Example
				id="forms-scale"
				title="Scale"
				description="No control takes a size prop. Density is scoped instead, so a form can run denser than the page around it."
				stacked
				code={`<Scope vars={{ "--density-scale": 0.875 }}>…</Scope>`}
			>
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
			</Example>

			<Example
				id="field-group"
				title="FieldGroup"
				description="Several controls that are ONE field — a date range, a name split in two, a card number and its expiry. A real fieldset with a legend, so the group is announced as a group and the supporting line belongs to all of it rather than being repeated under each box."
				stacked
				code={`<FieldGroup legend="Reporting period" description="Both ends are inclusive.">
  <FormField label="From"><Input type="date" /></FormField>
  <FormField label="To"><Input type="date" /></FormField>
</FieldGroup>`}
			>
				<div style={MEASURE.wide}>
					<FieldGroup legend="Reporting period" description="Both ends are inclusive.">
						<Stack direction="horizontal" gap="md">
							<FormField label="From">
								<Input type="date" defaultValue="2026-03-01" />
							</FormField>
							<FormField label="To">
								<Input type="date" defaultValue="2026-03-31" />
							</FormField>
						</Stack>
					</FieldGroup>
				</div>
			</Example>

			<Example id="forms-accessibility" title="Accessibility" stacked>
				<Callout>
					FormField owns the wiring: it associates the label, points{" "}
					<code>aria-describedby</code> at the supporting line, and sets{" "}
					<code>aria-invalid</code> on the control when there is an error. A caller who sets
					any of those explicitly keeps their value — the field fills gaps rather than
					overriding decisions. Errors are announced with <code>aria-live="polite"</code>{" "}
					so validation firing on each keystroke does not interrupt typing.
				</Callout>
			</Example>

			<Example id="form-field-api" title="API">
				<PropTable owner="FormField"
					rows={[
						{ name: "label", type: "ReactNode", description: "Wired to the control by a generated id unless the control has one." },
						{ name: "helperText", type: "ReactNode", description: "Middle priority: replaces hint, and is itself replaced by error." },
						{ name: "error", type: "ReactNode", description: "Highest priority of the three supporting lines. Announced politely and switches the control to its invalid state." },
						{ name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Label above the control, or beside it." },
						{ name: "required", type: "boolean", description: "Marks the label and the control." },
						{ name: "FieldGroup", type: "component", description: "Several fields sharing one label and one supporting line — a date range, a name split in two." },
						{ name: "htmlFor", type: "string", description: "Associates the label with a control that already has an id, instead of the generated one." },
						{ name: "children", type: "ReactNode | (controlProps) => ReactNode", description: "Use the function form when a consumer wrapper hides the actual control; spread the supplied id and aria props onto it." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
