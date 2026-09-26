import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { DisplayLabel } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import styles from "../preview.module.css"

type Heading = { id: string; label: string }

/**
 * On-this-page rail. Headings are read from the DOM after each route change; the active
 * entry is tracked with an IntersectionObserver band near the top.
 */
export function SiteToc() {
	const { pathname } = useLocation()
	const [headings, setHeadings] = useState<Heading[]>([])
	const [active, setActive] = useState<string>()

	useEffect(() => {
		// After paint, so the new route's sections exist.
		const frame = requestAnimationFrame(() => {
			const found = [...document.querySelectorAll<HTMLElement>("main section[id]")].map((el) => ({
				id: el.id,
				label: el.querySelector("h2")?.textContent ?? el.id,
			}))
			setHeadings(found)
			setActive(found[0]?.id)
		})
		return () => cancelAnimationFrame(frame)
	}, [pathname])

	useEffect(() => {
		if (headings.length === 0) return
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting)
				if (visible[0]) setActive(visible[0].target.id)
			},
			// A band just below the sticky header: current once a section's top reaches it.
			{ rootMargin: "-80px 0px -70% 0px" },
		)
		for (const heading of headings) {
			const el = document.getElementById(heading.id)
			if (el) observer.observe(el)
		}
		return () => observer.disconnect()
	}, [headings])

	if (headings.length === 0) return null

	return (
		<aside className={styles.toc}>
			<span className={styles.tocLabel}>
				<DisplayLabel>On this page</DisplayLabel>
			</span>
			{headings.map((heading) => (
				<a
					key={heading.id}
					href={`#${window.location.hash.split("#")[1] ?? ""}`}
					onClick={(event) => {
						event.preventDefault()
						document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" })
					}}
					className={cx(styles.tocLink, active === heading.id && styles.tocLinkActive)}
				>
					{heading.label}
				</a>
			))}
		</aside>
	)
}
