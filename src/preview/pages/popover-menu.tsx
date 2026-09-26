import { ChevronDownIcon, UserIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/base/buttons"
import { PopoverMenu, PopoverMenuPanel, type PopoverMenuItem } from "@/components/base/popover-menu"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { MEASURE } from "../partials/measures"
import { PropTable } from "../partials/prop-table"

const OWNERS: PopoverMenuItem[] = [
	{ value: "jane", label: "Jane McDonald", description: "jane@northwind.example", icon: <UserIcon /> },
	{ value: "raj", label: "Raj Patel", description: "raj@northwind.example", icon: <UserIcon /> },
	{ value: "mei", label: "Mei Chen", description: "mei@northwind.example", icon: <UserIcon /> },
	{ value: "sam", label: "Sam Okafor", description: "sam@northwind.example", icon: <UserIcon />, disabled: true },
]


export function PopoverMenuPage() {
	const [owner, setOwner] = useState("jane")
	const [failed, setFailed] = useState(true)
	const [picked, setPicked] = useState<string[]>(["raj"])

	return (
		<ComponentPage
			title="Popover menu"
			summary="A Popover holding a Command: trigger → header band → search → list → footer band. It picks a VALUE from a searchable list hung off any button — who owns this, which project, what status — where ActionMenu behind the same kind of trigger runs commands instead. It is not a form control: no field surface, no name, no form value. For those, the field IS the control — see Select and Combobox."
			importPath="@/components/base/popover-menu"
			exports={["PopoverMenu", "PopoverMenuPanel", "type PopoverMenuItem"]}
		>
			<Example
				id="popover-menu"
				title="PopoverMenu"
				description="Trigger, optional header, search, list, optional footer. The picker shape behind filter facets, operator selects, and assignee menus. `search={false}` drops the field for a list short enough to read at a glance; `loading` puts a strip where the list goes, because an async picker with no state reads as an empty one."
				stacked
				code={`<PopoverMenu
  trigger={<Button buttonStyle="outline">Owner</Button>}
  items={owners}
  onSelect={(item) => setOwner(item.value)}
/>`}
			>
				<Stack direction="horizontal" gap="xl" align="center">
					<PopoverMenu
						trigger={
							<Button buttonStyle="outline" tone="neutral">
								Owner
								<ChevronDownIcon />
							</Button>
						}
						items={OWNERS.map((item) => ({ ...item, selected: item.value === owner }))}
						onSelect={(item) => setOwner(item.value)}
						header={
							<Text size="xs" type="secondary">
								Assign to
							</Text>
						}
					/>
					<PopoverMenu
						trigger={
							<Button buttonStyle="outline" tone="neutral">
								No search
								<ChevronDownIcon />
							</Button>
						}
						search={false}
						items={OWNERS.slice(0, 3)}
						onSelect={() => {}}
					/>
					<PopoverMenu
						trigger={
							<Button buttonStyle="outline" tone="neutral">
								Loading
								<ChevronDownIcon />
							</Button>
						}
						loading
						items={[]}
						onSelect={() => {}}
					/>
				</Stack>
			</Example>

			<Example
				id="popover-menu-states"
				title="Error and minimum search"
				description="`error` stands where the rows would — `true` for `strings.error`, or a node of your own — and `onRetry` puts a control under it. It gives way to `loading`, so a retry in flight never shows beside the failure it is answering. `minSearchLength` keeps an empty field browsable and shows `strings.formatTypeToSearch` for one character up to the minimum."
				stacked
				code={`<PopoverMenu
  trigger={<Button buttonStyle="outline">Owner</Button>}
  items={owners}
  error={query.isError}
  onRetry={query.refetch}
  onSelect={(item) => setOwner(item.value)}
/>

<PopoverMenu trigger={trigger} items={owners} minSearchLength={2} onSelect={pick} />`}
			>
				<Stack direction="horizontal" gap="xl" align="center">
					<PopoverMenu
						trigger={
							<Button buttonStyle="outline" tone="neutral">
								Failed load
								<ChevronDownIcon />
							</Button>
						}
						items={failed ? [] : OWNERS}
						error={failed}
						onRetry={() => setFailed(false)}
						onSelect={() => setFailed(true)}
					/>
					<PopoverMenu
						trigger={
							<Button buttonStyle="outline" tone="neutral">
								Two characters
								<ChevronDownIcon />
							</Button>
						}
						items={OWNERS}
						minSearchLength={2}
						onSelect={() => {}}
					/>
				</Stack>
			</Example>

			<Example
				id="popover-menu-panel"
				title="PopoverMenuPanel"
				description="The same header, search, rows, states and footer without the popover, for a surface something else already owns — one step of a two-step popup, a sheet, a pill whose popover anchors to the whole pill. It owns no selection and closes nothing; the host decides both. The filter editors are built on it."
				stacked
				code={`<PopoverMenuPanel
  search={false}
  items={owners.map((owner) => ({ ...owner, selected: picked.includes(owner.value) }))}
  onSelect={(item) => toggle(item.value)}
/>`}
			>
				<div style={MEASURE.narrow}>
					<PopoverMenuPanel
						search={false}
						items={OWNERS.map((item) => ({ ...item, selected: picked.includes(item.value) }))}
						onSelect={(item) =>
							setPicked((current) =>
								current.includes(item.value)
									? current.filter((value) => value !== item.value)
									: [...current, item.value],
							)
						}
					/>
				</div>
			</Example>

			<Example id="popover-menu-composition" title="What it is made of" stacked>
				<Callout label="Two components, five regions">
					A <code>Popover</code> at <code>inset="flush"</code> with a <code>Command</code>{" "}
					inside it. Flush is what lets the header and footer run edge to edge, and it is why
					each band carries its own inset rather than inheriting the surface&rsquo;s. The list,
					its search field, its filtering and its empty row are all Command&rsquo;s — this
					component adds the trigger, the two bands, and the loading strip, and nothing else.
				</Callout>
				<Callout label="Where the filtering happens">
					The local matcher runs until you pass <code>onSearchChange</code>. Supplying it hands
					filtering to you and the matcher steps aside, rather than filtering an already
					filtered list — which is how a server-side search ends up showing nothing.
				</Callout>
				<Callout label="When to reach past it">
					This is a bounded convenience over Popover and Command, not a replacement for them.
					A shape outside &ldquo;trigger → header → search → list → footer&rdquo; — two lists
					side by side, a tree, a form in the panel — composes those two directly. Reaching for
					a <code>renderItem</code> that rebuilds the whole row for every item is the usual sign
					you have left the shape this component covers.
				</Callout>
			</Example>

			<Example id="popover-menu-which" title="Which of the five" stacked>
				<Callout label="It answers a question">
					<strong>PopoverMenu</strong> picks a value from a button.{" "}
					<strong>Select</strong> picks a value in a form — the field is the control, and it has
					a name and a form value. <strong>Combobox</strong> is the same job as parts rather
					than a recipe, for a field that has to be composed: multi-select, async, chips.
				</Callout>
				<Callout label="It does not run anything">
					<strong>ActionMenu</strong> and <strong>DropdownMenu</strong> sit behind the same kind
					of trigger and carry VERBS — rename, duplicate, delete. A menu whose rows are things
					that happen is one of those; a menu whose rows are things you can be is this one.{" "}
					<strong>Command</strong> is the palette over the whole application, not a picker on
					one control.
				</Callout>
			</Example>

			<Example id="popover-menu-api" title="API">
				<PropTable owner="PopoverMenu"
					rows={[
						{ name: "items", type: "PopoverMenuItem[]", description: "The choices. Each carries a value, a label, and optional media." },
						{ name: "trigger", type: "ReactElement", description: "The clickable the popover anchors to." },
						{ name: "onSearchChange", type: "(value: string) => void", description: "Supplying this hands filtering to the caller — the local matcher steps aside." },
						{ name: "header / footer", type: "ReactNode", description: "Bands above the search and below the list, running edge to edge." },
						{ name: "open / onOpenChange", type: "boolean / (open) => void", description: "Controlled openness, for a menu opened from somewhere other than its trigger." },
						{ name: "searchValue", type: "string", description: "Controlled search text. Supplying onSearchChange hands filtering to the caller; `strings.searchPlaceholder` is the field's placeholder." },
						{ name: "loading / loadingSlot / strings", type: "boolean / ReactNode / Partial<PopoverMenuStrings>", description: "A strip in place of the list while results are in flight — an async picker with no state reads as an empty one. `strings` carries the loading row, the empty row, and the filter placeholder." },
						{ name: "empty", type: "ReactNode", description: "Shown when nothing matches. Required in spirit: a filter that matches nothing has to say so." },
						{ name: "renderItem", type: "(item) => ReactNode", description: "Replaces a row, for an option carrying an avatar or a colour." },
						{ name: "sideOffset", type: "number", description: "Gap between the trigger and the surface." },
						{ name: "label", type: "string", description: "Names the list, and the search field when there is one. Most needed with search={false}, where the list itself is what focus lands on." },
						{ name: "onSelect", type: "(item: PopoverMenuItem) => void", description: "Receives the chosen item. The menu does not own a persistent selection." },
						{ name: "closeOnSelect", type: "boolean", description: "Closes after a pick and returns focus to the trigger. True unless a footer is present: a footer holds confirm and clear actions, which is the multi-pick shape." },
						{ name: "error", type: "ReactNode", description: "The items could not be loaded. `true` shows `strings.error`; any other node is the message. Replaces the rows and the empty state, and gives way to `loading`." },
						{ name: "onRetry", type: "() => void", description: "Wiring this puts a retry control, labelled by `strings.retry`, under the error." },
						{ name: "minSearchLength", type: "number", default: "0", description: "Characters the search needs before rows are shown. An empty field still shows the items; one character up to the minimum shows `strings.formatTypeToSearch(minimum)`. Measured on the trimmed text, controlled or not." },
						{ name: "strings.error / retry / formatTypeToSearch", api: ["PopoverMenuStrings.error", "PopoverMenuStrings.retry", "PopoverMenuStrings.formatTypeToSearch"], type: "string / string / (minimum) => string", description: "Copy for the error, its retry control, and the too-short hint. Optional in the type so a translation written before them still compiles; the defaults fill them." },
					]}
				/>
				<PropTable owner="PopoverMenuPanel"
					rows={[
						{ name: "items / onSelect", type: "PopoverMenuItem[] / (item) => void", required: true, description: "As on PopoverMenu. The panel owns no selection and closes nothing — the surface hosting it decides both." },
						{ name: "search", type: "boolean", default: "true", description: "Shows the search field. Without it the list is the tab stop — a listbox pointing at the highlighted row — so the arrows and Enter work in a host whose own initial focus lands on the first tabbable element." },
						{ name: "label", api: "PopoverMenuPanel.label", type: "string", description: "As on PopoverMenu. The filter editors pass the filter's name." },
						{ name: "searchValue / onSearchChange / minSearchLength", type: "string / (value) => void / number", description: "As on PopoverMenu: supplying onSearchChange hands filtering to the caller." },
						{ name: "loading / error / onRetry", type: "boolean / ReactNode / () => void", description: "As on PopoverMenu, in the same order of precedence: a short query, then loading, then the error, then the rows." },
						{ name: "header / footer / empty / loadingSlot / strings / renderItem", type: "ReactNode / … / Partial<PopoverMenuStrings> / (item) => ReactNode", description: "As on PopoverMenu. Enter, the arrows, Home and End pressed in a band or on the retry control stay there instead of reaching the list." },
						{ name: "ref", type: "Ref<HTMLDivElement>", description: "The list — what a host's initialFocus should name when there is no search field." },
						{ name: "className", type: "string", description: "On the command root, beside `popover-menu-panel--component`." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
