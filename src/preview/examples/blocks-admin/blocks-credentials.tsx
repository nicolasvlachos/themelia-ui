import { CredentialList } from "themelia-ui/blocks/admin/access"

const CREDENTIALS = [
	{ id: "1", name: "Production", value: "sk_live_4417a92f0b3d", displayValue: "sk_live_••••0b3d" },
	{ id: "2", name: "Staging", value: "sk_test_88fe12c4a771", displayValue: "sk_test_••••a771" },
	{ id: "3", name: "CI", value: "sk_ci_29ab77f0e145", displayValue: "sk_ci_••••e145", disabled: true },
]

export default function BlocksCredentials() {
	return (
		<CredentialList items={CREDENTIALS} onAdd={() => {}} onDelete={() => {}} />
	)
}
