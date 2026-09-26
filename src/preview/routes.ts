import type { ComponentType } from "react"

import { ActionsPage } from "./pages/actions"
import { AiChatPage } from "./pages/ai-chat"
import { AsyncPreviewPage } from "./pages/async-preview"
import { ActivitiesPage } from "./pages/activities"
import { CommentsPage } from "./pages/comments"
import { DataViewPage } from "./pages/data-view"
import { EventCalendarPage } from "./pages/event-calendar"
import { FiltersPage } from "./pages/filters"
import { GlobalSearchPage } from "./pages/global-search"
import { KanbanPage } from "./pages/kanban"
import { MapPage } from "./pages/map"
import { MediaLibraryPage } from "./pages/media-library"
import { MentionsPage } from "./pages/mentions"
import { ProductVariantsPage } from "./pages/product-variants"
import { ProductsPage } from "./pages/products"
import { ResourceAssignmentPage } from "./pages/resource-assignment"
import { SchemaFormPage } from "./pages/schema-form"
import { ThemeTweakerPage } from "./pages/theme-tweaker"
import { ResourcePage } from "./pages/resource"
import { RichTextEditorPage } from "./pages/rich-text-editor"
import { ActionOverlaysPage } from "./pages/action-overlays"
import { AppShellPage } from "./pages/app-shell"
import { MenubarPage } from "./pages/menubar"
import { NavigationMenuPage } from "./pages/navigation-menu"
import { HoverCardPage } from "./pages/hover-card"
import { ResizablePage } from "./pages/resizable"
import { OtpInputPage } from "./pages/otp-input"
import { AspectRatioPage } from "./pages/aspect-ratio"
import { KbdPage } from "./pages/kbd"
import { TogglePage } from "./pages/toggle"
import { ToolbarPage } from "./pages/toolbar"
import { LayoutHeaderPage } from "./pages/layout-header"
import { PageLayoutPage } from "./pages/page-layout"
import { ContainersPage } from "./pages/containers"
import { SideNavPage } from "./pages/side-nav"
import { WorkspaceHeaderPage } from "./pages/workspace-header"
import { AuthShellPage } from "./pages/auth-shell"
import { BadgePage } from "./pages/badge"
import { AvatarPage } from "./pages/avatar"
import { BatchActionBarPage } from "./pages/batch-action-bar"
import { SkeletonPage } from "./pages/skeleton"
import { LabelPage } from "./pages/label"
import { TooltipPage } from "./pages/tooltip"
import { DropdownMenuPage } from "./pages/dropdown-menu"
import { CommandPage } from "./pages/command"
import { PrimitiveValuePage } from "./pages/primitive-value"
import { PrimitiveMoneyPage } from "./pages/primitive-money"
import { PrimitiveNumberPage } from "./pages/primitive-number"
import { PrimitiveDatePage } from "./pages/primitive-date"
import { PrimitiveNamePage } from "./pages/primitive-name"
import { PrimitiveContactPage } from "./pages/primitive-contact"
import { GalleryPage } from "./pages/gallery"
import { PrimitiveAddressPage } from "./pages/primitive-address"
import { PrimitiveQuantityPage } from "./pages/primitive-quantity"
import { OverviewPage } from "./pages/overview"
import { ReviewPage } from "./pages/review"
import { TokensPage } from "./pages/tokens"
import { ScalePage } from "./pages/scale"
import { TypographyPage } from "./pages/typography"
import { StructurePage } from "./pages/structure"
import { CardPage } from "./pages/card"
import { ItemPage } from "./pages/item"
import { TablePage } from "./pages/table"
import { AccordionPage } from "./pages/accordion"
import { ChartPage } from "./pages/chart"
import { QRCodePage } from "./pages/qr-code"
import { CarouselPage } from "./pages/carousel"
import { SeparatorPage } from "./pages/separator"
import { CollapsiblePage } from "./pages/collapsible"
import { ScrollAreaPage } from "./pages/scroll-area"
import { ButtonPage } from "./pages/button"
import { ActionMenuPage } from "./pages/action-menu"
import { PopoverMenuPage } from "./pages/popover-menu"
import { InputPage } from "./pages/input"
import { TextareaPage } from "./pages/textarea"
import { SlugFieldPage } from "./pages/slug-field"
import { SelectPage } from "./pages/select"
import { ComboboxPage } from "./pages/combobox"
import { CheckboxPage } from "./pages/checkbox"
import { RadioGroupPage } from "./pages/radio-group"
import { SwitchPage } from "./pages/switch"
import { DecimalInputPage } from "./pages/decimal-input"
import { PercentageInputPage } from "./pages/percentage-input"
import { CurrencyInputPage } from "./pages/currency-input"
import { UnitInputsPage } from "./pages/unit-inputs"
import { SliderPage } from "./pages/slider"
import { TagsInputPage } from "./pages/tags-input"
import { ColorInputPage } from "./pages/color-input"
import { PhoneInputPage } from "./pages/phone-input"
import { DatePickerPage } from "./pages/date-picker"
import { CalendarPage } from "./pages/calendar"
import { TimePickerPage } from "./pages/time-picker"
import { FileUploadPage } from "./pages/file-upload"
import { RepeaterPage } from "./pages/repeater"
import { FormBindingPage } from "./pages/form-binding"
import { FormFieldPage } from "./pages/form-field"
import { TabsPage } from "./pages/tabs"
import { BreadcrumbsPage } from "./pages/breadcrumbs"
import { PaginationPage } from "./pages/pagination"
import { AlertPage } from "./pages/alert"
import { EmptyPage } from "./pages/empty"
import { MetadataPage } from "./pages/metadata"
import { InlineStatPage } from "./pages/inline-stat"
import { AnalyticsPage } from "./pages/analytics"
import { BlocksAdminPage } from "./pages/blocks-admin"
import { BlocksCommercePage } from "./pages/blocks-commerce"
import { BlocksCataloguePage } from "./pages/blocks-catalogue"
import { BlocksOrderPage } from "./pages/blocks-order"
import { ContentBlockPage } from "./pages/content-block"
import { DateBlockPage } from "./pages/date-block"
import { UIRootScopePage } from "./pages/ui-root-scope"
import { InputGroupPage } from "./pages/input-group"
import { FormWorkflowPage } from "./pages/form-workflow"
import { SidebarPage } from "./pages/sidebar"
import { OverlayPage } from "./pages/overlay"
import { PopoverPage } from "./pages/popover"
import { TimelinePage } from "./pages/timeline"
import { ProgressPage } from "./pages/progress"
import { SpinnerPage } from "./pages/spinner"
import { ToastPage } from "./pages/toast"
import { CopyablePage } from "./pages/copyable"

export type Route = {
	path: string
	label: string
	component: ComponentType
	/** Group label, carried on the route so search can show where a result lives. */
	group: string
	/** The labelled run inside the group, where the group has them. */
	section?: string
	/** Extra search terms — a reader looking for "modal" should find Dialog. */
	keywords?: string[]
	badge?: string
}

/** A labelled run of pages inside a group — "Text" inside Forms. */
export type RouteSection = { label: string | null; routes: Route[] }
/** What the rail collapses. `routes` is every page in it, in order, for search and paging. */
export type RouteGroup = { label: string; sections: RouteSection[]; routes: Route[] }

type RouteInput = Omit<Route, "group" | "section">
type SectionInput = { label: string; routes: RouteInput[] }

const section = (label: string, routes: RouteInput[]): SectionInput => ({ label, routes })

/*
 * Two levels: a group is what the rail collapses; a section is a labelled run inside a long
 * group. A page sits in the group of the reader's task, not the folder it ships from.
 */
const group = (label: string, content: (RouteInput | SectionInput)[]): RouteGroup => {
	const sections: RouteSection[] = []
	for (const entry of content) {
		if ("routes" in entry) {
			sections.push({ label: entry.label, routes: entry.routes.map((route) => ({ ...route, group: label, section: entry.label })) })
			continue
		}
		const last = sections.at(-1)
		const route: Route = { ...entry, group: label }
		if (last && last.label === null) last.routes.push(route)
		else sections.push({ label: null, routes: [route] })
	}
	return { label, sections, routes: sections.flatMap((entry) => entry.routes) }
}

export const ROUTE_GROUPS: RouteGroup[] = [
	group("Get started", [
		{ path: "/", label: "Introduction", component: OverviewPage, keywords: ["overview", "install", "start", "getting started"] },
		{ path: "/components", label: "All components", component: GalleryPage, keywords: ["gallery", "browse", "index", "catalogue", "all"] },
		{ path: "/theme-tweaker", label: "Theme tweaker", component: ThemeTweakerPage, keywords: ["theme", "tweaker", "tokens", "variables", "customise", "editor", "palette", "export", "css"] },
	]),
	group("Foundations", [
		{ path: "/tokens", label: "Tokens & theming", component: TokensPage, keywords: ["theme", "colour", "color", "palette", "dark mode", "semantic"] },
		{ path: "/scale", label: "Scale & density", component: ScalePage, keywords: ["size", "density", "compact", "spacing", "factor"] },
		{ path: "/typography", label: "Typography", component: TypographyPage, keywords: ["text", "heading", "label", "link", "prose", "font"] },
		{ path: "/ui-root-scope", label: "UIRoot & UIScope", component: UIRootScopePage, keywords: ["provider", "uiroot", "uiscope", "scope", "density", "theme", "nesting", "document", "config"] },
		section("Layout primitives", [
			{ path: "/structure", label: "Stack & grid", component: StructurePage, keywords: ["stack", "grid", "layout", "flex", "responsive", "gap"] },
			{ path: "/scroll-area", label: "Scroll area", component: ScrollAreaPage, keywords: ["scroll", "overflow", "visually hidden"] },
			{ path: "/resizable", label: "Resizable panels", component: ResizablePage, keywords: ["resizable", "split", "panes", "panels", "splitter", "inspector"] },
			{ path: "/aspect-ratio", label: "Aspect ratio", component: AspectRatioPage, keywords: ["aspect ratio", "ratio", "16:9", "frame", "media", "embed"] },
		]),
	]),
	group("App layout", [
		section("Shell", [
			{ path: "/app-shell", label: "App shell", component: AppShellPage, keywords: ["sidebar", "admin layout", "shell", "rail", "collapse", "stacked", "inset", "navigation"] },
			{ path: "/header", label: "Header", component: LayoutHeaderPage, keywords: ["header", "top bar", "topbar", "breadcrumbs", "toolbar"] },
			{ path: "/sidebar", label: "Sidebar", component: SidebarPage, keywords: ["sidebar", "navigation panel", "rail", "collapsible", "offcanvas", "inset", "menu", "shell"] },
		]),
		section("Pages", [
			{ path: "/page", label: "Page & page header", component: PageLayoutPage, keywords: ["page", "page header", "page heading", "page actions", "title", "eyebrow", "back", "actions"] },
			{ path: "/containers", label: "Containers", component: ContainersPage, keywords: ["container", "viewport", "section", "two column", "measure", "gutter", "aside"] },
			{ path: "/side-nav", label: "Side nav & section nav", component: SideNavPage, keywords: ["side nav", "section nav", "rail", "toc", "table of contents", "settings shell", "settings", "aside nav", "account", "section"] },
			{ path: "/workspace-header", label: "Workspace record header", component: WorkspaceHeaderPage, keywords: ["record", "workspace", "detail header", "metadata"] },
			{ path: "/auth-shell", label: "Auth shells", component: AuthShellPage, keywords: ["auth", "sign in", "login", "split panel", "register"] },
		]),
	]),
	group("Navigation", [
		{ path: "/tabs", label: "Tabs", component: TabsPage, keywords: ["tabs", "tablist", "panel"] },
		{ path: "/breadcrumbs", label: "Breadcrumbs", component: BreadcrumbsPage, keywords: ["breadcrumb", "trail", "path"] },
		{ path: "/pagination", label: "Pagination", component: PaginationPage, keywords: ["pagination", "pages", "pager"] },
		{ path: "/navigation-menu", label: "Navigation menu", component: NavigationMenuPage, keywords: ["navigation menu", "mega menu", "header nav", "site navigation", "dropdown nav"] },
	]),
	group("Actions", [
		{ path: "/button", label: "Button", component: ButtonPage, keywords: ["action", "tone", "cta", "group", "submit"] },
		{ path: "/toolbar", label: "Toolbar", component: ToolbarPage, keywords: ["toolbar", "roving focus", "formatting", "controls", "arrow keys"] },
		{ path: "/action-menu", label: "Action menu & buttons", component: ActionMenuPage, keywords: ["menu", "dropdown", "overflow", "kebab", "commands", "action buttons", "actions", "toolbar", "buttons"] },
		{ path: "/batch-action-bar", label: "Batch action bar", component: BatchActionBarPage, keywords: ["batch", "bulk", "selection", "actions", "dock"] },
		{ path: "/copyable", label: "Copyable", component: CopyablePage, keywords: ["copy", "clipboard"] },
		{ path: "/actions", label: "Action definitions", component: ActionsPage, keywords: ["action", "command", "runtime", "registry", "confirm", "modality"] },
	]),
	group("Forms", [
		section("Fields & structure", [
			{ path: "/form-field", label: "Form field", component: FormFieldPage, keywords: ["form", "field", "label", "helper", "error", "validation"] },
			{ path: "/label", label: "Label", component: LabelPage, keywords: ["label", "caption", "htmlfor"] },
			{ path: "/form-workflow", label: "Form workflow", component: FormWorkflowPage, keywords: ["form section", "actions bar", "error summary", "dirty state", "unsaved", "submit", "loading state", "error state", "workflow"] },
			{ path: "/form-binding", label: "Form binding", component: FormBindingPage, keywords: ["binding", "headless", "form control", "react-hook-form", "rhf", "useField", "state"] },
			{ path: "/repeater", label: "Repeater", component: RepeaterPage, keywords: ["repeater", "rows", "reorder", "key value", "localized"] },
		]),
		section("Text", [
			{ path: "/input", label: "Input", component: InputPage, keywords: ["input", "text", "field", "addon", "icon", "clearable", "search", "password", "reveal", "secret"] },
			{ path: "/textarea", label: "Textarea", component: TextareaPage, keywords: ["textarea", "multiline", "notes"] },
			{ path: "/input-group", label: "Input group", component: InputGroupPage, keywords: ["input group", "addon", "prefix", "suffix", "unit", "attached", "affix", "field shell"] },
			{ path: "/slug-field", label: "Slug field", component: SlugFieldPage, keywords: ["slug", "url", "permalink"] },
			{ path: "/phone-input", label: "Phone input", component: PhoneInputPage, keywords: ["phone", "tel", "dial code"] },
			{ path: "/tags-input", label: "Tags input", component: TagsInputPage, keywords: ["tags", "chips", "keywords"] },
			{ path: "/otp-input", label: "One-time code input", component: OtpInputPage, keywords: ["otp", "one time code", "verification code", "2fa", "sms code", "pin"] },
		]),
		section("Choice", [
			{ path: "/select", label: "Select", component: SelectPage, keywords: ["select", "dropdown", "options", "native select"] },
			{ path: "/combobox", label: "Combobox", component: ComboboxPage, keywords: ["combobox", "autocomplete", "typeahead", "multi select", "search", "suggestions", "async", "creatable", "multi", "resource"] },
			{ path: "/checkbox", label: "Checkbox", component: CheckboxPage, keywords: ["checkbox", "check", "indeterminate"] },
			{ path: "/radio-group", label: "Radio groups", component: RadioGroupPage, keywords: ["radio", "options", "one of", "card radio", "plan picker", "tiles", "list radio", "rows", "pill", "segmented", "view switch", "checkbox cards"] },
			{ path: "/switch", label: "Switch & toggle field", component: SwitchPage, keywords: ["switch", "toggle", "on off", "toggle field", "settings row", "switch card"] },
			{ path: "/toggle", label: "Toggle", component: TogglePage, keywords: ["toggle", "toggle group", "pressed", "segmented", "editor", "bold"] },
		]),
		section("Numbers", [
			{ path: "/decimal-input", label: "Decimal input", component: DecimalInputPage, keywords: ["decimal", "number", "rounding"] },
			{ path: "/currency-input", label: "Currency input", component: CurrencyInputPage, keywords: ["currency", "money", "amount"] },
			{ path: "/percentage-input", label: "Percentage input", component: PercentageInputPage, keywords: ["percentage", "percent", "rate"] },
			{ path: "/unit-inputs", label: "Unit inputs", component: UnitInputsPage, keywords: ["weight", "dimensions", "coordinates", "unit"] },
			{ path: "/slider", label: "Slider", component: SliderPage, keywords: ["slider", "range", "track"] },
		]),
		section("Dates, colour & files", [
			{ path: "/date-picker", label: "Date picker", component: DatePickerPage, keywords: ["date", "picker", "range", "presets"] },
			{ path: "/calendar", label: "Calendar", component: CalendarPage, keywords: ["calendar", "month", "grid", "days"] },
			{ path: "/time-picker", label: "Time picker", component: TimePickerPage, keywords: ["time", "clock", "datetime"] },
			{ path: "/color-input", label: "Color input", component: ColorInputPage, keywords: ["color", "colour", "swatch", "picker"] },
			{ path: "/file-upload", label: "File upload", component: FileUploadPage, keywords: ["upload", "file", "dropzone", "drag drop", "image", "avatar", "cover", "picture", "upload progress", "queue", "tray", "gallery"] },
		]),
	]),
	group("Data display", [
		section("Collections", [
			{ path: "/table", label: "Table", component: TablePage, keywords: ["table", "grid", "rows", "columns", "data"] },
			{ path: "/item", label: "Item", component: ItemPage, keywords: ["item", "row", "list", "media"] },
			{ path: "/card", label: "Card", component: CardPage, keywords: ["card", "panel", "surface", "tile"] },
		]),
		section("Facts & figures", [
			{ path: "/metadata", label: "Metadata list", component: MetadataPage, keywords: ["metadata", "metadata list", "facts", "label value", "definition list", "details", "key value", "fact"] },
			{ path: "/inline-stat", label: "Inline stat", component: InlineStatPage, keywords: ["inline stat", "stat", "label value", "total", "figure", "pair", "summary row"] },
		]),
		section("Charts & sequences", [
			{ path: "/chart", label: "Chart", component: ChartPage, keywords: ["chart", "graph", "bar", "line", "area", "recharts"] },
			{ path: "/timeline", label: "Timeline", component: TimelinePage, keywords: ["timeline", "rail", "events", "history", "steps", "stepper", "changelog", "milestones", "progress"] },
			{ path: "/qr-code", label: "QR code", component: QRCodePage, keywords: ["qr", "qr code", "barcode", "scan"] },
		]),
		section("Content", [
			{ path: "/avatar", label: "Avatar", component: AvatarPage, keywords: ["avatar", "profile", "initials", "photo", "stacked"] },
			{ path: "/badge", label: "Badge", component: BadgePage, keywords: ["badge", "status", "tag", "chip", "pill", "dot"] },
			{ path: "/content-block", label: "Content block", component: ContentBlockPage, keywords: ["content block", "surface", "card", "flush", "region", "icon badge", "medallion", "panel"] },
			{ path: "/date-block", label: "Date block", component: DateBlockPage, keywords: ["date block", "calendar", "leaf", "agenda", "event date", "booking", "day", "month"] },
			{ path: "/separator", label: "Separator", component: SeparatorPage, keywords: ["separator", "divider", "rule", "hr"] },
			{ path: "/kbd", label: "Keyboard key", component: KbdPage, keywords: ["kbd", "keyboard", "shortcut", "key", "hotkey", "chord"] },
		]),
		section("Disclosure", [
			{ path: "/accordion", label: "Accordion", component: AccordionPage, keywords: ["accordion", "collapse", "disclosure", "sections"] },
			{ path: "/collapsible", label: "Collapsible", component: CollapsiblePage, keywords: ["collapsible", "disclosure", "expand"] },
			{ path: "/carousel", label: "Carousel", component: CarouselPage, keywords: ["carousel", "slider", "slides", "scroll snap"] },
		]),
	]),
	group("Overlays & menus", [
		section("Surfaces", [
			{ path: "/overlay", label: "Overlay, dialog & sheet", component: OverlayPage, keywords: ["overlay", "modal", "dialog", "sheet", "drawer", "panel", "placement", "modality", "dismissal", "native dialog", "alert dialog", "confirm", "destructive", "are you sure", "popup", "inspector", "side"] },
			{ path: "/popover", label: "Popover", component: PopoverPage, keywords: ["popover", "panel", "anchored", "filters", "flyout", "side", "align", "anchor"] },
			{ path: "/hover-card", label: "Hover card", component: HoverCardPage, keywords: ["hover card", "preview", "profile preview", "peek", "hover"] },
			{ path: "/tooltip", label: "Tooltip", component: TooltipPage, keywords: ["tooltip", "hint", "popup", "hover"] },
		]),
		section("Menus", [
			{ path: "/dropdown-menu", label: "Dropdown & context menu", component: DropdownMenuPage, keywords: ["dropdown", "menu", "submenu", "checkbox item", "radio item", "right click", "context", "menu", "accelerator"] },
			{ path: "/popover-menu", label: "Popover menu", component: PopoverMenuPage, keywords: ["popover menu", "picker", "searchable"] },
			{ path: "/menubar", label: "Menubar", component: MenubarPage, keywords: ["menubar", "menu bar", "file edit view", "editor", "menu"] },
			{ path: "/command", label: "Command palette", component: CommandPage, keywords: ["command", "palette", "cmdk", "search", "shortcut"] },
		]),
	]),
	group("Feedback & status", [
		{ path: "/alert", label: "Alert", component: AlertPage, keywords: ["alert", "banner", "callout", "tone"] },
		{ path: "/toast", label: "Toast", component: ToastPage, keywords: ["toast", "notification", "snackbar", "undo"] },
		{ path: "/progress", label: "Progress", component: ProgressPage, keywords: ["progress", "bar", "loading"] },
		{ path: "/spinner", label: "Spinner", component: SpinnerPage, keywords: ["spinner", "loader", "busy"] },
		{ path: "/skeleton", label: "Skeleton", component: SkeletonPage, keywords: ["skeleton", "loading", "placeholder", "shimmer"] },
		{ path: "/empty", label: "Empty state", component: EmptyPage, keywords: ["empty", "placeholder", "no results", "illustration", "zero data"] },
	]),
	group("Values & formatting", [
		{ path: "/primitive-value", label: "Values & lists", component: PrimitiveValuePage, keywords: ["value", "empty", "mono", "secondary", "muted", "dash", "list", "join", "conjunction", "and", "or", "comma"] },
		{ path: "/primitive-name", label: "Names & initials", component: PrimitiveNamePage, keywords: ["name", "person", "first", "last", "full name", "initials", "avatar", "monogram"] },
		{ path: "/primitive-contact", label: "Contact details", component: PrimitiveContactPage, keywords: ["email", "mailto", "address", "contact", "phone", "tel", "telephone", "mobile", "url", "link", "href", "external", "website"] },
		{ path: "/primitive-address", label: "Addresses & places", component: PrimitiveAddressPage, keywords: ["address", "postal", "street", "city", "postcode", "zip", "coordinates", "latitude", "longitude", "gps", "dms", "location"] },
		{ path: "/primitive-money", label: "Money", component: PrimitiveMoneyPage, keywords: ["money", "currency", "amount", "price", "total"] },
		{ path: "/primitive-number", label: "Numbers, ranges & ratios", component: PrimitiveNumberPage, keywords: ["number", "percent", "percentage", "rate", "count", "range", "span", "between", "from", "to", "min", "max", "ratio", "rating", "out of", "score", "fraction"] },
		{ path: "/primitive-quantity", label: "Measures & file sizes", component: PrimitiveQuantityPage, keywords: ["quantity", "plural", "count", "unit", "measure", "kg", "dimensions", "width", "height", "depth", "size", "file size", "bytes", "kb", "mb", "gb"] },
		{ path: "/primitive-date", label: "Dates & times", component: PrimitiveDatePage, keywords: ["date", "time", "datetime", "date-fns", "format", "range", "between", "start", "end", "period", "relative", "ago", "timeago", "recent", "updated", "duration", "elapsed", "length", "minutes", "seconds"] },
	]),
	group("Features", [
		section("Data & resources", [
			{ path: "/data-view", label: "Data view & data table", component: DataViewPage, keywords: ["data view", "index", "list", "filters", "table", "toolbar", "saved views", "pagination", "feature", "data table", "tanstack", "sort", "select", "columns", "rows", "cells"] },
			{ path: "/filters", label: "Filters", component: FiltersPage, keywords: ["filter", "filters", "facet", "query", "chips", "pills", "search", "saved views", "url", "feature"] },
			{ path: "/global-search", label: "Global search", component: GlobalSearchPage, keywords: ["search", "command", "palette", "cmdk", "spotlight", "quick", "omnibox", "results", "groups", "feature"] },
			{ path: "/resource", label: "Resource shells", component: ResourcePage, keywords: ["resource", "index", "show", "detail", "shell", "workspace", "tabs", "aside", "loading", "empty", "error", "feature"] },
			{ path: "/resource-assignment", label: "Resource assignment", component: ResourceAssignmentPage, keywords: ["assignment", "assign", "shared resource", "picker", "venue", "selector", "confirm", "dialog", "card", "feature"] },
			{ path: "/async-preview", label: "Async preview", component: AsyncPreviewPage, keywords: ["preview", "hover card", "fetch", "popover", "abort", "cache", "race", "prefetch", "trigger cell", "feature"] },
		]),
		section("Collaboration & content", [
			{ path: "/comments", label: "Comments", component: CommentsPage, keywords: ["comment", "thread", "discussion", "reply", "composer", "timeline", "attachment", "reaction", "feature"] },
			{ path: "/activities", label: "Activities", component: ActivitiesPage, keywords: ["activity", "feed", "timeline", "audit", "log", "event", "history", "changes", "feature"] },
			{ path: "/mentions", label: "Mentions", component: MentionsPage, keywords: ["mention", "reference", "at", "hashtag", "chip", "picker", "trigger", "rich text", "feature"] },
			{ path: "/rich-text-editor", label: "Rich text editor", component: RichTextEditorPage, keywords: ["editor", "rich text", "wysiwyg", "contenteditable", "toolbar", "bold", "italic", "html", "feature"] },
			{ path: "/ai-chat", label: "AI chat", component: AiChatPage, keywords: ["ai", "chat", "assistant", "agent", "llm", "message", "prompt", "tool", "reasoning", "streaming", "transcript", "feature"] },
			{ path: "/media-library", label: "Media library", component: MediaLibraryPage, keywords: ["media", "library", "assets", "images", "gallery", "upload", "picker", "files", "feature"] },
		]),
		section("Planning & places", [
			{ path: "/event-calendar", label: "Event calendar", component: EventCalendarPage, keywords: ["calendar", "event", "month", "week", "agenda", "schedule", "booking", "day", "grid", "feature"] },
			{ path: "/kanban", label: "Kanban & sync", component: KanbanPage, keywords: ["kanban", "board", "drag", "drop", "sortable", "columns", "dnd", "sync", "feature"] },
			{ path: "/map", label: "Map", component: MapPage, keywords: ["map", "leaflet", "geo", "location", "marker", "geocode", "place", "autocomplete", "draw", "tiles", "feature"] },
		]),
		section("Forms & flows", [
			{ path: "/schema-form", label: "Schema form", component: SchemaFormPage, keywords: ["schema", "form", "json", "generated", "fields", "validation", "sections", "dynamic", "feature"] },
			{ path: "/action-overlays", label: "Action overlays", component: ActionOverlaysPage, keywords: ["dialog", "drawer", "sheet", "confirm", "action dialog", "async confirm", "footer", "feature"] },
		]),
	]),
	group("Blocks", [
		section("Commerce", [
			{ path: "/blocks-order", label: "Order", component: BlocksOrderPage, keywords: ["order", "fulfillment", "fulfilment", "line item", "sku", "transaction", "payment", "refund", "capture", "authorization", "customer", "shipping address", "billing", "totals", "balance", "block"] },
			{ path: "/blocks-commerce", label: "Cart, checkout & billing", component: BlocksCommercePage, keywords: ["cart", "checkout", "invoice", "order", "refund", "shipment", "tracking", "tax", "vat", "discount", "coupon", "address", "payment", "card", "subscription", "inventory", "stock", "block"] },
			{ path: "/blocks-catalogue", label: "Catalogue & partners", component: BlocksCataloguePage, keywords: ["seo", "search appearance", "permalink", "slug", "listing", "score", "inventory", "sku", "barcode", "stock", "vendor", "supplier", "booking", "block"] },
			{ path: "/products", label: "Product surfaces", component: ProductsPage, keywords: ["product", "catalogue", "catalog", "overview", "readiness", "contract", "policies", "quote", "pricing", "commerce"] },
			{ path: "/product-variants", label: "Options & variants", component: ProductVariantsPage, keywords: ["variant", "variants", "option", "options", "sku", "inventory", "stock", "matrix", "bulk", "editor", "commerce"] },
		]),
		section("Admin & insight", [
			{ path: "/analytics", label: "Analytics", component: AnalyticsPage, keywords: ["metric", "kpi", "analytics", "dashboard", "stat", "sparkline", "trend", "heatmap", "chart card", "comparison", "block"] },
			{ path: "/blocks-admin", label: "Timelines, onboarding & admin", component: BlocksAdminPage, keywords: ["changelog", "milestones", "steps", "stepper", "checklist", "onboarding", "api key", "credential", "secret", "role", "permission", "danger zone", "block"] },
		]),
	]),
]

/* Reachable by address, never listed: the kitchen sink renders everything at once. */
const INTERNAL_ROUTES: Route[] = [
	{ path: "/review", label: "Review (internal)", component: ReviewPage, keywords: ["review", "kitchen sink", "all"], group: "Get started" },
]
export const ROUTES: Route[] = [...ROUTE_GROUPS.flatMap((entry) => entry.routes), ...INTERNAL_ROUTES]

/** Pages merged into another, so an old address still lands on the merged page. */
export const MOVED_ROUTES: Record<string, string> = {
	"/search-input": "/input",
	"/password-input": "/input",
	"/toggle-field": "/switch",
	"/card-radio-group": "/radio-group",
	"/list-radio-group": "/radio-group",
	"/pill-radio-group": "/radio-group",
	"/context-menu": "/dropdown-menu",
	"/alert-dialog": "/overlay",
	"/dialog": "/overlay",
	"/sheet": "/overlay",
	"/data-table": "/data-view",
	"/async-combobox": "/combobox",
	"/action-buttons": "/action-menu",
	"/settings-shell": "/side-nav",
	"/image-upload": "/file-upload",
	"/upload-queue": "/file-upload",
	"/primitive-inline-list": "/primitive-value",
	"/primitive-initials": "/primitive-name",
	"/primitive-email": "/primitive-contact",
	"/primitive-phone": "/primitive-contact",
	"/primitive-url": "/primitive-contact",
	"/primitive-coordinates": "/primitive-address",
	"/primitive-range": "/primitive-number",
	"/primitive-ratio": "/primitive-number",
	"/primitive-dimensions": "/primitive-quantity",
	"/primitive-file-size": "/primitive-quantity",
	"/primitive-date-range": "/primitive-date",
	"/primitive-relative-time": "/primitive-date",
	"/primitive-duration": "/primitive-date",
}
