import {
	CSPProvider as BaseCSPProvider,
	type CSPProviderProps as BaseCSPProviderProps,
} from "@base-ui/react/csp-provider"

/**
 * Configures the inline style/script policy used by Base UI-backed kit components.
 *
 * Supply the request's nonce when inline elements are allowed by nonce, or set
 * `disableStyleElements` when the consuming app provides the equivalent CSS itself.
 */
export interface CSPProviderProps
	extends Pick<BaseCSPProviderProps, "children" | "nonce" | "disableStyleElements"> {}

export function CSPProvider(props: CSPProviderProps) {
	return <BaseCSPProvider {...props} />
}
