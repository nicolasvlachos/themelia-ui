import type { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRightIcon } from "lucide-react"

import { Heading, Text } from "@/components/base/typography"

import { ROUTES } from "../routes"
import styles from "../preview.module.css"
import { CodeBlock } from "./code-block"
import { Pager } from "./pager"

/** The page frame every component doc shares: import line, examples, props table. */
export function ComponentPage({
	title,
	summary,
	importPath,
	exports,
	alsoImports,
	children,
}: {
	title: string
	summary: string
	/** Subpath consumers import from. Omitted on conceptual pages. */
	importPath?: string
	/** Named exports, used to build the import line. */
	exports?: string[]
	/**
	 * Further import lines for a page documenting more than one family; each becomes its
	 * own gallery card and search hit. Keep the `{ importPath, title, exports }` order, one
	 * entry each: `scripts/lib/preview-pages.mjs` parses the source.
	 */
	alsoImports?: { importPath: string; title?: string; exports: string[] }[]
	children: ReactNode
}) {
	/* The breadcrumb's group is read from the route table, never passed in. */
	const { pathname } = useLocation()
	const route = ROUTES.find((entry) => entry.path === pathname)
	const group = route?.group ?? ""
	/* The labelled run inside the group, where it has one — "Forms › Text › Input". */
	const section = route?.section

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
				<Text type="secondary" size="base">
					{summary}
				</Text>

				{!!importPath && !!exports?.length && (
					<div className={styles.importLine}>
						<CodeBlock
							code={[
								`import { ${exports.join(", ")} } from "${importPath}"`,
								...(alsoImports ?? []).map((entry) => `import { ${entry.exports.join(", ")} } from "${entry.importPath}"`),
							].join("\n")}
						/>
					</div>
				)}
			</header>

			{children}
			<Pager />
		</>
	)
}

export { Link }
