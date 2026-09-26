/** Which comparisons each filter type offers (a closed set per type), and which one it starts on. */
import type { FilterOperatorStrings } from "./filters.strings"
import { FilterOperator, FilterType, type OperatorOption } from "./filters.types"

export function getTextOperators(strings: FilterOperatorStrings): OperatorOption[] {
	return [
		{ label: strings.contains, value: FilterOperator.CONTAINS },
		{ label: strings.equals, value: FilterOperator.EQUALS },
		{ label: strings.notContains, value: FilterOperator.NOT },
	]
}

export function getSelectOperators(strings: FilterOperatorStrings): OperatorOption[] {
	return [
		{ label: strings.is, value: FilterOperator.EQUALS },
		{ label: strings.isNot, value: FilterOperator.NOT },
	]
}

export function getNumberOperators(strings: FilterOperatorStrings): OperatorOption[] {
	return [
		{ label: strings.equals, value: FilterOperator.EQUALS },
		{ label: strings.greaterThan, value: FilterOperator.GT },
		{ label: strings.lessThan, value: FilterOperator.LT },
		{ label: strings.between, value: FilterOperator.BETWEEN },
	]
}

export function getDateOperators(strings: FilterOperatorStrings): OperatorOption[] {
	return [
		{ label: strings.before, value: FilterOperator.BEFORE },
		{ label: strings.after, value: FilterOperator.AFTER },
		{ label: strings.between, value: FilterOperator.BETWEEN },
	]
}

export function getTagsOperators(strings: FilterOperatorStrings): OperatorOption[] {
	return [
		{ label: strings.has, value: FilterOperator.HAS },
		{ label: strings.hasAny, value: FilterOperator.HAS_ANY },
		{ label: strings.hasAll, value: FilterOperator.HAS_ALL },
	]
}

export function getOperatorsForType(
	type: FilterType,
	strings: FilterOperatorStrings,
): OperatorOption[] {
	switch (type) {
		case FilterType.SEARCH:
			return getTextOperators(strings)
		case FilterType.TAGS:
			return getTagsOperators(strings)
		case FilterType.SELECT:
		case FilterType.MULTI_SELECT:
		case FilterType.ASYNC_SELECT:
			return getSelectOperators(strings)
		case FilterType.RANGE:
			return getNumberOperators(strings)
		case FilterType.DATE:
			return getDateOperators(strings)
		default:
			return getTextOperators(strings)
	}
}

/** The comparison a filter type starts on (e.g. search → contains). */
export function getDefaultOperatorForType(type: FilterType): FilterOperator {
	switch (type) {
		case FilterType.SEARCH:
			return FilterOperator.CONTAINS
		case FilterType.TAGS:
			return FilterOperator.HAS
		case FilterType.DATE:
			return FilterOperator.BEFORE
		default:
			return FilterOperator.EQUALS
	}
}
