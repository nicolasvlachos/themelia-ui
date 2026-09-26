/**
 * PasswordInput — a password field with a reveal button. Its name alone carries the state
 * ("Show password" / "Hide password"); no `aria-pressed`, which would contradict it.
 */
import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cx } from "@/lib/cx"

import { FieldShell } from "./field-shell"
import { Input, type InputProps } from "./input"
import { defaultPasswordInputStrings, type PasswordInputStrings } from "./password-input.strings"
import styles from "./text-inputs.module.css"

export interface PasswordInputProps extends Omit<InputProps, "type"> {
	/**
	 * Overrides this field's own copy — the reveal control's name in each state, which is its
	 * state for a screen reader — and Input's own strings.
	 */
	strings?: Partial<PasswordInputStrings>
}

/**
 * A password field with a reveal control. It takes Input's props, `value` and
 * `defaultValue` included, which behave as Input's. The reveal control's name alone carries
 * its state — "Show password", "Hide password" — with no `aria-pressed` to contradict it.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	function PasswordInput({ strings, className, ...props }, ref) {
		const copy = { ...defaultPasswordInputStrings, ...strings }
		const [visible, setVisible] = React.useState(false)

		return (
			<FieldShell
				className={cx("password-input--component", className)}
				end={
					<button
						type="button"
						className={styles.revealButton}
						// 16px drawn; the target has to be 24. See styles/targets.css.
						data-hit-area
						aria-label={visible ? copy.hide : copy.reveal}
						disabled={props.disabled}
						onClick={() => setVisible((v) => !v)}
					>
						{visible ? <EyeOffIcon /> : <EyeIcon />}
					</button>
				}
			>
				{/* The strings extend Input's, so pass them through. */}
				<Input ref={ref} type={visible ? "text" : "password"} strings={strings} {...props} />
			</FieldShell>
		)
	},
)
