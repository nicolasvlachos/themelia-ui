import { Button, type ButtonAppearance, type ButtonTone } from "themelia-ui/base/buttons"

const TONES: ButtonTone[] = [
	"neutral", "primary", "secondary", "info", "success", "warning", "destructive",
]

const STYLES: ButtonAppearance[] = ["solid", "outline", "ghost"]

export default function ToneStyle() {
	return (
		<>
			{STYLES.map((appearance) => (
				<div key={appearance} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
					{TONES.map((tone) => (
						<Button key={tone} tone={tone} appearance={appearance}>
							{tone}
						</Button>
					))}
				</div>
			))}
		</>
	)
}
