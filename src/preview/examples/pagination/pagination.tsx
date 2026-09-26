import { useState } from "react"

import { Pagination } from "themelia-ui/base/navigation"

export default function PaginationExample() {
	const [page, setPage] = useState(3)

	return (
		<>
			<Pagination page={page} total={128} onPageChange={setPage} />
			{/* Named, because two navigation landmarks called "Pagination" are two a reader
			    cannot tell apart — which is what `strings.label` is for. */}
			<Pagination
				page={2}
				total={5}
				onPageChange={() => {}}
				strings={{ label: "Short pagination example" }}
			/>
		</>
	)
}
