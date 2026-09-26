import { Card } from "themelia-ui/base/cards"
import { Carousel, CarouselSlide } from "themelia-ui/base/carousel"
import { Text } from "themelia-ui/base/typography"

const INVOICES = ["Northwind", "Acme", "Globex", "Initech", "Umbrella"]

export default function CarouselExample() {
	return (
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
	)
}
