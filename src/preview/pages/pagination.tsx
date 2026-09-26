import { useState } from "react"

import { Pagination } from "@/components/base/navigation"

import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function PaginationPage() {
	const [page, setPage] = useState(3)

	return (
		<ComponentPage
			title="Pagination"
			summary="Page numbers with ellipses. The range is computed by paginationRange, which is exported so a custom control can use the same arithmetic."
			importPath="@/components/base/navigation"
			exports={["Pagination", "paginationRange", "type PaginationLinkProps"]}
		>
			<Example
				id="pagination"
				title="Pagination"
				description="A window around the current page with ellipses for the gaps, so the control stays the same width whether there are five pages or five thousand. First and last are always shown — losing them behind an ellipsis makes 'go to the end' impossible."
				stacked
				code={`<Pagination page={page} total={128} onPageChange={setPage} />`}
			>
				<Pagination page={page} total={128} onPageChange={setPage} />
				{/* Named, because two navigation landmarks called "Pagination" are two a reader
				    cannot tell apart — which is what `strings.label` is for. */}
				<Pagination
					page={2}
					total={5}
					onPageChange={() => {}}
					strings={{ label: "Short pagination example" }}
				/>
			</Example>

			<Example
				id="pagination-shapes"
				title="Arrows, and what they are made of"
				description="The arrows carry their words from sm up and fall back to chevrons below it, so the pager under a wide table reads as Previous / Next and the one on a phone still fits. numbers={false} leaves the pair on its own, for a cursor pager with no page count to show."
				stacked
				code={`<Pagination labels="text" … />
<Pagination labels="icon" … />
<Pagination numbers={false} page={3} total={12} … />`}
			>
				<Pagination
					page={page}
					total={128}
					onPageChange={setPage}
					labels="text"
					strings={{ label: "Worded pagination example" }}
				/>
				<Pagination
					page={page}
					total={128}
					onPageChange={setPage}
					labels="icon"
					strings={{ label: "Icon pagination example" }}
				/>
				<Pagination
					page={page}
					total={128}
					onPageChange={setPage}
					numbers={false}
					strings={{ label: "Arrows-only pagination example" }}
				/>
			</Example>

			<Example
				id="pagination-links"
				title="A pager is navigation"
				description="renderLink hands every control to the caller's own link, so a server-rendered list gets real hrefs — openable in a new tab, and working with JavaScript off. onPageChange still fires, so a client router intercepts without a second prop. A disabled arrow stays a button: there is no href for a page that does not exist."
				stacked
				code={`<Pagination
  page={page}
  total={128}
  onPageChange={setPage}
  renderLink={(page, props) => <Link href={\`?page=\${page}\`} {...props} />}
/>`}
			>
				<Pagination
					page={page}
					total={12}
					onPageChange={setPage}
					strings={{ label: "Linked pagination example" }}
					renderLink={(target, linkProps) => (
						<a
							href={`#/pagination?page=${target}`}
							{...linkProps}
							onClick={(event) => {
								event.preventDefault()
								linkProps.onClick(event)
							}}
						/>
					)}
				/>
			</Example>

			<Example id="pagination-api" title="API">
				<PropTable owner="Pagination"
					rows={[
						{ name: "page", type: "number", required: true, description: "Current page, 1-indexed." },
						{ name: "total", type: "number", required: true, description: "Total pages. (This table said `pageCount` for as long as it existed; the prop has always been `total`.)" },
						{ name: "siblings", type: "number", default: "1", description: "Pages shown either side of the current one." },
						{ name: "disabled", type: "boolean", default: "false", description: "Disables every control while navigation is unavailable. Linked controls become disabled buttons until navigation is available again." },
						{ name: "labels", type: "\"icon\" | \"text\" | \"responsive\"", default: "\"responsive\"", description: "Whether the arrows carry their words. responsive is text from sm up and chevrons below, because the words are what a pager under a wide table wants and the width is what a phone has not got. The words come from strings, so they are the accessible name too." },
						{ name: "numbers", type: "boolean", default: "true", description: "false leaves the two arrows alone — a cursor pager, where there is no page count to show." },
						{ name: "renderLink", type: "(page, props) => ReactNode", description: "Renders each control as the caller's own link. A pager is navigation: on a server-rendered list every control should be an <a href> that works without JavaScript and opens in a new tab. A DISABLED arrow stays a button, because there is no href for a page that does not exist." },
						{ name: "paginationRange()", type: "(page, pageCount, siblings) => (number | 'ellipsis')[]", description: "The arithmetic on its own, for a custom control." },
						{ name: "strings", type: "Partial<PaginationStrings>", description: "Overrides this pager's own copy — the region name, the two icon-only arrows, the ellipsis, and each page control named by the page it goes to." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
