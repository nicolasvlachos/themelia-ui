import * as React from "react"

import { cx } from "@/lib/cx"

import styles from "./skeleton.module.css"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return <div data-slot="skeleton" className={cx("skeleton--component", styles.root, className)} {...props} />
}

export { Skeleton }
