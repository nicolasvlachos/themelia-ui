/**
 * Overlay — the single modal-surface primitive on native `<dialog>`: one surface set by
 * `placement`, `modality` and `dismissal`. `base/dialog`, `base/alert-dialog` and
 * `base/sheet` are thin presets used inside this family's root and parts.
 */
import * as React from "react"
import { useRender } from "@base-ui/react/use-render"
import { XIcon } from "lucide-react"

import { Slot } from "@/components/base/slot"
import { useNativeDialog } from "@/hooks/use-native-dialog"
import { cvm } from "@/lib/cvm"
import { cx } from "@/lib/cx"

import { renderWithChildren } from "@/lib/render-with-children"
import { UIPortalHost } from "@/lib/ui-provider"

import { OverlayContext, useOverlayContext } from "./overlay-context"
import { defaultOverlayStrings } from "./overlay.strings"
import styles from "./overlay.module.css"
import type {
	OverlayContentProps, OverlayInset, OverlayLength, OverlayRootProps, OverlaySize,
} from "./overlay.types"

/** Named cross-axis steps resolve to tokens; anything else is used as the length it is. */
const SIZE_TOKEN: Record<string, string> = {
	sm: "var(--overlay-edge-sm)",
	md: "var(--overlay-edge-md)",
	lg: "var(--overlay-edge-lg)",
	full: "var(--overlay-edge-full)",
}

/* The wide-screen ceiling for each preset; an explicit length caps itself. */
const SIZE_CAP: Record<string, string> = { sm: "20rem", md: "24rem", lg: "32rem", full: "100%" }

/** The space the insets leave — what `length` is a fraction of. */
const INSET_BOX = "calc(100% - var(--overlay-edge-inset) * 2)"

/**
 * A percentage length is rewritten as a fraction of the inset box, not the viewport, so the
 * gap at each end equals the inset.
 */
function resolveLength(length: OverlayLength) {
	if (length === "full") return INSET_BOX
	const percent = /^(\d+(?:\.\d+)?)%$/.exec(length.trim())
	return percent ? `calc(${INSET_BOX} * ${Number(percent[1]) / 100})` : length
}

function edgeVars(size?: OverlaySize, length?: OverlayLength, inset?: OverlayInset) {
	const vars: Record<string, string> = {}
	if (size) {
		vars["--overlay-edge-size"] = SIZE_TOKEN[size] ?? size
		vars["--overlay-edge-cap"] = SIZE_CAP[size] ?? size
	}
	if (length) vars["--overlay-edge-length"] = resolveLength(length)
	if (inset) vars["--overlay-edge-inset"] = inset === true ? "var(--overlay-edge-inset-default)" : inset
	return vars
}

function Overlay({ open, defaultOpen = false, onOpenChange, children }: OverlayRootProps) {
	const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
	const isControlled = open !== undefined
	const isOpen = isControlled ? open : uncontrolled
	const reconcileRef = React.useRef<((next: boolean) => void) | null>(null)

	const setOpen = React.useCallback(
		(next: boolean) => {
			if (!isControlled) setUncontrolled(next)
			onOpenChange?.(next)
			reconcileRef.current?.(next)
		},
		[isControlled, onOpenChange],
	)

	const [titleId, setTitleId] = React.useState<string | undefined>()
	const [descriptionId, setDescriptionId] = React.useState<string | undefined>()
	const value = React.useMemo(
		() => ({ open: isOpen, setOpen, reconcileRef, titleId, descriptionId, setTitleId, setDescriptionId }),
		[isOpen, setOpen, titleId, descriptionId],
	)

	return (
		<OverlayContext.Provider value={value}>
			<div data-slot="overlay" style={{ display: "contents" }}>
				{children}
			</div>
		</OverlayContext.Provider>
	)
}

function OverlayTrigger({
	render,
	onClick,
	className,
	children,
	...props
}: React.ComponentProps<"button"> & {
	/** The element this trigger becomes. The canonical polymorphic contract. */
	render?: React.ReactElement
}): React.JSX.Element {
	const { open, setOpen } = useOverlayContext("OverlayTrigger")
	const { ref, ...elementProps } = props
	return useRender({
		defaultTagName: "button",
		render: render ? renderWithChildren(render, children) : undefined,
		ref,
		props: {
			"data-slot": "overlay-trigger",
			type: render ? undefined : "button",
			"aria-haspopup": "dialog",
			"aria-expanded": open,
			className: cx("overlay--trigger", className),
			children,
			onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event)
				if (event.defaultPrevented) return
				// Safari does not focus clicked buttons; focus it so the dialog restores focus here.
				event.currentTarget.focus({ preventScroll: true })
				setOpen(true)
			},
			...elementProps,
		},
	})
}

function OverlayClose({
	render,
	onClick,
	className,
	children,
	...props
}: React.ComponentProps<"button"> & {
	/** The element this close control becomes. The canonical polymorphic contract. */
	render?: React.ReactElement
}) {
	const { setOpen } = useOverlayContext("OverlayClose")
	const polymorphic = render !== undefined
	const Comp = polymorphic ? Slot : "button"
	return (
		<Comp
			data-slot="overlay-close"
			type={polymorphic ? undefined : "button"}
			className={cx("overlay--close", className)}
			onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event)
				if (!event.defaultPrevented) setOpen(false)
			}}
			{...props}
		>
			{render ? renderWithChildren(render, children) : children}
		</Comp>
	)
}

const overlayVariants = cvm(styles.root, {
	variants: {
		placement: {
			center: styles.placementCenter,
			"inline-start": styles.placementInlineStart,
			"inline-end": styles.placementInlineEnd,
			"block-start": styles.placementBlockStart,
			"block-end": styles.placementBlockEnd,
		},
		surface: {
			framed: undefined,
			bare: styles.bare,
		},
	},
	defaultVariants: { placement: "center", surface: "framed" },
})

function OverlayContent({
	placement = "center",
	size,
	length,
	inset,
	modality = "modal",
	surface = "framed",
	dismissal,
	initialFocusRef,
	showCloseButton = true,
	strings,
	className,
	style,
	children,
	...props
}: OverlayContentProps & Omit<React.ComponentProps<"dialog">, "children" | "className">) {
	const copy = { ...defaultOverlayStrings, ...strings }
	const { open, setOpen, reconcileRef, titleId, descriptionId } = useOverlayContext("OverlayContent")

	const { ref, onClose, onCancel, reconcile } = useNativeDialog({
		open,
		onOpenChange: setOpen,
		modal: modality === "modal" ? true : modality === "trap-focus" ? "trap-focus" : false,
		closeOnBackdropClick: dismissal?.backdrop ?? true,
		closeOnEscape: dismissal?.escape ?? true,
		initialFocusRef,
	})

	React.useEffect(() => {
		reconcileRef.current = reconcile
		return () => {
			reconcileRef.current = null
		}
	}, [reconcile, reconcileRef])

	return (
		<dialog
			ref={ref}
			data-slot="overlay-content"
			data-placement={placement}
			data-modality={modality}
			/* Also an attribute: the detached look (full border, rounded corners) cannot branch on a length. */
			data-inset={inset ? "" : undefined}
			/* Named and described by its own title and description; a caller's label wins. */
			aria-labelledby={props["aria-label"] ? undefined : titleId}
			aria-describedby={descriptionId}
			style={{ ...edgeVars(size, length, inset), ...style }}
			className={cx("overlay--component", overlayVariants({ placement, surface }), className)}
			onClose={onClose}
			onCancel={onCancel}
			{...props}
		>
			{/*
			 * Popups inside portal into the dialog: outside it they would sit under the top
			 * layer and be inert.
			 */}
			<UIPortalHost>{children}</UIPortalHost>
			{!!showCloseButton && (
				<OverlayClose render={<button type="button" className={styles.close} aria-label={copy.close} />}>
					<XIcon />
				</OverlayClose>
			)}
		</dialog>
	)
}

/**
 * Wraps children so any button inside dismisses the overlay. When only some actions
 * should close, use `<OverlayClose render={<Button />} />` per action.
 */
function OverlayDismissArea({
	children,
	...props
}: React.ComponentProps<"div">) {
	const { setOpen } = useOverlayContext("OverlayDismissArea")
	return (
		<div
			style={{ display: "contents" }}
			onClick={(event) => {
				const button = (event.target as HTMLElement).closest("button")
				if (button && !event.defaultPrevented) setOpen(false)
			}}
			{...props}
		>
			{children}
		</div>
	)
}

export { Overlay, OverlayTrigger, OverlayClose, OverlayContent, OverlayDismissArea }
export {
	OverlayHeader,
	OverlayBody,
	OverlayFooter,
	OverlayTitle,
	OverlayDescription,
} from "./partials"
