import { useState } from "react"

import { Pagination } from "themelia-ui/base/navigation"

export default function PaginationLinks() {
	const [page, setPage] = useState(3)

	return (
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
	)
}
