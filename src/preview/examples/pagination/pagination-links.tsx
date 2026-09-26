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
			pageHref={(target) => `#/pagination?page=${target}`}
			renderLink={({ href, children, onClick, ...rest }) => (
				<a
					href={href}
					{...rest}
					onClick={(event) => {
						/* A client router takes over the click; the href stays for a new tab. */
						event.preventDefault()
						onClick?.(event)
					}}
				>
					{children}
				</a>
			)}
		/>
	)
}
