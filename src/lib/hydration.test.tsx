import { act } from "@testing-library/react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Card, CardContent, CardHeader } from "@/components/base/cards"
import { Checkbox } from "@/components/base/choice-inputs"
import { Copyable } from "@/components/base/copyable"
import { Alert, AlertTitle, Progress } from "@/components/base/feedback"
import { Item, ItemContent, ItemTitle } from "@/components/base/item"
import { OverflowTabBar, Tab, TabList, Tabs } from "@/components/base/navigation"
import { Skeleton } from "@/components/base/skeleton"
import { Grid, Stack } from "@/components/base/structure"
import { Table, TableBody, TableCell, TableRow } from "@/components/base/table"
import { Input } from "@/components/base/text-inputs"
import { Heading, Text } from "@/components/base/typography"
import { Page, PageHeader } from "@/components/layout/page"
import { FileSize, Money } from "@/components/primitives"
import { UIProvider } from "@/lib/ui-provider"

/**
 * The server's markup and the client's first render agree (stronger than
 * `ssr-safety.test.tsx`'s "does not crash"). Mismatches are read through
 * `onRecoverableError`: React 19 does not report them to the console.
 */
const cases: Array<[string, () => React.ReactElement]> = [
	["Avatar", () => <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>],
	["Badge", () => <Badge tone="success">shipped</Badge>],
	["Button", () => <Button loading>Save</Button>],
	["Card", () => <Card><CardHeader>h</CardHeader><CardContent>c</CardContent></Card>],
	["Checkbox", () => <Checkbox />],
	["Copyable", () => <Copyable value="key-1" />],
	["Alert", () => <Alert><AlertTitle>Payment failed</AlertTitle></Alert>],
	["FileSize", () => <FileSize value={2048} />],
	["Grid", () => <Grid>x</Grid>],
	["Heading", () => <Heading level={2}>Title</Heading>],
	["Input", () => <Input placeholder="you@example.com" />],
	["Item", () => <Item><ItemContent><ItemTitle>Invoice</ItemTitle></ItemContent></Item>],
	["Money", () => <Money amount={1234.5} currency="EUR" />],
	["OverflowTabBar", () => (
		<OverflowTabBar items={[{ id: "a", label: "A" }]} value="a" onValueChange={() => {}} />
	)],
	["Page", () => <Page><PageHeader title="Invoices" /></Page>],
	["Progress", () => <Progress value={40} />],
	["Skeleton", () => <Skeleton />],
	["Stack", () => <Stack>x</Stack>],
	["Table", () => (
		<Table><TableBody><TableRow><TableCell>x</TableCell></TableRow></TableBody></Table>
	)],
	["Tabs", () => (
		<Tabs value="a" onValueChange={() => {}}><TabList><Tab value="a">A</Tab></TabList></Tabs>
	)],
	["Text", () => <Text>x</Text>],
]

function hydrationErrors(tree: React.ReactElement): string[] {
	const container = document.createElement("div")
	container.innerHTML = renderToString(tree)
	document.body.append(container)

	const recovered: string[] = []
	act(() => {
		hydrateRoot(container, tree, {
			onRecoverableError: (error) => recovered.push(String((error as Error).message)),
		})
	})
	return recovered
}

describe("hydration", () => {
	for (const [name, make] of cases) {
		it(`${name} hydrates its own server markup`, () => {
			expect(hydrationErrors(<UIProvider>{make()}</UIProvider>)).toEqual([])
		})
	}

	it("detects a mismatch, so the clean results above mean something", () => {
		/*
		 * Proves the suite can fail. The server markup is supplied by hand: `renderToString` runs
		 * in jsdom here, so a `window` check would not diverge.
		 */
		const container = document.createElement("div")
		container.innerHTML = "<span>from the server</span>"
		document.body.append(container)

		const recovered: string[] = []
		act(() => {
			hydrateRoot(container, <span>from the client</span>, {
				onRecoverableError: (error) => recovered.push(String((error as Error).message)),
			})
		})

		expect(recovered.length).toBeGreaterThan(0)
	})
})
