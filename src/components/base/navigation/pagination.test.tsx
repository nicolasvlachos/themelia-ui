import { fireEvent, render, screen } from "@testing-library/react"
import * as React from "react"
import { expect, it, vi } from "vitest"

import type { LinkRenderer } from "@/lib/navigation"

import { Pagination } from "./pagination"

const pageHref = (page: number) => `?page=${page}`

it("keeps router links unavailable while disabled, then restores navigation", () => {
	const onPageChange = vi.fn()
	const renderLink: LinkRenderer = ({ href, children, ...rest }) => (
		<a href={href} data-router-link="" {...rest}>{children}</a>
	)
	const { rerender } = render(<Pagination page={2} total={4} disabled pageHref={pageHref} renderLink={renderLink} onPageChange={onPageChange} />)
	expect(screen.queryByRole("link")).toBeNull()
	for (const button of screen.getAllByRole("button")) {
		expect(button).toBeDisabled()
		fireEvent.click(button)
	}
	expect(onPageChange).not.toHaveBeenCalled()
	rerender(<Pagination page={2} total={4} pageHref={pageHref} renderLink={renderLink} onPageChange={onPageChange} />)
	const link = screen.getByRole("link", { name: "Page 3" })
	expect(link).toHaveAttribute("href", "?page=3")
	expect(link).toHaveAttribute("data-router-link")
	/*
	 * The caller's anchor BECOMES the control: it carries the button's classes so it sizes
	 * like the buttons beside it, and the current page keeps its outline. Handed back bare
	 * it would have no geometry, and the arrow's chevron would wrap away from its word.
	 */
	expect(link).toHaveClass("button--component")
	expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("aria-current", "page")
	fireEvent.click(link)
	expect(onPageChange).toHaveBeenCalledTimes(1)
	expect(onPageChange).toHaveBeenCalledWith(3)
})

it("keeps focus on an arrow that reaches the end of the range", () => {
	function Pager() {
		const [page, setPage] = React.useState(2)
		return <Pagination page={page} total={4} onPageChange={setPage} labels="icon" />
	}
	render(<Pager />)
	const previous = screen.getByRole("button", { name: "Previous" })
	previous.focus()
	fireEvent.click(previous)
	expect(previous).toHaveFocus()
	expect(previous).toHaveAttribute("aria-disabled", "true")
	expect(previous).not.toBeDisabled()
})

it("links every page with pageHref alone, as plain anchors", () => {
	render(<Pagination page={1} total={3} pageHref={pageHref} onPageChange={() => {}} />)
	expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("href", "?page=2")
})
