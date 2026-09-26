import { Button } from "themelia-ui/base/buttons"
import { UIProvider } from "themelia-ui/ui-provider"

export default function ScopedTheming() {
	return (
		<div style={{ display: "flex", gap: ".75rem", alignItems: "center", flexWrap: "wrap" }}>
			<Button>root</Button>
			<UIProvider config={{ theme: { colors: { primary: "oklch(0.55 0.2 25)" } } }}>
				<Button>scoped red</Button>
			</UIProvider>
			<UIProvider config={{ theme: { colors: { primary: "oklch(0.5 0.2 265)" } } }}>
				<Button>scoped blue</Button>
			</UIProvider>
			<UIProvider config={{ density: "compact" }}>
				<Button>compact</Button>
			</UIProvider>
			<UIProvider config={{ density: "comfortable" }}>
				<Button>comfortable</Button>
			</UIProvider>
		</div>
	)
}
