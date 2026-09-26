import { Card, CardContent } from "themelia-ui/base/cards"
import { ErrorState, LoadingState } from "themelia-ui/base/feedback"
import { Stack } from "themelia-ui/base/structure"

export default function FormStates() {
	return (
		<Stack gap="lg">
			<Card>
				<CardContent>
					<LoadingState />
				</CardContent>
			</Card>
			<Card>
				<CardContent>
					<ErrorState onRetry={() => {}} />
				</CardContent>
			</Card>
			<Card>
				<CardContent>
					<ErrorState
						title="That report is no longer available"
						description="It was scheduled for deletion after 90 days."
					/>
				</CardContent>
			</Card>
		</Stack>
	)
}
