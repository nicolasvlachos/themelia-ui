import { Button, type ButtonStyle, type ButtonTone } from "themelia-ui/base/buttons"

const TONES: ButtonTone[] = [
	"neutral", "primary", "secondary", "info", "success", "warning", "destructive",
]

const STYLES: ButtonStyle[] = ["solid", "outline", "ghost"]

export default function ToneStyle() {
	return (
		<>
			{STYLES.map((buttonStyle) => (
				<div key={buttonStyle} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
					{TONES.map((tone) => (
						<Button key={tone} tone={tone} buttonStyle={buttonStyle}>
							{tone}
						</Button>
					))}
				</div>
			))}
		</>
	)
}
