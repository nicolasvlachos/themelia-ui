import * as React from "react"

import { Heading, Text } from "@/components/base/typography"

import styles from "../preview.module.css"

/** Page frame: title, one-line purpose, then the examples. */
export function Page({
	title,
	summary,
	children,
}: {
	title: string
	summary: string
	children: React.ReactNode
}) {
	return (
		<>
			<header className={styles.pageHeader}>
				<Heading level={1} size="2xl">
					{title}
				</Heading>
				<Text type="secondary">{summary}</Text>
			</header>
			{children}
		</>
	)
}
