import {
	ContentSkeleton, PageSkeleton, Skeleton, TableSkeleton, TwoColumnPageSkeleton,
} from "@/components/base/skeleton"
import { Stack } from "@/components/base/structure"
import { Text } from "@/components/base/typography"

import { MEASURE } from "../partials/measures"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function SkeletonPage() {
	return (
		<ComponentPage
			title="Skeleton"
			summary="A placeholder in the shape of what is loading. The composed skeletons mirror the layouts the kit already ships, so a loading page is the same geometry as the loaded one."
			importPath="@/components/base/skeleton"
			exports={["Skeleton", "ContentSkeleton", "PageSkeleton", "TableSkeleton", "TwoColumnPageSkeleton"]}
		>
			<Example
				id="skeleton"
				title="Skeleton"
				description="The primitive is a box you size yourself. Everything below is built from it."
				stacked
				code={`<Skeleton style={{ width: "12rem", height: "1rem" }} />`}
			>
				<Stack gap="sm" style={MEASURE.field}>
					<Skeleton style={{ width: "60%", height: "1.25rem" }} />
					<Skeleton style={{ width: "100%", height: "1rem" }} />
					<Skeleton style={{ width: "85%", height: "1rem" }} />
				</Stack>
			</Example>

			<Example
				id="composed"
				title="Composed skeletons"
				description="Shaped like the thing that is coming. A generic grey rectangle tells the reader only that something is happening; a skeleton in the right geometry tells them what, and stops the page jumping when it resolves."
				stacked
				code={`<ContentSkeleton lines={3} />
<TableSkeleton rows={4} columns={3} />
<PageSkeleton blocks={2} />
<TwoColumnPageSkeleton />`}
			>
				<Stack gap="2xl" style={{ width: "100%" }}>
					<Stack gap="xs">
						<Text size="xs" type="secondary">ContentSkeleton</Text>
						<ContentSkeleton lines={3} />
					</Stack>
					<Stack gap="xs">
						<Text size="xs" type="secondary">TableSkeleton</Text>
						<TableSkeleton rows={4} columns={3} />
					</Stack>
					<Stack gap="xs">
						<Text size="xs" type="secondary">PageSkeleton</Text>
						<PageSkeleton blocks={2} />
					</Stack>
					<Stack gap="xs">
						<Text size="xs" type="secondary">TwoColumnPageSkeleton</Text>
						<TwoColumnPageSkeleton />
					</Stack>
				</Stack>
			</Example>

			<Example id="skeleton-rule" title="It is announced, not silent" stacked>
				<Callout label="Rule">
					Every composed skeleton takes a <code>label</code> and announces itself as busy.
					A screen reader on a page of unlabelled grey boxes is told nothing at all — the
					visual affordance is the one thing that does not reach them.
				</Callout>
			</Example>

			<Example id="skeleton-api" title="API">
				<PropTable owner="TableSkeleton"
					rows={[
						{ name: "Skeleton", type: "component", description: "The primitive box. Size it with style or a class." },
						{ name: "ContentSkeleton lines / showTitle", type: "number / boolean", description: "A paragraph of prose, optionally under a title bar." },
						{ name: "TableSkeleton rows / columns / showHeader", type: "number / number / boolean", description: "A table's geometry before the data lands: the real row and head heights, a wide first column, a right-aligned last one." },
						{ name: "TableSkeleton framed", type: "boolean", default: "true", description: "The table's edge and corner. Off when it stands in for a table inside a card that already draws one." },
						{ name: "PageSkeleton blocks / showHeader", type: "number / boolean", description: "PageHeader's row — title, description, actions — over card-shaped panels." },
						{ name: "TwoColumnPageSkeleton", type: "component", description: "A detail page: the record's panel, and beside it its owner and facts." },
						{ name: "label", type: "string", description: "Announced while loading. Every composed skeleton takes one." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
