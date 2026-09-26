import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRightIcon } from "lucide-react"

import { Heading, Text } from "@/components/base/typography"

import { ROUTES } from "../routes"
import styles from "../preview.module.css"
import { CodeBlock } from "./code-block"
import { Pager } from "./pager"

/**
 * The page frame every doc page shares: breadcrumb, heading, summary and import lines, then
 * the page's examples. Everything but the examples comes from the page's routes.json entry.
 */
export function ComponentPage({ children }: { children: ReactNode }) {
	const { pathname } = useLocation()
	const route = ROUTES.find((entry) => entry.path === pathname)
	const title = route?.label ?? ""
	/* The breadcrumb's group, and the labelled run inside it where there is one ("Forms › Text › Input"). */
	const group = route?.group ?? ""
	const section = route?.section
	const imports = route?.imports ?? []

	return (
		<>
			{/* A landmark name no demo or sidebar uses (axe `landmark-unique`). */}
			{!!group && (
				<nav className={styles.breadcrumb} aria-label="Page location">
					<Text tag="span" type="secondary" size="xs">
						{group}
					</Text>
					<ChevronRightIcon aria-hidden />
					{!!section && (
						<>
							<Text tag="span" type="secondary" size="xs">
								{section}
							</Text>
							<ChevronRightIcon aria-hidden />
						</>
					)}
					<Text tag="span" size="xs">
						{title}
					</Text>
				</nav>
			)}

			<header className={styles.pageHeader}>
				<div className={styles.pageTitle}>
					<Heading level={1} size="2xl">
						{title}
					</Heading>
				</div>
				{!!route?.summary && (
					<Text type="secondary" size="base">
						{route.summary}
					</Text>
				)}

				{imports.length > 0 && (
					<div className={styles.importLine}>
						<CodeBlock code={imports.map(({ from, names }) => `import { ${names.join(", ")} } from "${from}"`).join("\n")} />
					</div>
				)}
			</header>

			{children}
			<Pager />
		</>
	)
}

export { Link }
