export interface CarouselStrings {
	/** Names the region. A page with two carousels needs two names. */
	label: string
	/** The controls are icon-only, so these are the only names they have. */
	previous: string
	next: string
	/** Accessible name for a pagination dot, by the slide it jumps to. */
	goToSlide: (index: number) => string
	/** What the region and each slide are (`aria-roledescription`), announced before their name. */
	roleDescription: string
	slideRoleDescription: string
}

export const defaultCarouselStrings: CarouselStrings = {
	label: "Carousel",
	previous: "Previous",
	next: "Next",
	goToSlide: (index) => `Go to slide ${index}`,
	roleDescription: "carousel",
	slideRoleDescription: "slide",
}
