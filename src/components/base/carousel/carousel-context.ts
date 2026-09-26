/*
 * What every carousel part reads: track position and control copy. Its own module so
 * carousel.tsx exports only components (fast refresh).
 */
import { createContext, useContext } from "react"

import type { CarouselStrings } from "./carousel.strings"

export const CarouselContext = createContext<{
	index: number
	count: number
	atStart: boolean
	atEnd: boolean
	scrollToSlide: (index: number) => void
	strings: CarouselStrings
} | null>(null)

export function useCarousel() {
	const context = useContext(CarouselContext)
	if (!context) throw new Error("Carousel parts must be used inside a <Carousel />.")
	return context
}
