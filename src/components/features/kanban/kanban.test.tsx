import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { KeyboardSensor } from "@dnd-kit/core"

const sensorRegistrations = vi.hoisted(() => vi.fn())

vi.mock("@dnd-kit/core", async () => {
	const actual = await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core")
	return {
		...actual,
		useSensor: (sensor: unknown, options?: unknown) => {
			sensorRegistrations(sensor, options)
			return actual.useSensor(sensor as never, options as never)
		},
	}
})

import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem } from "./kanban"

interface Card {
	id: string
}

describe("Kanban", () => {
	it("registers a keyboard drag sensor for sortable cards", () => {
		const value = { todo: [{ id: "a" }, { id: "b" }] }
		const onValueChange = vi.fn()
		render(
			<Kanban value={value} onValueChange={onValueChange} getItemValue={(item: Card) => item.id}>
				<KanbanBoard>
					<KanbanColumn value="todo">
						<KanbanColumnContent value="todo">
							<KanbanItem value="a">Card A</KanbanItem>
							<KanbanItem value="b">Card B</KanbanItem>
						</KanbanColumnContent>
					</KanbanColumn>
				</KanbanBoard>
			</Kanban>,
		)

		expect(sensorRegistrations).toHaveBeenCalledWith(
			KeyboardSensor,
			expect.objectContaining({ coordinateGetter: expect.any(Function) }),
		)
	})
})
