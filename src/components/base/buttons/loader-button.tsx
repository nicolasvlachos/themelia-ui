/**
 * LoaderButton — a Button that can run its handler, hold the pending state and announce
 * the wait. `handlesLoading` is accepted but inert (see the prop).
 */
import * as React from "react"
import { useFormStatus } from "react-dom"

import { Text } from "@/components/base/typography"
import type { StringsProp } from "@/lib/strings"

import { Button, type ButtonProps } from "./button"
import { defaultButtonLoadingStrings, type ButtonLoadingStrings } from "./button.strings"

export interface LoaderButtonProps extends Omit<ButtonProps, "onClick"> {
	/** Controlled pending state. Omit to let the button manage it from `onClick`. */
	loading?: boolean
	/**
	 * Accepted for source-kit compatibility; inert. Choosing `LoaderButton` is already that
	 * decision. Swallowed rather than spread, so ported call sites don't leak it to the DOM.
	 */
	handlesLoading?: boolean
	/** May return a promise; the button then stays pending until it settles. */
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown>
	strings?: StringsProp<ButtonLoadingStrings>
}

export const LoaderButton = React.forwardRef<HTMLButtonElement, LoaderButtonProps>(
	function LoaderButton({ loading, handlesLoading: _handlesLoading, onClick, strings, children, ...props }, ref) {
		const copy = { ...defaultButtonLoadingStrings, ...strings }
		const [pending, setPending] = React.useState(false)
		// Don't set state if the promise settles after unmount.
		const alive = React.useRef(true)
		React.useEffect(() => () => { alive.current = false }, [])

		/*
		 * A React 19 form action also makes the button busy: `useFormStatus` (pending: false
		 * outside a form, so safe to call unconditionally). Submit buttons only — the status
		 * belongs to the form, not a cancel button beside it.
		 */
		const { pending: formPending } = useFormStatus()
		const submitsForm = props.type === "submit"

		const isControlled = loading !== undefined
		const isLoading = isControlled ? loading : pending || (submitsForm && formPending)

		const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
			const result = onClick?.(event)
			if (!result || typeof (result as Promise<unknown>).then !== "function") return
			if (!isControlled) setPending(true)
			try {
				await result
			} finally {
				if (!isControlled && alive.current) setPending(false)
			}
		}

		return (
			<>
				<Button
					ref={ref}
					loading={isLoading}
					aria-busy={isLoading ? true : undefined}
					onClick={handleClick}
					{...props}
				>
					{children}
				</Button>
				{/*
 * Live region kept mounted and outside the button: inside, it would change the button's
 * name, and aria-busy can defer descendant announcements.
 */}
				<span data-slot="loader-button-status" className="sr-only" role="status" aria-live="polite" aria-atomic="true">
					<Text tag="span">{isLoading ? copy.loading : ""}</Text>
				</span>
			</>
		)
	},
)
