import { useEffect, useState } from "react"
import { HashRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { MenuIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/base/buttons"
import { NativeSelect } from "@/components/base/text-inputs"
import { FormField } from "@/components/base/forms"
import { Text } from "@/components/base/typography"
import { Toaster } from "@/components/base/toaster"
import { AppThemeProvider } from "./app-theme"
import { useAppTheme } from "./app-theme-state"
import { AppThemeLauncher } from "./partials/app-theme-launcher"
import type { ColorScheme, Density } from "@/lib/ui-provider"

import { SiteSearch } from "./partials/site-search"
import { SiteSidebar } from "./partials/site-sidebar"
import { NotFoundPage } from "./partials/not-found"
import { SiteToc } from "./partials/site-toc"
import styles from "./preview.module.css"
import { MOVED_ROUTES, ROUTES } from "./routes"

function Header({
	density,
	setDensity,
	scheme,
	setScheme,
	onToggleNav,
}: {
	density: Density
	setDensity: (value: Density) => void
	scheme: ColorScheme
	setScheme: (value: ColorScheme) => void
	onToggleNav?: () => void
}) {
	const [systemDark, setSystemDark] = useState(false)

	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const update = () => setSystemDark(media.matches)
		update()
		media.addEventListener("change", update)
		return () => media.removeEventListener("change", update)
	}, [])

	// Label and glyph describe what is on screen (including `system`); pressing commits
	// to the opposite explicit scheme.
	const isDark = scheme === "dark" || (scheme === "system" && systemDark)

	return (
		<header className={styles.header}>
			{/* The kit's own Button: the docs site is its first consumer. */}
			<Button
				iconOnly
				tone="neutral"
				buttonStyle="ghost"
				className={styles.navToggle}
				aria-label="Toggle navigation"
				onClick={onToggleNav}
			>
				<MenuIcon />
			</Button>
			<Link to="/" className={styles.brand}>
				<span className={styles.brandMark} aria-hidden>
					UI
				</span>
				<Text tag="span" weight="semibold" size="sm">
					Themelia UI
				</Text>
			</Link>

			<div className={styles.headerSpacer} />
			<SiteSearch />

			<div className={styles.headerActions}>

				{/* A labelled kit select for density. */}
				<FormField
					label="Density"
					orientation="horizontal"
					className={styles.densityField}
				>
					<NativeSelect
						value={density}
						onChange={(event) => setDensity(event.target.value as Density)}
					>
						<option value="compact">Compact</option>
						<option value="default">Default</option>
						<option value="comfortable">Comfortable</option>
					</NativeSelect>
				</FormField>
				<Button
					iconOnly
					tone="neutral"
					buttonStyle="ghost"
					aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
					onClick={() => setScheme(isDark ? "light" : "dark")}
				>
					{isDark ? <SunIcon /> : <MoonIcon />}
				</Button>
			</div>
		</header>
	)
}

/** Scrolls to the top on navigation; without it a long page keeps its old offset. */
function ScrollReset() {
	const { pathname } = useLocation()
	const [last, setLast] = useState(pathname)
	if (last !== pathname) {
		setLast(pathname)
		window.scrollTo({ top: 0 })
	}
	return null
}

function Shell({
	density,
	setDensity,
	scheme,
	setScheme,
}: Omit<Parameters<typeof Header>[0], "onToggleNav">) {
	const [navOpen, setNavOpen] = useState(false)

	return (
		<div className={styles.shell}>
			<ScrollReset />
			<Header
				density={density}
				setDensity={setDensity}
				scheme={scheme}
				setScheme={setScheme}
				onToggleNav={() => setNavOpen((open) => !open)}
			/>
			<div className={styles.body} data-nav-open={navOpen ? "" : undefined}>
				<SiteSidebar onNavigate={() => setNavOpen(false)} />
				<main className={styles.main}>
					<Routes>
						{ROUTES.map((route) => (
							<Route key={route.path} path={route.path} element={<route.component />} />
						))}
						{Object.entries(MOVED_ROUTES).map(([from, to]) => (
							<Route key={from} path={from} element={<Navigate to={to} replace />} />
						))}
						{/* An unknown address gets a not-found page, not an empty main. */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</main>
				<SiteToc />
			</div>
		</div>
	)
}

function AppContent() {
	const { appliedConfig, updateConfig } = useAppTheme()
	return (
		<>
			<HashRouter>
				<Shell
					density={appliedConfig.density ?? "default"}
					setDensity={density => updateConfig({ ...appliedConfig, density })}
					scheme={appliedConfig.colorScheme ?? "system"}
					setScheme={colorScheme => updateConfig({ ...appliedConfig, colorScheme })}
				/>
			</HashRouter>
			<AppThemeLauncher />
			<Toaster />
		</>
	)
}

export function PreviewApp() {
	return <AppThemeProvider><AppContent /></AppThemeProvider>
}
