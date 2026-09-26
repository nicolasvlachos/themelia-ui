import { Fragment, Suspense, use, type ReactNode } from "react"
import { useLocation } from "react-router-dom"

import { Stack } from "@/components/base/structure"
import { Heading, Text } from "@/components/base/typography"

import { ROUTES } from "../routes"
import { withCodeSpans } from "./code-spans"
import styles from "../preview.module.css"

export type PropRow = {
	name: string
	/**
	 * Exact source target(s) for abbreviated labels or another owner. Examples:
	 * "Button.tone", "useThing().result", "useThing[1].option", "ItemType.label",
	 * "@/lib/forms#FormControl", or "css:--control-h". Bare symbols validate exports.
	 * Not rendered.
	 */
	api?: string | string[]
	type: string
	default?: string
	description: string
	/** Marks a prop a reader must supply. */
	required?: boolean
}

/** A member as scripts/gen-api-tables.mjs writes it: a prop, an interface member or a parameter. */
type ApiMember = {
	name: string
	type: string
	/** The literals a public alias in `type` stands for. */
	values?: string
	required: boolean
	default?: string
	description?: string
	deprecated?: string | boolean
	/** The entry that lists this member's own members. */
	ref?: string
	members?: ApiMember[]
}

/** One public declaration: see the header of scripts/gen-api-tables.mjs. */
type ApiEntry = {
	kind: string
	modules: string[]
	description?: string
	deprecated?: string | boolean
	extends?: string[]
	props?: ApiMember[]
	members?: ApiMember[]
	type?: string
	signature?: string
	overloads?: string[]
	parameters?: ApiMember[]
	returns?: { type: string; description?: string; ref?: string; members?: ApiMember[] }
}

type ApiData = Record<string, ApiEntry | undefined>

/*
 * Each page's tables are a chunk of their own, src/preview/generated/api/<page>.json, which
 * scripts/gen-api-tables.mjs writes when the dev server starts or a build begins: a page
 * loads the declarations it documents and nothing else.
 */
const PAGE_TABLES = import.meta.glob<{ default: { symbols: ApiData } }>("../generated/api/*.json")
const loaded = new Map<string, Promise<ApiData>>()

function tablesFor(page: string): Promise<ApiData> {
	let tables = loaded.get(page)
	if (!tables) {
		const load = PAGE_TABLES[`../generated/api/${page}.json`]
		tables = load
			? load().then((module) => module.default.symbols)
			: Promise.reject(new Error(`PropTable: no API tables for the page "${page}". Run node scripts/gen-api-tables.mjs.`))
		loaded.set(page, tables)
	}
	return tables
}

function entryFor(api: ApiData, key: string): ApiEntry {
	const entry = api[key]
	if (!entry) {
		throw new Error(
			`PropTable: "${key}" is not a public declaration. Regenerate with node scripts/gen-api-tables.mjs; ` +
				`a name two modules declare is keyed by module, as in "base/action-menu#ActionDefinition".`,
		)
	}
	return entry
}

function membersOf(api: ApiData, holder: { ref?: string; members?: ApiMember[] } | undefined): ApiMember[] {
	if (holder?.members) return holder.members
	const target = holder?.ref ? api[holder.ref] : undefined
	return target?.props ?? target?.members ?? []
}

/**
 * What `owner` lists: a component's props, a type's members, a function's first parameter,
 * or with `()` what a hook returns. A dotted path walks into a member: `UIConfig.typography`.
 */
function resolveOwner(api: ApiData, owner: string) {
	const [head = "", ...path] = owner.split(".")
	const returns = head.endsWith("()")
	const key = returns ? head.slice(0, -2) : head
	const entry = entryFor(api, key)
	let rows = returns ? membersOf(api, entry.returns) : (entry.props ?? entry.members ?? membersOf(api, entry.parameters?.[0]))
	for (const name of path) {
		const member = rows.find((row) => row.name === name)
		if (!member) throw new Error(`PropTable: "${owner}" names no member "${name}".`)
		rows = membersOf(api, member)
	}
	return { key, entry, rows, inherits: returns || path.length > 0 ? [] : (entry.extends ?? []) }
}

/** `<wbr>` break opportunities in an identifier: after a dot and before each camelCase hump. */
function breakable(name: string) {
	return withBreaks(name.split(/(?<=\.)|(?=[A-Z])/))
}

/** The same for a type: also at a generic's opening and its commas. */
function breakableType(type: string) {
	return withBreaks(type.split(/(?<=[<,])|(?=[A-Z])/))
}

function withBreaks(parts: string[]) {
	return parts.map((part, index) => (
		<Fragment key={index}>
			{index > 0 && <wbr />}
			{part}
		</Fragment>
	))
}

/**
 * A doc comment's paragraphs. Its line breaks are where the source wrapped, except in an
 * indented paragraph, which is an example and keeps its lines.
 */
function prose(text: string): ReactNode {
	return text.split(/\n\s*\n/).map((paragraph, index) => {
		const lines = paragraph.split("\n")
		const example = lines.every((line) => /^\s{2,}\S/.test(line))
		return (
			<Fragment key={index}>
				{index > 0 && (
					<>
						<br />
						<br />
					</>
				)}
				{example ? (
					<code>
						{lines.map((line, at) => (
							<Fragment key={at}>
								{at > 0 && <br />}
								{line.trim()}
							</Fragment>
						))}
					</code>
				) : (
					withCodeSpans(paragraph.replace(/\s*\n\s*/g, " "))
				)}
			</Fragment>
		)
	})
}

function describe(member: { description?: string; deprecated?: string | boolean }): ReactNode {
	const deprecated = member.deprecated === true ? "Deprecated." : member.deprecated ? `Deprecated: ${member.deprecated}` : ""
	return prose([deprecated, member.description ?? ""].filter(Boolean).join("\n\n"))
}

/**
 * Where the rest of the props come from, on one line: "Also accepts span props." A part with
 * no props of its own only accepts them.
 */
function inheritsLine(labels: string[], ownRows: number) {
	if (labels.length === 0) return ""
	const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`
	return `${ownRows > 0 ? "Also accepts" : "Accepts"} ${list}.`
}

type Row = {
	name: string
	type: string
	/** The literals a type alias stands for, shown under its name. */
	values?: string
	default?: string
	description: ReactNode
	required?: boolean
}

/**
 * `"soft" | "solid"` → `soft | solid`: under the alias's name the quotes only take room. Each
 * bar stays on its value's line, so a wrapped line never opens with one.
 */
function valuesOf(values: string | undefined) {
	if (!values) return undefined
	const bare = /^"[^"]*"(?: \| "[^"]*")*$/.test(values) ? values.replaceAll('"', "") : values
	return bare.replaceAll(" | ", "\u00a0| ")
}

function toRow(member: ApiMember): Row {
	return {
		name: member.name,
		type: member.type,
		values: valuesOf(member.values),
		default: member.default,
		description: describe(member),
		required: member.required,
	}
}

function Table({ rows, label = "Component API", head = ["Prop", "Type", "Default", "Description"] }: {
	rows: Row[]
	label?: string
	head?: string[]
}) {
	return (
		<div className={styles.tableWrap} tabIndex={0} role="group" aria-label={label}>
			<table className={styles.table}>
				<thead>
					<tr>
						{head.map((cell) => (
							<th key={cell}>{cell}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{/* Keyed by position: one prop name may appear twice in a family's table. */}
					{rows.map((row, rowIndex) => (
						<tr key={`${row.name}-${rowIndex}`}>
							<td>
								<span className={styles.tableCode}>{breakable(row.name)}</span>
								{!!row.required && (
									<Text tag="span" type="error" size="xs">
										{" *"}
									</Text>
								)}
							</td>
							<td>
								<span className={`${styles.tableCode} ${styles.tableType}`}>{breakableType(row.type)}</span>
								{!!row.values && (
									<>
										<br />
										<Text tag="span" type="secondary" size="xs">
											<span className={styles.tableCode}>{row.values}</span>
										</Text>
									</>
								)}
							</td>
							<td>
								<Text tag="span" type="secondary" size="xs">
									<span className={styles.tableCode}>{row.default ?? "—"}</span>
								</Text>
							</td>
							<td>
								<Text tag="span" size="sm">
									{typeof row.description === "string" ? withCodeSpans(row.description) : row.description}
								</Text>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

/** Exports with their signatures, or a type's text where there is no signature. */
function Exports({ api, names }: { api: ApiData; names: string[] }) {
	return (
		<Table
			label="Exports"
			head={["Export", "Signature", "Kind", "Description"]}
			rows={names.map((name) => {
				const entry = entryFor(api, name)
				return {
					name,
					type: entry.signature ?? entry.type ?? entry.extends?.join(", ") ?? "—",
					default: entry.kind,
					description: describe(entry),
				}
			})}
		/>
	)
}

/**
 * The API of a component, a type or a function, rendered from its declaration by way of
 * scripts/gen-api-tables.mjs, so the table says what the code says:
 *
 *   owner     one declaration: `Badge`, `UIConfig.typography`, or `useThing()` for what a
 *             hook returns. The members, then what the rest of the props extend.
 *   owners    the parts of a composite, each under its own heading with its own table.
 *   symbols   exports with their signatures: hooks, functions, constants.
 *
 * The data holds only what the pages name, so a new `owner` needs a run of
 * `node scripts/gen-api-tables.mjs`, which also fails on a name the package does not declare.
 */
export function PropTable({ rows, ...props }: {
	owner?: string
	owners?: string[]
	symbols?: string[]
	/**
	 * Hand-written rows, only for what has no TypeScript declaration to generate from, such as
	 * CSS custom properties. Everything else uses `owner`, `owners` or `symbols`.
	 */
	rows?: PropRow[]
}) {
	if (rows) return <Table rows={rows} />
	return (
		<Suspense fallback={null}>
			<GeneratedTable {...props} />
		</Suspense>
	)
}

/** The tables of the page being shown, loaded with it. */
function usePageTables(): ApiData {
	const { pathname } = useLocation()
	const page = ROUTES.find((route) => route.path === pathname)?.page
	if (!page) throw new Error(`PropTable: ${pathname} is not a documentation page.`)
	return use(tablesFor(page))
}

function GeneratedTable({ owner, owners, symbols }: { owner?: string; owners?: string[]; symbols?: string[] }) {
	const api = usePageTables()

	if (owner) {
		const found = resolveOwner(api, owner)
		const line = inheritsLine(found.inherits, found.rows.length)
		/* A function whose first parameter is not an object has no rows: its signature says it all. */
		if (found.rows.length === 0 && !line && found.entry.signature) return <Exports api={api} names={[found.key]} />
		return (
			<>
				{found.rows.length > 0 && <Table rows={found.rows.map(toRow)} />}
				{!!line && (
					<Text type="secondary" size="xs">
						{line}
					</Text>
				)}
				{found.rows.length === 0 && !line && (
					<Text type="secondary" size="xs">
						{found.entry.kind === "component" ? "Takes no props." : "Has no members."}
					</Text>
				)}
			</>
		)
	}

	if (owners) {
		return (
			<>
				{owners.map((name) => {
					const found = resolveOwner(api, name)
					const line = inheritsLine(found.inherits, found.rows.length)
					/* A part's heading sits nearer its own table than the table before it. */
					return (
						<Stack key={name} gap="md">
							<Heading
								level={3}
								size="sm"
								subHeading={found.entry.description || line ? (
									<>
										{describe(found.entry)}
										{!!found.entry.description && !!line && " "}
										{line}
									</>
								) : undefined}
							>
								<code>{name}</code>
							</Heading>
							{found.rows.length > 0 && <Table label={`${name} API`} rows={found.rows.map(toRow)} />}
						</Stack>
					)
				})}
			</>
		)
	}

	if (symbols) return <Exports api={api} names={symbols} />

	throw new Error("PropTable: pass owner, owners, symbols or rows.")
}
