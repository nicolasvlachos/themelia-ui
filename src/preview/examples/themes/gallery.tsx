import { Badge } from "themelia-ui/base/badge"
import { Button } from "themelia-ui/base/buttons"
import { Card } from "themelia-ui/base/cards"
import { Switch } from "themelia-ui/base/choice-inputs"
import { MetadataList } from "themelia-ui/base/display"
import { FormField } from "themelia-ui/base/forms"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { themes, type ThemeName } from "themelia-ui/theming"
import { UIProvider } from "themelia-ui/ui-provider"

/* Each theme on a region of its own: the nested provider sets its colours, corners, spacing, type and card style there. */
export default function ThemeGallery() {
	return (
		<div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", width: "100%" }}>
			{(Object.keys(themes) as ThemeName[]).map((name) => {
				const theme = themes[name]
				return (
					<UIProvider key={name} config={theme.config}>
						<Card title={theme.label} description={theme.description}>
							<Stack gap="sm">
								<FormField label="Event">
									<Input defaultValue="Autumn gala" />
								</FormField>
								<MetadataList
									layout="rows"
									items={[
										{ label: "Guests", value: "120" },
										{ label: "Deposit", value: "€2,400 paid" },
									]}
								/>
								<Switch defaultChecked aria-label={`Send reminders, ${theme.label}`} />
								<Stack direction="horizontal" gap="sm" align="center">
									<Button>Publish</Button>
									<Button tone="neutral" appearance="outline">Preview</Button>
									<Badge tone="primary">Draft</Badge>
								</Stack>
							</Stack>
						</Card>
					</UIProvider>
				)
			})}
		</div>
	)
}
