import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

export function CarouselPage() {
	return (
		<ComponentPage>
			<Example
				example="carousel/carousel"
				title="Carousel"
				description="The browser already does momentum, touch, and rubber-banding better than JS can, and a scroll container is keyboard-scrollable and readable by assistive technology for free. Slide width is a CSS length, so a track can show one card or five."
			/>

			<Example
				example="carousel/controls"
				title="Control placement"
				description="outside keeps the buttons clear of the content, which is right when slides have their own edges. overlay floats them over the track for full-bleed slides, where outside controls would push the track narrower than the viewport."
			/>

			<Example
				example="carousel/sizes"
				title="Slide width"
				description="size is the width the slide takes in the track — a percentage for a fixed number per view, a length for a fixed card. Mixed widths are allowed; snapping follows whatever each slide occupies."
			/>

			<Example id="carousel-rule" title="The scroll is the source of truth">
				<Callout label="Rule">
					The carousel reads its position from the scroll rather than mirroring it in
					state. A mirror drifts the moment anything else moves the track — a focused
					control scrolled into view, a hash link, a keyboard, a trackpad fling — and
					then the dots disagree with what the reader can see.
				</Callout>
			</Example>

			<Example id="carousel-api" title="API">
				<PropTable owners={["Carousel", "CarouselSlide", "CarouselControl"]} />
				<PropTable symbols={["CarouselDots", "useCarousel"]} />
			</Example>
		</ComponentPage>
	)
}
