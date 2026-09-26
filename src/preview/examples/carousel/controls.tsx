import { Carousel, CarouselSlide } from "themelia-ui/base/carousel"
import { Text } from "themelia-ui/base/typography"

import styles from "../../preview.module.css"

export default function Controls() {
	return (
		// Full-bleed slides: overlay controls float over the slide's edges.
		<Carousel controls="overlay" label="Gallery">
			{["One", "Two", "Three"].map((name) => (
				<CarouselSlide key={name}>
					<div className={styles.bleedSlide}>
						<Text size="lg" weight="semibold">{name}</Text>
					</div>
				</CarouselSlide>
			))}
		</Carousel>
	)
}
