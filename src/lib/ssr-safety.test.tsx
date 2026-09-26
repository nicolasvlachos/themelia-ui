// @vitest-environment node

import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Avatar, AvatarFallback } from "@/components/base/avatar"
import { Badge } from "@/components/base/badge"
import { Button } from "@/components/base/buttons"
import { Card, CardContent, CardHeader } from "@/components/base/cards"
import { Carousel, CarouselSlide } from "@/components/base/carousel"
import { Checkbox } from "@/components/base/choice-inputs"
import { Copyable } from "@/components/base/copyable"
import { Alert, AlertTitle, Progress } from "@/components/base/feedback"
import { Item, ItemContent, ItemTitle } from "@/components/base/item"
import { OverflowTabBar, Tab, TabList, Tabs } from "@/components/base/navigation"
import { QRCode } from "@/components/base/qr-code"
import { Skeleton } from "@/components/base/skeleton"
import { Grid, Stack } from "@/components/base/structure"
import { Table, TableBody, TableCell, TableRow } from "@/components/base/table"
import { Input } from "@/components/base/text-inputs"
import { Heading, Text } from "@/components/base/typography"
import { SectionNav } from "@/components/layout/navigation"
import { Page, PageHeader } from "@/components/layout/page"
import { FileSize, Money } from "@/components/primitives"
import { UIProvider } from "@/lib/ui-provider"

/**
 * Nothing crashes on the server: one representative component per family shape renders to
 * a string without touching a browser global during render. Runs in `node` (no DOM), which
 * jsdom and Playwright cannot emulate. Output is covered by the browser suites.
 */
const cases: Array<[string, () => React.ReactElement]> = [
	["Avatar", () => <Avatar><AvatarFallback>AL</AvatarFallback></Avatar>],
	["Badge", () => <Badge>x</Badge>],
	["Button", () => <Button>x</Button>],
	["Card", () => <Card><CardHeader>h</CardHeader><CardContent>c</CardContent></Card>],
	["Carousel", () => <Carousel><CarouselSlide>a</CarouselSlide></Carousel>],
	["Checkbox", () => <Checkbox />],
	["Copyable", () => <Copyable value="x" />],
	["Alert", () => <Alert><AlertTitle>x</AlertTitle></Alert>],
	["FileSize", () => <FileSize value={2048} />],
	["Grid", () => <Grid>x</Grid>],
	["Heading", () => <Heading level={2}>x</Heading>],
	["Input", () => <Input />],
	["Item", () => <Item><ItemContent><ItemTitle>x</ItemTitle></ItemContent></Item>],
	["Money", () => <Money amount={12} currency="EUR" />],
	["OverflowTabBar", () => (
		<OverflowTabBar items={[{ id: "a", label: "A" }]} value="a" onValueChange={() => {}} />
	)],
	["Page", () => <Page><PageHeader title="T" /></Page>],
	["Progress", () => <Progress value={40} />],
	["QRCode", () => <QRCode value="https://x.example" />],
	["SectionNav", () => <SectionNav items={[{ id: "a", label: "A" }]} />],
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

describe("server rendering", () => {
	for (const [name, make] of cases) {
		it(`${name} renders to a string`, () => {
			expect(() => renderToString(<UIProvider>{make()}</UIProvider>)).not.toThrow()
		})
	}

	it("produces markup, not an empty shell", () => {
		/* A component that swallowed its own crash would still "not throw". */
		const html = renderToString(
			<UIProvider>
				<Badge tone="success">shipped</Badge>
			</UIProvider>,
		)
		expect(html).toContain("shipped")
		expect(html).toContain("badge--component")
	})
})
