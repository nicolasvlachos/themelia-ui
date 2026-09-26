import { BellIcon, PlusIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Button } from "@/components/base/buttons"
import { SearchInput } from "@/components/base/text-inputs"
import { Header } from "@/components/layout"

import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

/*
 * The frame holds a strip of page under the header, so the rounded corners belong to the
 * page body and the header's bottom rule runs unclipped.
 */
const FRAME = {
	width: "100%",
	/* Give the sticky backdrop layer the same clipping curve as the frame. */
	clipPath: "inset(0 round var(--radius))",
	border: "1px solid var(--border)",
	borderRadius: "var(--radius)",
	overflow: "hidden",
} as const

/** The page under the bar. It exists to own the frame's bottom corners. */
const FRAME_BODY = {
	height: "var(--space-2xl)",
	backgroundColor: "var(--muted-20)",
} as const

export function LayoutHeaderPage() {
	return (
		<ComponentPage
			title="Header"
			summary="The shell's top bar. Slot-driven for its contents and fixed in its arrangement — which is the half every hand-built header gets wrong the first time a search field and an account menu share a row."
			importPath="@/components/layout/header"
			exports={["Header",
				"HeaderBreadcrumbs", "HeaderSearch", "HeaderGlobalSearchTrigger", "HeaderToolButton", "HeaderToolPopover", "HeaderNotifications", "HeaderUserMenu",
			]}
		>
			<Example
				id="header"
				title="Header"
				description="Slot-driven, because every product puts something different up here. What it owns is the arrangement: the centre slot shrinks before the right cluster does, so a search field gives up width rather than an icon button truncating into uselessness."
				stacked
				code={`<Header
  breadcrumbs={[{ label: "Billing", href: "/billing" }, { label: "Invoices" }]}
  slots={{
    center: <SearchInput />,
    right: <><Notifications /><Account /></>,
  }}
/>`}
			>
				<div style={FRAME}>
					<Header
						breadcrumbs={[{ label: "Billing", href: "#/header" }, { label: "Invoices" }]}
						slots={{
							center: <SearchInput placeholder="Search invoices…" />,
							right: (
								<>
									<Button tone="neutral" buttonStyle="outline">
										<PlusIcon />
										New
									</Button>
									<Button iconOnly tone="neutral" buttonStyle="ghost" aria-label="Notifications">
										<BellIcon />
									</Button>
									<Avatar size="sm">
										<AvatarFallback>JM</AvatarFallback>
									</Avatar>
								</>
							),
						}}
					/>
					<div style={FRAME_BODY} />
				</div>
			</Example>

			<Example
				id="header-breadcrumbs"
				title="Breadcrumbs are built in"
				description="They are the one region whose position is not negotiable: a trail that moves between screens stops being a trail. homeCrumb prepends a root that is not part of the route — and passing null omits it, which is different from not passing it at all. A shell with no home destination should say so rather than get a default one."
				stacked
				code={`<Header
  homeCrumb={{ label: "Home", href: "/" }}
  breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Members" }]}
/>`}
			>
				<div style={FRAME}>
					<Header
						homeCrumb={{ label: "Home", href: "#/header" }}
						/* A second trail on the page needs a distinct landmark name. */
						breadcrumbsStrings={{ label: "Settings breadcrumb example" }}
						breadcrumbs={[
							{ label: "Settings", href: "#/settings-shell" },
							{ label: "Members" },
						]}
					/>
					<div style={FRAME_BODY} />
				</div>
			</Example>

			<Example id="header-rule" title="What gives way" stacked>
				<Callout label="Rule">
					The centre slot shrinks; the right cluster never does. Put anything that can be
					narrower — a search field, a filter summary — in the centre, and anything whose
					target size is the point in the right. A 24px-wide account menu is not a smaller
					account menu, it is a broken one.
				</Callout>
			</Example>

			<Example id="header-api" title="API">
				<PropTable owner="Header"
					rows={[
						{ name: "slots", type: "{ brand, breadcrumbs, left, center, right }", description: "The regions. brand is hidden below md, where the sidebar trigger stands in for it." },
						{ name: "slots.center", type: "ReactNode", description: "Shrinks before the right cluster. A search field belongs here." },
						{ name: "slots.right", type: "ReactNode", description: "Fixed-size controls: notifications, account, theme. Never shrinks." },
						{ name: "slots.breadcrumbs", type: "ReactNode", description: "Replaces the built-in trail entirely." },
						{ name: "breadcrumbs", type: "Crumb[]", default: "[]", description: "The trail, rendered by the built-in Breadcrumbs." },
						{ name: "homeCrumb", type: "Crumb | null", default: "null", description: "Prepended to the trail. null omits it deliberately." },
						{ name: "showBreadcrumbs", type: "boolean", default: "true", description: "Off for a shell whose pages carry their own trail." },
						{ name: "contentClassName", type: "string", description: "For the inner content row, when the bar itself must stay untouched." },
						{ name: "HeaderBreadcrumbs", type: "component", description: "The sidebar trigger, a rule, and the trail. The three travel together because their arrangement is the part that goes wrong \u2014 a trail without the rule reads as the first crumb, and a trigger placed after it reads as part of the path." },
						{ name: "HeaderSearch / HeaderGlobalSearchTrigger", type: "component", description: "The trigger for a command palette, not a search field. It LOOKS like an input and IS a button, which is the honest shape: typing happens in the palette, so a real field here would take a keystroke and then throw it away." },
						{ name: "HeaderToolButton / HeaderToolPopover", type: "component", description: "The icon controls in the right cluster \u2014 one shape for all of them, because a row where the theme toggle is 32px and the help button is 36px reads as a mistake before anyone can name it." },
						{ name: "HeaderNotifications", type: "component", description: "The bell and its list. It renders what it is handed and reports what was clicked; fetching, marking read and paging belong to the app, because only the app knows what \u201cread\u201d costs." },
						{ name: "HeaderUserMenu", type: "component", description: "The account control. The three callbacks build a command menu; supplying none and passing customContent instead gives a panel, which is the escape hatch for an account area that is not a list of verbs." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
