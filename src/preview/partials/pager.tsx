import { Link, useLocation } from "react-router-dom"

import { Text } from "@/components/base/typography"

import { ROUTES } from "../routes"
import styles from "../preview.module.css"

/** Previous / next across the flattened route order. */
export function Pager() {
	const { pathname } = useLocation()
	const index = ROUTES.findIndex((route) => route.path === pathname)
	if (index === -1) return null

	const previous = index > 0 ? ROUTES[index - 1] : undefined
	const next = index < ROUTES.length - 1 ? ROUTES[index + 1] : undefined
	if (!previous && !next) return null

	/* A landmark name distinct from the /pagination demos' "Pagination". */
	return (
		<nav className={styles.pager} aria-label="Previous and next component">
			{!!previous && (
				<Link to={previous.path} className={styles.pagerLink}>
					<Text tag="span" type="secondary" size="xs">
						Previous
					</Text>
					<Text tag="span" weight="medium">
						{previous.label}
					</Text>
				</Link>
			)}
			{!!next && (
				<Link to={next.path} className={`${styles.pagerLink} ${styles.pagerNext}`}>
					<Text tag="span" type="secondary" size="xs">
						Next
					</Text>
					<Text tag="span" weight="medium">
						{next.label}
					</Text>
				</Link>
			)}
		</nav>
	)
}
