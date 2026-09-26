import { Carousel, CarouselSlide } from "themelia-ui/base/carousel"
import { Stack } from "themelia-ui/base/structure"
import { Text } from "themelia-ui/base/typography"

import styles from "./controls.module.css"

export default function Controls() {
	return (
		// Full-bleed slides: overlay controls float over the slide's edges.
		<Carousel controls="overlay" label="Gallery">
			{["One", "Two", "Three"].map((name) => (
				<CarouselSlide key={name}>
					<Stack align="center" justify="center" className={styles.slide}>
						<Text size="lg" weight="semibold">{name}</Text>
					</Stack>
				</CarouselSlide>
			))}
		</Carousel>
	)
}
