/**
 * WorkspaceRecordHeader: a `PageHeading` that identifies a record (media, status, metadata
 * pairs, two tiers of action). It maps onto PageHeading's slots and adds the metadata list
 * and the named action region.
 */
import * as React from "react"

import { MetadataList } from "@/components/base/display"
import { PageHeading } from "@/components/base/navigation"
import { Heading, Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import {
	defaultWorkspaceRecordHeaderStrings, type WorkspaceRecordHeaderStrings,
} from "./workspace.strings"
import styles from "./workspace.module.css"

export interface WorkspaceRecordMetadataItem {
	id?: string
	label: React.ReactNode
	value: React.ReactNode
}

export interface WorkspaceRecordHeaderProps
	extends Omit<React.ComponentProps<"div">, "title"> {
	title: React.ReactNode
	description?: React.ReactNode
	/** An avatar, an icon medallion, a thumbnail. */
	media?: React.ReactNode
	/** Status marks beside the title. Short — the title is what gives way, not these. */
	badges?: React.ReactNode
	/** A single prominent status, rendered after the badges. */
	status?: React.ReactNode
	/** Key/value pairs, drawn inline: each label and its value are one item, read as one fact. */
	metadata?: WorkspaceRecordMetadataItem[]
	/** Overrides this header's own copy — the names of its two unlabelled regions. */
	strings?: Partial<WorkspaceRecordHeaderStrings>
	/** Primary actions, pinned to the end of the title row. */
	actions?: React.ReactNode
	/** A second, quieter row beneath — filters, tabs, bulk controls. */
	secondaryActions?: React.ReactNode
	headingLevel?: 1 | 2 | 3
}

export function WorkspaceRecordHeader({
	title,
	description,
	media,
	badges,
	status,
	metadata,
	actions,
	strings,
	secondaryActions,
	headingLevel = 1,
	className,
	children,
	...props
}: WorkspaceRecordHeaderProps) {
	const copy = { ...defaultWorkspaceRecordHeaderStrings, ...strings }
	const hasSuffix = badges != null || status != null
	return (
		<PageHeading
			{...(props as Omit<React.ComponentProps<"header">, "title">)}
			data-slot="workspace-record-header"
			className={cx("workspace-record-header--component", styles.recordHeader, className)}
			/*
			 * The record's own title scale and truncation: a record name gives way to the
			 * status beside it, where a page title would wrap.
			 */
			title={
				<Heading level={headingLevel} size="xl" truncate>
					{title}
				</Heading>
			}
			description={
				description != null ? (
					<Text type="secondary">
						{description}
					</Text>
				) : undefined
			}
			leading={media}
			titleSuffix={
				hasSuffix ? (
					<span className={styles.titleSuffix}>
						{badges}
						{status}
					</span>
				) : undefined
			}
			actions={
				actions ? (
					<div role="group" aria-label={copy.actions} className={styles.actions}>
						{actions}
					</div>
				) : undefined
			}
			/* The kit's inline metadata row. */
			afterDescription={
				metadata?.length ? (
					<MetadataList
						layout="inline"
						density="compact"
						itemSeparator
						aria-label={copy.metadata}
						className={styles.metadata}
						items={metadata.map((item, index) => ({
							id: item.id ?? String(index),
							label: item.label,
							value: item.value,
						}))}
					/>
				) : undefined
			}
		>
			{!!secondaryActions && <div className={styles.secondary}>{secondaryActions}</div>}
			{children}
		</PageHeading>
	)
}
