import { BuildingIcon, CircleCheckIcon, CircleDashedIcon, CircleXIcon } from "lucide-react"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"

import { FilterType, type FilterConfig } from "themelia-ui/features/filters"
import { AvatarCell, CurrencyCell, DateMetaCell, ResourceCell, StatusCell } from "themelia-ui/features/table"

import { STATUS, type Booking } from "./data"

export const FILTERS: FilterConfig[] = [
	{ key: "q", label: "Search", type: FilterType.SEARCH, placeholder: "Search bookings…", delay: 200 },
	{
		key: "status",
		label: "Status",
		pluralLabel: "statuses",
		type: FilterType.MULTI_SELECT,
		icon: <CircleCheckIcon />,
		displayConfig: { display: "always", priority: 0 },
		options: [
			{ value: "confirmed", label: "Confirmed", icon: <CircleCheckIcon /> },
			{ value: "pending", label: "Pending", icon: <CircleDashedIcon /> },
			{ value: "cancelled", label: "Cancelled", icon: <CircleXIcon /> },
		],
	},
	{
		key: "venue",
		label: "Venue",
		pluralLabel: "venues",
		type: FilterType.MULTI_SELECT,
		icon: <BuildingIcon />,
		displayConfig: { priority: 1 },
		options: [
			{ value: "Marlow Hall", label: "Marlow Hall" },
			{ value: "The Old Granary", label: "The Old Granary" },
			{ value: "Riverside Rooms", label: "Riverside Rooms" },
		],
	},
	{
		key: "guests",
		label: "Guests",
		type: FilterType.RANGE,
		operator: "gt",
		displayConfig: { priority: 2 },
	},
]

/* The index's columns: what a reader scans to find a booking. */
export const indexColumns: LegacyColumnDef<Booking, unknown>[] = [
	{
		id: "booking",
		header: "Booking",
		accessorKey: "venue",
		cell: ({ row }) => (
			<ResourceCell
				title={row.original.venue}
				subtitle={row.original.reference}
				fallback={row.original.venue.slice(0, 2).toUpperCase()}
			/>
		),
	},
	{
		id: "status",
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => <StatusCell value={row.original.status} map={STATUS} />,
	},
	{
		id: "guests",
		header: "Guests",
		accessorKey: "guests",
		meta: { align: "end" },
	},
	{
		id: "total",
		header: "Total",
		accessorKey: "total",
		meta: { align: "end" },
		cell: ({ row }) => <CurrencyCell value={row.original.total} currency="EUR" />,
	},
]

/* The engine's columns: wider, so the sticky first column and the ready-made cells have work to do. */
export const tableColumns: LegacyColumnDef<Booking, unknown>[] = [
	{
		id: "booking",
		header: "Booking",
		accessorKey: "venue",
		cell: ({ row }) => (
			<ResourceCell
				title={row.original.venue}
				subtitle={row.original.reference}
				href={`#/bookings/${row.original.id}`}
				fallback={row.original.venue.slice(0, 2).toUpperCase()}
				badges={row.original.guests > 100 ? [{ label: "Large", tone: "info" }] : undefined}
			/>
		),
	},
	{
		id: "customer",
		header: "Customer",
		accessorKey: "customer",
		cell: ({ row }) => (
			<AvatarCell name={row.original.customer} subtitle={row.original.customerEmail} />
		),
	},
	{
		id: "status",
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => <StatusCell value={row.original.status} map={STATUS} />,
	},
	{
		id: "date",
		header: "Date",
		accessorKey: "date",
		cell: ({ row }) => (
			<DateMetaCell
				value={row.original.date}
				secondary={(date) => date.toLocaleDateString(undefined, { weekday: "long" })}
			/>
		),
	},
	{
		id: "total",
		header: "Total",
		accessorKey: "total",
		meta: { align: "end" },
		cell: ({ row }) => <CurrencyCell value={row.original.total} currency="EUR" />,
	},
]
