import { CheckIcon } from "lucide-react"

import { Badge } from "themelia-ui/base/badge"
import { VisuallyHidden } from "themelia-ui/base/display"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "themelia-ui/base/table"
import { Text } from "themelia-ui/base/typography"

const ROLES = ["Owner", "Editor", "Viewer"] as const
const PERMISSIONS: { name: string; granted: readonly boolean[] }[] = [
	{ name: "Edit projects", granted: [true, true, false] },
	{ name: "Manage billing", granted: [true, false, false] },
	{ name: "Export data", granted: [true, true, true] },
]

export default function RolesBlueprint() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Permission</TableHead>
					{ROLES.map((role) => (
						<TableHead key={role} align="center">
							{role}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{PERMISSIONS.map((permission) => (
					<TableRow key={permission.name}>
						<TableCell>{permission.name}</TableCell>
						{permission.granted.map((granted, index) => (
							<TableCell key={ROLES[index]} align="center">
								{granted ? (
									<Badge tone="success">
										<CheckIcon aria-hidden />
										<VisuallyHidden>Granted</VisuallyHidden>
									</Badge>
								) : (
									<>
										<Text tag="span" type="secondary" aria-hidden>
											—
										</Text>
										<VisuallyHidden>Not granted</VisuallyHidden>
									</>
								)}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
