import { Heading } from "themelia-ui/base/typography"

export default function HeadingExample() {
	return (
		<>
			<Heading level={1}>Level 1, default size</Heading>
			<Heading level={2}>Level 2, default size</Heading>
			<Heading level={2} size="sm">Level 2 rendered small</Heading>
			<Heading level={3} subHeading="A supporting line under the heading.">
				With a subheading
			</Heading>
		</>
	)
}
