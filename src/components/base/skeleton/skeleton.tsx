import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./skeleton.module.css"

/** The primitive box. Size it with `style` or a class; the composed skeletons are built from it. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="skeleton" className={cx("skeleton--component", styles.root, className)} {...props} />
}

export { Skeleton }
