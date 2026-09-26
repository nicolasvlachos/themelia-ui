import { CheckIcon, CopyIcon } from "lucide-react"

import { useCopyToClipboard } from "@/components/base/copyable"
import { cx } from "@/lib/cx"

import styles from "../preview.module.css"

/** A code sample with a copy control, revealed on hover or keyboard focus. */
export function CodeBlock({ code, className }: { code: string; className?: string }) {
	// Long enough to register, short enough that the control is ready again quickly.
	const { copied, copy } = useCopyToClipboard({ confirmMs: 1600 })

	return (
		<div className={cx(styles.codeWrap, className)}>
			<pre className={styles.code}>
				<code>{code.trim()}</code>
			</pre>
			<button type="button" className={styles.copyButton} onClick={() => void copy(code.trim())}>
				{copied ? <CheckIcon /> : <CopyIcon />}
				{copied ? "Copied" : "Copy"}
			</button>
		</div>
	)
}
