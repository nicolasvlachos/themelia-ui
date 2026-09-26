import { Alert, AlertDescription, AlertTitle, type AlertTone } from "themelia-ui/base/feedback"

const TONES: AlertTone[] = ["neutral", "primary", "secondary", "info", "success", "warning", "destructive"]

export default function AlertExample() {
	return (
		<>
			{TONES.map((tone) => (
				<Alert key={tone} tone={tone}>
					<AlertTitle>{tone} alert</AlertTitle>
					<AlertDescription>
						Supporting detail that explains what happened and what to do.
					</AlertDescription>
				</Alert>
			))}
		</>
	)
}
