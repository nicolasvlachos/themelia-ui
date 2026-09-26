/**
 * Auth shells: the layouts a sign-in surface uses. Layout only (brand, surface, link rows,
 * split panel); forms, providers and flows encode an auth design and stay with the app.
 */
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { isValidElement, type ComponentProps, type ReactNode } from "react"

import { Text } from "@/components/base/typography"
import { cx } from "@/lib/cx"

import { resolveLayoutLinkRenderer, type LayoutNavigationAdapter } from "../layout.types"
import { AuthCard } from "./auth-card"
import { AuthFooterLinks } from "./auth-footer-links"
import type {
	AuthBrand, AuthBrandConfig, AuthLink, AuthShellSize, AuthShellVariant,
	AuthSplitMobile, AuthSplitSide,
} from "./auth.types"
import { defaultAuthShellStrings, type AuthShellStrings } from "./auth.strings"
import styles from "./auth.module.css"

const isBrandConfig = (brand: AuthBrand): brand is AuthBrandConfig =>
	!!brand && typeof brand === "object" && !isValidElement(brand)

export interface AuthShellProps
	extends LayoutNavigationAdapter,
		Omit<ComponentProps<"div">, "title"> {
	/**
	 * Replaces the element the shell is drawn as (`<main>` by default). Pass
	 * `contentRender={<div />}` when embedded in a page that owns the main landmark.
	 */
	contentRender?: useRender.ComponentProps<"main">["render"]
	/** A rendered mark, or the parts for the shell to arrange. */
	brand?: AuthBrand
	eyebrow?: ReactNode
	title?: ReactNode
	description?: ReactNode
	/** A control at the end of the card's header row — a locale switcher, a step count. */
	headerEnd?: ReactNode
	/** A notice above the form — an expired link, a required invitation. */
	banner?: ReactNode
	/** A strip above the card's header. */
	cardMedia?: ReactNode
	/** A band under the card's content, inside the frame. */
	cardFooter?: ReactNode
	/** Content between the card and the link rows — "Don't have an account?" */
	postCard?: ReactNode
	/** Free content at the very bottom, after every link row. */
	footer?: ReactNode
	/** Help, status, contact. Data, so the separators are decided once. */
	footerLinks?: AuthLink[]
	/** Terms, privacy, cookies. Rendered as its own row so screen readers can skip it. */
	policyLinks?: AuthLink[]
	languageLinks?: AuthLink[]
	/** A rendered control, when a link row is not the right shape for it. */
	languageSwitcher?: ReactNode
	size?: AuthShellSize
	/**
	 * `card` (default) puts the content on a raised surface; `bare` does not; `split` puts
	 * a panel beside it.
	 */
	variant?: AuthShellVariant
	/** `center` uses spare height and lets tall content grow; `start` keeps the form at the top. */
	align?: "center" | "start"
	/** The panel, for `variant="split"`. */
	splitPanel?: ReactNode
	/** Which side the panel is drawn on. The form stays first in the DOM either way. */
	splitSide?: AuthSplitSide
	/** What the panel does when the shell is narrower than 56rem. Hidden by default. */
	splitMobile?: AuthSplitMobile
	/** Heading level for the title. */
	level?: 1 | 2 | 3
	/** Overrides this shell's own copy — the three link rows' names. */
	strings?: Partial<AuthShellStrings>
}

function Brand({ brand, renderLink }: { brand: AuthBrand; renderLink: LayoutNavigationAdapter["renderLink"] }) {
	const link = resolveLayoutLinkRenderer({ renderLink })

	if (!isBrandConfig(brand)) return <div className={styles.brand}>{brand}</div>

	const content = (
		<>
			{!!brand.logo && <span className={styles.brandLogo}>{brand.logo}</span>}
			{(!!brand.label || !!brand.description) && (
				<span className={styles.brandText}>
					{!!brand.label && (
						<Text tag="span" weight="semibold">
							{brand.label}
						</Text>
					)}
					{!!brand.description && (
						<Text tag="span" size="xs" type="secondary">
							{brand.description}
						</Text>
					)}
				</span>
			)}
		</>
	)

	if (brand.href) {
		return (
			<div className={styles.brand}>
				{link({ href: brand.href, "aria-label": brand.ariaLabel, children: content })}
			</div>
		)
	}
	return <div className={styles.brand}>{content}</div>
}

export function AuthShell({
	brand,
	eyebrow,
	title,
	description,
	headerEnd,
	banner,
	cardMedia,
	cardFooter,
	postCard,
	footer,
	footerLinks,
	policyLinks,
	languageLinks,
	languageSwitcher,
	size = "md",
	variant = "card",
	align = "center",
	splitPanel,
	splitSide = "end",
	splitMobile = "hidden",
	level = 1,
	contentRender,
	strings,
	renderLink,
	className,
	children,
	...props
}: AuthShellProps) {
	const copy = { ...defaultAuthShellStrings, ...strings }
	const isSplit = variant === "split" && !!splitPanel

	const belowCard =
		!!postCard ||
		!!languageSwitcher ||
		!!languageLinks?.length ||
		!!footerLinks?.length ||
		!!policyLinks?.length ||
		!!footer

	const main = (
		<AuthMain
			className={cx(styles.shell, align === "start" && styles.shellAlignStart)}
			data-align={align}
			render={contentRender}
		>
			<div
				className={cx(
					styles.surface,
					size === "sm" && styles.sizeSm,
					size === "lg" && styles.sizeLg,
				)}
			>
				{!!brand && <Brand brand={brand} renderLink={renderLink} />}

				<AuthCard
					surface={variant === "bare" ? "bare" : "card"}
					eyebrow={eyebrow}
					title={title}
					description={description}
					headerEnd={headerEnd}
					banner={banner}
					media={cardMedia}
					footer={cardFooter}
					level={level}
				>
					{children}
				</AuthCard>

				{belowCard && (
					<div className={styles.belowCard}>
						{postCard}
						{languageSwitcher}
						{!!languageLinks?.length && (
							<AuthFooterLinks links={languageLinks} label={copy.languageLabel} renderLink={renderLink} />
						)}
						{!!footerLinks?.length && (
							<AuthFooterLinks links={footerLinks} label={copy.helpLabel} renderLink={renderLink} />
						)}
						{!!policyLinks?.length && (
							<AuthFooterLinks links={policyLinks} label={copy.legalLabel} renderLink={renderLink} />
						)}
						{footer}
					</div>
				)}
			</div>
		</AuthMain>
	)

	return (
		<div
			data-slot="auth-shell"
			data-variant={variant}
			data-split-side={isSplit ? splitSide : undefined}
			className={cx("auth-shell--component", styles.root, className)}
			{...props}
		>
			{isSplit ? (
				/* The form is first in the DOM; the panel is hidden below the split threshold unless asked for. */
				<div className={styles.split} data-panel={splitSide}>
					{main}
					<aside
						/* A dark scope: the panel stays dark in both themes, and every token inside follows. */
						data-theme="dark"
						className={cx(styles.splitPanel, splitMobile === "stacked" && styles.splitPanelStacked)}
					>
						{splitPanel}
					</aside>
				</div>
			) : (
				main
			)}
		</div>
	)
}

export interface AuthSplitPanelProps extends ComponentProps<"div"> {
	/** The sign-in surface. Usually an AuthShell with `variant="bare"`. */
	form: ReactNode
	/** Marketing copy, a testimonial, an illustration. Hidden below 56rem of available width. */
	panel?: ReactNode
	/** Which side the panel is drawn on. The form stays first in the DOM either way. */
	panelPosition?: AuthSplitSide
	/** What the panel does when this container is narrower than 56rem. */
	panelMobile?: AuthSplitMobile
}

/**
 * Form beside a panel, for a caller composing both halves itself. `AuthShell
 * variant="split"` is the same arrangement with the shell's own card.
 */
export function AuthSplitPanel({
	form,
	panel,
	panelPosition = "end",
	panelMobile = "hidden",
	className,
	...props
}: AuthSplitPanelProps) {
	return (
		<div
			data-slot="auth-split-panel"
			data-panel={panelPosition}
			className={cx("auth-split-panel--component", styles.splitContainer, className)}
			{...props}
		>
			<div className={styles.split} data-panel={panel ? panelPosition : undefined}>
				<div className={styles.splitForm}>{form}</div>
				{!!panel && (
					<aside
						/* A dark scope: the panel stays dark in both themes, and every token inside follows. */
						data-theme="dark"
						className={cx(styles.splitPanel, panelMobile === "stacked" && styles.splitPanelStacked)}
					>
						{panel}
					</aside>
				)}
			</div>
		</div>
	)
}

/* The shell's own element, split out to take a `render`. Private: consumers use `contentRender`. */
function AuthMain({ className, render, ...props }: useRender.ComponentProps<"main">) {
	return useRender({
		defaultTagName: "main",
		props: mergeProps<"main">({ className }, props),
		render,
		state: {},
	})
}
