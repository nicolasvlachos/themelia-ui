import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function LayoutHeaderPage() {
	return (
		<ComponentPage>
			<Example
				example="layout-header/header"
				title="Header"
				description="Slot-driven, because every product puts something different up here. What it owns is the arrangement: the centre slot shrinks before the right cluster does, so a search field gives up width rather than an icon button truncating into uselessness."
			/>

			<Example
				example="layout-header/header-breadcrumbs"
				title="Breadcrumbs are built in"
				description="They are the one region whose position is not negotiable: a trail that moves between screens stops being a trail. homeCrumb prepends a root that is not part of the route — and passing null omits it, which is different from not passing it at all. A shell with no home destination should say so rather than get a default one."
			/>

			<Example id="header-rule" title="What gives way">
				<Callout label="Rule">
					The centre slot shrinks; the right cluster never does. Put anything that can be
					narrower — a search field, a filter summary — in the centre, and anything whose
					target size is the point in the right. A 24px-wide account menu is not a smaller
					account menu, it is a broken one.
				</Callout>
			</Example>

			<Example id="header-api" title="API">
				<PropTable owners={["Header", "HeaderSlots"]} />
				<PropTable
					symbols={[
						"HeaderBreadcrumbs",
						"HeaderSearch",
						"HeaderGlobalSearchTrigger",
						"HeaderToolButton",
						"HeaderToolPopover",
						"HeaderNotifications",
						"HeaderUserMenu",
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
