import { Card } from "@/components/base/cards"
import { Carousel, CarouselSlide } from "@/components/base/carousel"
import { Text } from "@/components/base/typography"

import styles from "../preview.module.css"
import { Callout } from "../partials/callout"
import { ComponentPage } from "../partials/component-page"
import { Example } from "../partials/example"
import { PropTable } from "../partials/prop-table"

const INVOICES = ["Northwind", "Acme", "Globex", "Initech", "Umbrella"]

export function CarouselPage() {
	return (
		<ComponentPage
			title="Carousel"
			summary="A horizontal or vertical track the reader pages through. It is native CSS scroll-snap with controls on top, not a JS-driven slider."
			importPath="@/components/base/carousel"
			exports={["Carousel", "CarouselSlide", "CarouselControl", "CarouselDots", "useCarousel"]}
		>
			<Example
				id="carousel"
				title="Carousel"
				description="The browser already does momentum, touch, and rubber-banding better than JS can, and a scroll container is keyboard-scrollable and readable by assistive technology for free. Slide width is a CSS length, so a track can show one card or five."
				stacked
				code={`<Carousel showDots dotStyle="pill" label="Recent invoices">
  {invoices.map((name) => (
    <CarouselSlide key={name} size="16rem">
      <Card surface="bordered" title={name} />
    </CarouselSlide>
  ))}
</Carousel>`}
			>
				<Carousel showDots dotStyle="pill" label="Recent invoices">
					{INVOICES.map((name) => (
						<CarouselSlide key={name} size="16rem">
							<Card surface="bordered" title={name} description="Invoice due in 14 days.">
								<Text size="sm" type="secondary">
									Slide content.
								</Text>
							</Card>
						</CarouselSlide>
					))}
				</Carousel>
			</Example>

			<Example
				id="controls"
				title="Control placement"
				description="outside keeps the buttons clear of the content, which is right when slides have their own edges. overlay floats them over the track for full-bleed slides, where outside controls would push the track narrower than the viewport."
				stacked
				code={`<Carousel controls="overlay" label="Gallery">…</Carousel>`}
			>
				{/* Full-bleed slides: overlay controls float over the slide's edges. */}
				<Carousel controls="overlay" label="Gallery">
					{["One", "Two", "Three"].map((name) => (
						<CarouselSlide key={name}>
							<div className={styles.bleedSlide}>
								<Text size="lg" weight="semibold">{name}</Text>
							</div>
						</CarouselSlide>
					))}
				</Carousel>
			</Example>

			<Example
				id="sizes"
				title="Slide width"
				description="size is the width the slide takes in the track — a percentage for a fixed number per view, a length for a fixed card. Mixed widths are allowed; snapping follows whatever each slide occupies."
				stacked
				code={`<CarouselSlide size="50%">…</CarouselSlide>
<CarouselSlide size="18rem">…</CarouselSlide>`}
			>
				<Carousel label="Two per view">
					{["Half", "Half", "Half", "Half"].map((name, index) => (
						<CarouselSlide key={index} size="50%">
							<Card surface="bordered" title={`${name} ${index + 1}`}>
								<Text size="sm" type="secondary">
									Two slides fill the track.
								</Text>
							</Card>
						</CarouselSlide>
					))}
				</Carousel>
			</Example>

			<Example id="carousel-rule" title="The scroll is the source of truth" stacked>
				<Callout label="Rule">
					The carousel reads its position from the scroll rather than mirroring it in
					state. A mirror drifts the moment anything else moves the track — a focused
					control scrolled into view, a hash link, a keyboard, a trackpad fling — and
					then the dots disagree with what the reader can see.
				</Callout>
			</Example>

			<Example id="carousel-api" title="API">
				<PropTable owner="Carousel"
					rows={[
						{ name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which axis snaps." },
						{ name: "controls", type: '"outside" | "overlay" | "none"', default: '"outside"', description: "Where the previous/next buttons sit. none when you compose your own with CarouselControl." },
						{ name: "showDots", type: "boolean", default: "false", description: "Position indicators, clickable." },
						{ name: "dotStyle", type: '"dot" | "pill"', default: '"dot"', description: "pill stretches the active indicator instead of only recolouring it." },
						{ name: "label", type: "string", description: "Names the region for assistive technology. A carousel with no label is an unexplained scroll box." },
						{ name: "CarouselSlide size", type: "string", default: '"100%"', description: "Track width the slide occupies — 100%, 50%, 18rem." },
						{ name: "CarouselControl direction", type: '"previous" | "next"', description: "A single control, for composing your own layout with controls=\"none\"." },
						{ name: "CarouselDots", type: "component", description: "The indicators on their own, to place outside the track." },
						{ name: "useCarousel()", type: "hook", description: "Position, count, and the scroll helpers, for a fully custom control surface. Must be called inside a Carousel." },
						{ name: "strings", type: "Partial<CarouselStrings>", description: "Overrides this carousel's own copy — the region name, the two icon-only controls, and each pagination dot. It travels through the context, so a control placed with CarouselControl is named by the same override as one the root rendered." },
						{ name: "viewportClassName", type: "string", description: "Styles the scroll container rather than the outer frame — for a carousel that needs its own padding inside the clip." },
					]}
				/>
			</Example>
		</ComponentPage>
	)
}
