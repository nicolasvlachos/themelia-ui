import { defaultInputStrings, type InputStrings } from "./input.strings"

/** Extends the input strings, because the props extend Input's — see forms-numeric. */
export interface PasswordInputStrings extends InputStrings {
	/** The reveal control's name in each state (the name is the state). */
	reveal: string
	hide: string
}

export const defaultPasswordInputStrings: PasswordInputStrings = {
	...defaultInputStrings,
	reveal: "Show password",
	hide: "Hide password",
}
