import { Card } from "themelia-ui/base/cards"
import { Carousel, CarouselSlide } from "themelia-ui/base/carousel"
import { Text } from "themelia-ui/base/typography"

export default function Sizes() {
	return (
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
	)
}
