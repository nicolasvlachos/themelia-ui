/**
 * An internal review surface: every component densely on one page, each block labelled
 * with its family, so cross-family inconsistencies show in a few screenshots.
 */
import {
	ArchiveIcon, BellIcon, CreditCardIcon, MailIcon, PencilIcon, SearchIcon, ShieldIcon,
	StarIcon, TrashIcon, UserIcon,
} from "lucide-react"
import { useState } from "react"

import { Accordion } from "@/components/base/accordion"
import { ActionButtons, ActionMenu } from "@/components/base/action-menu"
import { Avatar, AvatarFallback, StackedAvatars } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import {
	Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText, LoaderButton, TextButton,
	TooltipButton,
} from "@/components/base/buttons"
import { Card, CardActionStrip, CardSkeleton } from "@/components/base/cards"
import {
	CardRadioGroup, Checkbox, ListRadioGroup, PillRadioGroup, Radio, RadioGroup, Select,
	Switch, SwitchCard, ToggleField,
} from "@/components/base/choice-inputs"
import { ContentBlock, DateBlock, IconBadge, PlaceholderPattern, Separator } from "@/components/base/display"
import { Alert, AlertDescription, AlertMetadata, AlertTitle, Empty, ErrorState, LoadingState, Progress } from "@/components/base/feedback"
import { FieldGroup, FormActionsBar, FormField, FormSection, ErrorSummary, DirtyStateBanner, SubmitStateButton } from "@/components/base/forms"
import { DecimalInput, MoneyInput, PercentageInput, RoundingModeSelect, WeightInput } from "@/components/base/forms-numeric"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/base/item"
import { LanguageSwitcher, NavigationTabs, OverflowTabBar, PageHeading, Pagination } from "@/components/base/navigation"
import { KeyValueEditor, LocalizedStringField, StringRepeater } from "@/components/base/repeaters"
import { ContentSkeleton, Skeleton, TableSkeleton } from "@/components/base/skeleton"
import { Spinner } from "@/components/base/spinner"
import { AdaptiveGrid, Stack } from "@/components/base/structure"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/base/table"
import { FieldShell, Input, NativeSelect, PasswordInput, SearchInput, SlugField, Textarea } from "@/components/base/text-inputs"
import { Heading, Text } from "@/components/base/typography"
import { FilePickerInput, UploadProgressList } from "@/components/base/upload"
import { ColorInput, PhoneInput, SliderField, TagsInput } from "@/components/base/value-inputs"
import { Money } from "@/components/primitives"

import styles from "../preview.module.css"

function Block({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className={styles.reviewBlock}>
			<Text size="xs" type="secondary" className={styles.reviewLabel}>
				{title}
			</Text>
			<div className={styles.reviewBody}>{children}</div>
		</section>
	)
}

const PLANS = [
	{ value: "free", label: "Free", description: "One project.", icon: StarIcon },
	{ value: "pro", label: "Pro", description: "Ten projects.", icon: ShieldIcon },
]

const ACTIONS = [
	{ label: "Edit", icon: PencilIcon, onClick: () => {} },
	{ label: "Archive", icon: ArchiveIcon, onClick: () => {} },
	{ label: "Delete", icon: TrashIcon, onClick: () => {}, tone: "destructive" as const },
]

export function ReviewPage() {
	const [tags, setTags] = useState(["alpha", "beta"])
	const [tab, setTab] = useState("overview")

	return (
		<div className={styles.review}>
			<Heading level={1}>Review</Heading>
			<Text type="secondary">
				Every component, densely, so inconsistencies between families are visible.
			</Text>

			<Block title="typography">
				<Stack gap="sm">
					<Heading level={2}>Heading level 2</Heading>
					<Heading level={3}>Heading level 3</Heading>
					<Text>Body copy at the default size.</Text>
					<Text type="secondary" size="sm">Secondary, small.</Text>
					<Text type="secondary" size="xs">Discrete, extra small.</Text>
				</Stack>
			</Block>

			<Block title="buttons">
				<Stack gap="md">
					<Stack direction="horizontal" gap="sm" wrap align="center">
						<Button>Solid</Button>
						<Button buttonStyle="outline" tone="neutral">Outline</Button>
						<Button buttonStyle="ghost" tone="neutral">Ghost</Button>
						<Button tone="destructive">Destructive</Button>
						<Button loading>Loading</Button>
						<Button disabled>Disabled</Button>
						<Button iconOnly aria-label="Edit"><PencilIcon /></Button>
						<TooltipButton tooltip="Archive" iconOnly buttonStyle="outline" tone="neutral"><ArchiveIcon /></TooltipButton>
						<LoaderButton onClick={() => new Promise((r) => setTimeout(r, 900))}>Async</LoaderButton>
						<TextButton>Text button</TextButton>
					</Stack>
					<Stack direction="horizontal" gap="lg" wrap align="center">
						<ButtonGroup>
							<Button buttonStyle="outline" tone="neutral">One</Button>
							<Button buttonStyle="outline" tone="neutral">Two</Button>
						</ButtonGroup>
						<ButtonGroup>
							<ButtonGroupText>https://</ButtonGroupText>
							<Button buttonStyle="outline" tone="neutral">Copy</Button>
							<ButtonGroupSeparator />
							<Button buttonStyle="outline" tone="neutral">Open</Button>
						</ButtonGroup>
						<ActionButtons actions={[{ label: "Save", onClick: () => {} }, { label: "Cancel", buttonStyle: "outline", tone: "neutral", onClick: () => {} }]} />
						<ActionMenu actions={ACTIONS} />
					</Stack>
				</Stack>
			</Block>

			<Block title="text-inputs">
				<AdaptiveGrid minColumnWidth="sm" gap="lg">
					<FormField label="Plain"><Input placeholder="Placeholder" /></FormField>
					<FormField label="Leading icon"><Input startIcon={SearchIcon} placeholder="Search" /></FormField>
					<FormField label="Addons"><Input startAddon="$" endAddon="USD" defaultValue="1200" /></FormField>
					<FormField label="Clearable"><Input clearable defaultValue="Clear me" /></FormField>
					<FormField label="Loading"><Input loading defaultValue="Checking…" /></FormField>
					<FormField label="Count"><Input maxLength={40} showCharacterCount defaultValue="Counted" /></FormField>
					<FormField label="Invalid" error="Required."><Input invalid /></FormField>
					<FormField label="Disabled"><Input disabled defaultValue="Disabled" /></FormField>
					<FormField label="Password"><PasswordInput defaultValue="secret" /></FormField>
					<FormField label="Search"><SearchInput placeholder="Search" /></FormField>
					<FormField label="Native select"><NativeSelect defaultValue="a"><option value="a">Option A</option></NativeSelect></FormField>
					<FormField label="Slug"><SlugField value="Hello World & Co" prefix="acme.com/" /></FormField>
					<FormField label="Shell"><FieldShell start={<MailIcon />} end="@acme.com"><Input placeholder="name" /></FieldShell></FormField>
					<FormField label="Textarea"><Textarea placeholder="Longer copy…" /></FormField>
				</AdaptiveGrid>
			</Block>

			<Block title="choice-inputs">
				<Stack gap="lg">
					<Stack direction="horizontal" gap="xl" wrap align="start">
						<Stack gap="sm">
							<Checkbox label="Unchecked" />
							<Checkbox label="Checked" defaultChecked />
							<Checkbox label="Indeterminate" indeterminate />
							<Checkbox label="Disabled" disabled />
						</Stack>
						<RadioGroup name="review-radio">
							<Radio label="One" value="1" defaultChecked />
							<Radio label="Two" value="2" />
						</RadioGroup>
						<Stack gap="sm">
							<Switch label="On" defaultChecked />
							<Switch label="Off" />
							<Switch label="Disabled" disabled />
						</Stack>
					</Stack>
					<AdaptiveGrid minColumnWidth="sm" gap="lg">
						<FormField label="Select"><Select options={[{ value: "a", label: "Option A", description: "With a description." }, { value: "b", label: "Option B" }]} defaultValue="a" /></FormField>
						<FormField label="Pills"><PillRadioGroup name="review-pills" value="a" onValueChange={() => {}} options={[{ value: "a", label: "Grid" }, { value: "b", label: "List" }]} /></FormField>
					</AdaptiveGrid>
					<CardRadioGroup options={PLANS} defaultValue="pro" columns={2} />
					<ListRadioGroup options={[{ value: "a", label: "Owner", description: "Full access." }, { value: "b", label: "Member", description: "Read and write." }]} defaultValue="a" />
					<SwitchCard label="Two-factor authentication" icon={ShieldIcon} description="Require a second factor." defaultValue />
					<ToggleField label="Email notifications" description="A daily digest." defaultValue />
				</Stack>
			</Block>

			<Block title="value-inputs · forms-numeric">
				<AdaptiveGrid minColumnWidth="sm" gap="lg">
					<FormField label="Slider"><SliderField defaultValue={40} showValue unit="%" /></FormField>
					<FormField label="Tags"><TagsInput value={tags} onValueChange={setTags} /></FormField>
					<FormField label="Colour"><ColorInput defaultValue="oklch(0.45 0.12 155)" /></FormField>
					<FormField label="Phone"><PhoneInput defaultPrefix="NL" defaultValue="6 1234 5678" /></FormField>
					<FormField label="Decimal"><DecimalInput defaultValue="12.50" /></FormField>
					<FormField label="Stepper"><DecimalInput defaultValue="10" step={5} decimalPlaces={0} /></FormField>
					<FormField label="Percentage"><PercentageInput defaultValue="21" /></FormField>
					<FormField label="Money"><MoneyInput value={{ amount: "1299.50", currency: "EUR" }} onValueChange={() => {}} /></FormField>
					<FormField label="Weight"><WeightInput defaultValue="2.4" defaultUnit="kg" /></FormField>
					<FormField label="Rounding"><RoundingModeSelect value="round" onValueChange={() => {}} /></FormField>
				</AdaptiveGrid>
			</Block>

			<Block title="repeaters · upload">
				<AdaptiveGrid minColumnWidth="sm" gap="lg">
					<FormField label="Strings"><StringRepeater value={["acme.com"]} onValueChange={() => {}} sortable /></FormField>
					<FormField label="Key / value"><KeyValueEditor value={[{ key: "X-Trace", value: "on" }]} onValueChange={() => {}} /></FormField>
					<FormField label="Localized"><LocalizedStringField locales={["en", "nl"]} value={{ en: "Name" }} onValueChange={() => {}} /></FormField>
					<FormField label="File picker"><FilePickerInput /></FormField>
				</AdaptiveGrid>
				<UploadProgressList
					items={[
						{ id: "1", name: "report.pdf", size: 240_000, status: "uploading", progress: 62 },
						{ id: "2", name: "photo.jpg", size: 1_200_000, status: "done" },
						{ id: "3", name: "big.zip", size: 90_000_000, status: "error", error: "Larger than 5 MB." },
					]}
					onCancel={() => {}}
					onRetry={() => {}}
					onRemove={() => {}}
				/>
			</Block>

			<Block title="feedback">
				<Stack gap="lg">
					{(["neutral", "primary", "secondary", "info", "success", "warning", "destructive"] as const).map((tone) => (
						<Alert key={tone} tone={tone}>
							<AlertTitle>{tone}</AlertTitle>
							<AlertDescription>A supporting sentence for the {tone} tone.</AlertDescription>
						</Alert>
					))}
					<Alert tone="destructive">
						<AlertTitle>With metadata</AlertTitle>
						<AlertDescription>The request could not be completed.</AlertDescription>
						<AlertMetadata items={[{ label: "Request", value: "req_8f21" }, { label: "Time", value: "12:04:11" }]} />
					</Alert>
					<Alert tone="warning" variant="inverse">
						<AlertTitle>Inverse</AlertTitle>
						<AlertDescription>A solid slab for a single emphatic notice.</AlertDescription>
						<AlertMetadata items={[{ label: "Window", value: "02:00 UTC" }]} />
					</Alert>
					<ErrorSummary errors={["Name is required.", "Email is not valid."]} />
					<DirtyStateBanner actions={<Button>Save</Button>} />
					<Stack direction="horizontal" gap="xl" wrap align="center">
						<Progress value={62} />
						<Progress />
						<Spinner />
					</Stack>
					<AdaptiveGrid minColumnWidth="sm" gap="lg">
						<Empty title="No invoices" description="Nothing has been billed yet." />
						<LoadingState />
						<ErrorState onRetry={() => {}} />
					</AdaptiveGrid>
				</Stack>
			</Block>

			<Block title="display">
				<Stack gap="lg">
					<Stack direction="horizontal" gap="md" wrap align="center">
						{(["neutral", "primary", "success", "warning", "destructive", "info"] as const).map((tone) => (
							<IconBadge key={tone} tone={tone} icon={BellIcon} />
						))}
						{(["neutral", "primary", "success"] as const).map((tone) => (
							<IconBadge key={`${tone}-solid`} tone={tone} solid shape="circle" icon={BellIcon} />
						))}
					</Stack>
					<Stack direction="horizontal" gap="md" wrap align="center">
						<DateBlock date="2026-08-27" />
						<DateBlock date="2026-08-27" time="09:00 – 10:30" />
						<DateBlock date="2026-08-27" layout="inline" />
						<div style={{ width: "8rem", height: "4rem" }}><PlaceholderPattern /></div>
					</Stack>
					<ContentBlock title="A content block" description="Not a card — a labelled group inside one." surface="bordered">
						<Text size="sm" type="secondary">Body.</Text>
					</ContentBlock>
					<Separator />
					<Stack direction="horizontal" gap="md" wrap align="center">
						<Avatar><AvatarFallback>JM</AvatarFallback></Avatar>
						<StackedAvatars users={[{ name: "Jane McDonald" }, { name: "Raj Patel" }, { name: "Mei Chen" }, { name: "Sam Okafor" }, { name: "Ada Byron" }]} max={3} />
						<Badge>Badge</Badge>
						<Badge tone="neutral">Secondary</Badge>
						<Badge tone="destructive">Destructive</Badge>
						<Badge tone="neutral">Outline</Badge>
					</Stack>
				</Stack>
			</Block>

			<Block title="cards · item">
				<Stack gap="lg">
					<AdaptiveGrid minColumnWidth="sm" gap="lg">
						{(["card", "framed", "flat", "bordered"] as const).map((surface) => (
							<Card key={surface} surface={surface} title={surface} description="Supporting sentence.">
								<Text size="sm" type="secondary">Content.</Text>
							</Card>
						))}
					</AdaptiveGrid>
					<AdaptiveGrid minColumnWidth="sm" gap="lg">
						<Card surface="bordered" title="With actions" description="An action strip at the foot." actions={ACTIONS}>
							<CardActionStrip actions={[{ label: "Approve", onClick: () => {} }, { label: "Reject", buttonStyle: "outline", tone: "neutral", onClick: () => {} }]} separator />
						</Card>
						<CardSkeleton surface="bordered" />
					</AdaptiveGrid>
					<ItemGroup>
						<Item surface="bordered">
							<ItemMedia variant="icon"><CreditCardIcon /></ItemMedia>
							<ItemContent>
								<ItemTitle>Northwind Traders</ItemTitle>
								<ItemDescription>Invoice #4417</ItemDescription>
							</ItemContent>
							<ItemActions><Money amount={1299.5} /><Badge tone="neutral">Paid</Badge></ItemActions>
						</Item>
					</ItemGroup>
				</Stack>
			</Block>

			<Block title="navigation">
				<Stack gap="lg">
					<PageHeading
						eyebrow="Billing"
						title="Invoices"
						description="Everything issued in the current period."
						badges={[{ label: "12 open" }]}
						actions={<Button>New invoice</Button>}
						level={2}
					/>
					<OverflowTabBar
						items={[
							{ id: "overview", label: "Overview" },
							{ id: "activity", label: "Activity", badge: <Badge tone="neutral">3</Badge> },
							{ id: "settings", label: "Settings", icon: <UserIcon /> },
						]}
						value={tab}
						onValueChange={setTab}
					/>
					<NavigationTabs
						currentPath="/app/invoices"
						items={[
							{ label: "Overview", href: "/app" },
							{ label: "Invoices", href: "/app/invoices" },
							{ label: "Customers", href: "/app/customers" },
						]}
					/>
					<Stack direction="horizontal" gap="xl" wrap align="center">
						<Pagination page={3} total={10} onPageChange={() => {}} />
						<LanguageSwitcher locales={[{ value: "en", label: "English" }, { value: "nl", label: "Nederlands" }]} value="en" onSelect={() => {}} />
					</Stack>
				</Stack>
			</Block>

			<Block title="table · accordion · skeleton">
				<Stack gap="lg">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Invoice</TableHead>
								<TableHead>Client</TableHead>
								<TableHead align="end">Amount</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow>
								<TableCell>INV-4417</TableCell>
								<TableCell>Northwind</TableCell>
								<TableCell align="end"><Money amount={1299.5} /></TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<Accordion
						defaultValue={["a"]}
						items={[
							{ value: "a", title: "First section", description: "Supporting line.", content: "Body copy." },
							{ value: "b", title: "Second section", content: "Body copy." },
						]}
					/>
					<AdaptiveGrid minColumnWidth="sm" gap="lg">
						<ContentSkeleton lines={3} showTitle />
						<TableSkeleton rows={3} columns={3} />
					</AdaptiveGrid>
					<Skeleton style={{ height: "2rem" }} />
				</Stack>
			</Block>

			<Block title="forms workflow">
				<FormSection title="Section" description="A group of fields under a heading.">
					<FieldGroup legend="Name">
						<AdaptiveGrid minColumnWidth="sm" gap="lg">
							<FormField label="First name"><Input /></FormField>
							<FormField label="Last name"><Input /></FormField>
						</AdaptiveGrid>
					</FieldGroup>
					<FormActionsBar leading="Last saved 2 minutes ago">
						<Button buttonStyle="ghost" tone="neutral">Cancel</Button>
						<SubmitStateButton state="idle" />
					</FormActionsBar>
				</FormSection>
			</Block>
		</div>
	)
}
