import { Select } from "themelia-ui/base/choice-inputs"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input, NativeSelect, Textarea } from "themelia-ui/base/text-inputs"
import { UIProvider } from "themelia-ui/ui-provider"


export default function IphoneInputZoom() {
	return (
		<UIProvider config={{ forms: { preventIPhoneZoom: true } }}>
			<Stack gap="sm" style={{ maxWidth: "26rem", width: "100%" }}>
				<FormField label="Enabled on iPhones"><Input placeholder="16px minimum on iPhone" /></FormField>
				<FormField label="iPhone textarea"><Textarea /></FormField>
				<FormField label="iPhone native select"><NativeSelect><option>First option</option></NativeSelect></FormField>
				<FormField label="Button select"><Select options={[{ value: "a", label: "First option" }]} defaultValue="a" /></FormField>
				<UIProvider config={{ forms: { preventIPhoneZoom: false } }}>
					<FormField label="Nested opt-out"><Input placeholder="Normal field typography" /></FormField>
				</UIProvider>
			</Stack>
		</UIProvider>
	)
}
