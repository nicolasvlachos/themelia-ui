import { DisplayLabel, Text, TextLink } from "themelia-ui/base/typography"

export default function DisplaylabelAndTextlink() {
	return (
		<>
			<DisplayLabel>Account status</DisplayLabel>
			<Text>
				Active since 2024. <TextLink href="#x">View history</TextLink>, or{" "}
				<TextLink href="#y" variant="subtle">read the docs</TextLink>.
			</Text>
		</>
	)
}
