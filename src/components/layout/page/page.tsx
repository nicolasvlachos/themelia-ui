/**
 * Page: `Container`, a title block and a body, the composition every screen repeats. It
 * does not own the scroll; `PageViewport` does, once, around the shell.
 */
import * as React from "react"

import { cx } from "@/lib/cx"

import { Container, type ContainerGutter, type ContainerMaxWidth } from "../containers"
import { PageHeader, type PageHeaderProps } from "./page-header"
import styles from "./page.module.css"

export interface PageProps extends Omit<React.ComponentProps<"div">, "title"> {
	/** The title block, as `PageHeader` props. Omit for a page that supplies its own header. */
	header?: PageHeaderProps
	maxWidth?: ContainerMaxWidth
	gutter?: ContainerGutter
	/** Attributes for the body region, for a page that needs to address it. */
	bodyProps?: React.ComponentProps<"div">
}

export const Page = React.forwardRef<HTMLDivElement, PageProps>(function Page(
	{ header, maxWidth = "xl", gutter = "md", bodyProps, className, children, ...props },
	ref,
) {
	const { className: bodyClassName, ...restBody } = bodyProps ?? {}

	return (
		<Container
			ref={ref}
			maxWidth={maxWidth}
			gutter={gutter}
			data-slot="page"
			className={cx("page--component", styles.page, className)}
			{...props}
		>
			{!!header && <PageHeader {...header} />}
			{children != null && (
				<div
					{...restBody}
					data-slot="page-body"
					className={cx("page--body", styles.body, bodyClassName)}
				>
					{children}
				</div>
			)}
		</Container>
	)
})
