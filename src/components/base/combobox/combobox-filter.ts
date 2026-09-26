/* Base UI's filter hook under the kit's name, kept out of component files (fast refresh). */
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

/**
 * Locale-aware matchers from Base UI — `contains`, `startsWith` and the rest — for a caller
 * filtering a list themselves who still wants the popup's rules about what counts as a match.
 */
export const useComboboxFilter = ComboboxPrimitive.useFilter
