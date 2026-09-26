import { useIsMobile } from "@/hooks"
import { SidebarContext, type SidebarContextValue } from "./sidebar-store"
import {
	useCallback, useEffect, useMemo, useRef, useState,
	type CSSProperties, type ReactNode,
} from "react"

import { cx } from "@/lib/cx"

import styles from "./sidebar.module.css"

import { defaultSidebarStrings, type SidebarStrings } from "./sidebar.strings"

/** localStorage key for the persisted expanded state. */
const STORAGE_KEY = "sidebar:state"
const TOGGLE_KEY = "b"


export interface SidebarProviderProps extends Omit<React.ComponentProps<"div">, "onChange"> {
	/** Overrides the sidebar's own copy for every part (it travels through the context). */
	strings?: Partial<SidebarStrings>
	/** Initial expanded state when uncontrolled. */
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
	/** Remembers the expanded state across reloads, in `localStorage`. Defaults to true. */
	persist?: boolean
	/** Enables the ⌘B / Ctrl-B toggle shortcut. Defaults to true. */
	keyboardShortcut?: boolean
	/**
	 * Bounds the shell to this element instead of the viewport — for a shell that does not
	 * own the screen (inside a tab, a preview, a nested editor).
	 */
	contained?: boolean
}

export function SidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange,
	persist = true,
	keyboardShortcut = true,
	contained = false,
	strings,
	className,
	style,
	children,
	ref,
	...props
}: SidebarProviderProps) {
	const isMobile = useIsMobile()
	const [mobileSheetOpen, setOpenMobile] = useState(false)

	/*
	 * Leaving mobile closes the sheet, or an invisible focus trap stays open. The flag is
	 * cleared during render on the transition (so narrowing again does not reopen it), and
	 * `openMobile` is derived so the open-but-hidden state is never rendered.
	 */
	const [wasMobile, setWasMobile] = useState(isMobile)
	if (isMobile !== wasMobile) {
		setWasMobile(isMobile)
		if (!isMobile) setOpenMobile(false)
	}

	const openMobile = mobileSheetOpen && isMobile

	// Read in the initialiser, not an effect, so the shell does not flash open.
	const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(() => {
		if (!persist || typeof window === "undefined") return defaultOpen
		try {
			const stored = window.localStorage.getItem(STORAGE_KEY)
			return stored === null ? defaultOpen : stored === "true"
		} catch {
			// Private mode, or site data blocked. The default is a fine answer.
			return defaultOpen
		}
	})

	const open = openProp ?? uncontrolledOpen

	const setOpen = useCallback(
		(value: boolean | ((open: boolean) => boolean)) => {
			const next = typeof value === "function" ? value(open) : value
			if (onOpenChange) onOpenChange(next)
			if (openProp === undefined) setUncontrolledOpen(next)
			if (persist) {
				try {
					window.localStorage.setItem(STORAGE_KEY, String(next))
				} catch {
					// Persisting is a convenience; failing to is not worth breaking the toggle.
				}
			}
		},
		[onOpenChange, open, openProp, persist],
	)

	const wrapperRef = useRef<HTMLDivElement>(null)
	// The shortcut needs the wrapper; a caller's own ref still gets it too.
	const setWrapper = useCallback(
		(node: HTMLDivElement | null) => {
			wrapperRef.current = node
			if (typeof ref === "function") ref(node)
			else if (ref) ref.current = node
		},
		[ref],
	)

	const toggleSidebar = useCallback(() => {
		if (isMobile) setOpenMobile((previous) => !previous)
		else setOpen((previous) => !previous)
	}, [isMobile, setOpen])

	useEffect(() => {
		if (!keyboardShortcut) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== TOGGLE_KEY || !(event.metaKey || event.ctrlKey)) return

			// Not while typing: ⌘B is Bold in rich-text editors.
			const target = event.target as HTMLElement | null
			if (
				target?.isContentEditable ||
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement
			) {
				return
			}

			/*
			 * One sidebar per key press: the provider around the focus, else the first on the
			 * page.
			 */
			if (event.defaultPrevented) return
			const owner =
				target?.closest?.('[data-slot="sidebar-wrapper"]') ??
				document.querySelector('[data-slot="sidebar-wrapper"]')
			if (owner !== wrapperRef.current) return

			event.preventDefault()
			toggleSidebar()
		}
		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [keyboardShortcut, toggleSidebar])

	const value = useMemo<SidebarContextValue>(
		() => ({
			state: open ? "expanded" : "collapsed",
			open,
			setOpen,
			openMobile,
			setOpenMobile,
			isMobile,
			toggleSidebar,
			strings: { ...defaultSidebarStrings, ...strings },
		}),
		[open, setOpen, openMobile, isMobile, toggleSidebar, strings],
	)

	return (
		<SidebarContext.Provider value={value}>
			<div
				ref={setWrapper}
				data-slot="sidebar-wrapper"
				data-contained={contained || undefined}
				className={cx("sidebar-provider--component",
					"sidebar-wrapper--component",
					styles.wrapper,
					contained && styles.wrapperContained,
					className,
				)}
				style={style as CSSProperties}
				{...props}
			>
				{children as ReactNode}
			</div>
		</SidebarContext.Provider>
	)
}
