import { useState } from "react"

import { Pagination } from "themelia-ui/base/navigation"

export default function PaginationShapes() {
	const [page, setPage] = useState(3)

	return (
		<>
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
		</>
	)
}
