import { useParams } from "react-router-dom"

import { EXAMPLES } from "../examples"
import { Example } from "./example"
import { NotFoundPage } from "./not-found"

/**
 * One example on a page of its own: `#/example/<page>/<id>`. It renders in the docs shell
 * through the same `Example` a page uses, so it has the width and layout it has on its page.
 * Local screenshots capture each example here, so a change shows as a diff of one component.
 */
export function ExampleFrame() {
	const { page = "", id = "" } = useParams()
	const key = `${page}/${id}`
	if (!EXAMPLES[key]) return <NotFoundPage />
	return <Example example={key} title={key} />
}
