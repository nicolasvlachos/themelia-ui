import { MilestonesTimeline, type Milestone } from "themelia-ui/blocks/timelines"

const MILESTONES: Milestone[] = [
	{ id: "1", title: "Discovery", description: "Interviews with eight teams.", status: "completed", dueDate: "12 Jun" },
	{ id: "2", title: "Design system audit", status: "completed", dueDate: "3 Jul" },
	{ id: "3", title: "Token consolidation", description: "1,699 custom properties down to 479.", status: "inProgress", dueDate: "29 Aug", progress: 68 },
	{ id: "4", title: "Consumer migration", status: "blocked", description: "Waiting on the package release." },
	{ id: "5", title: "Deprecate the old kit", status: "upcoming", dueDate: "Q4" },
]

export default function BlocksMilestones() {
	return (
		<MilestonesTimeline milestones={MILESTONES} />
	)
}
