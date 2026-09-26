/**
 * Deterministic image fixtures: three solid 96px PNGs as real `File` objects, identical on
 * every run for the visual suite.
 */
const SWATCHES: Array<[name: string, base64: string]> = [
	["cover.png", "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAj0lEQVR42u3QMQ0AAAgDsOlADjrwrwMHnFxNqqCpaQ5RIEiQIEGCBAkShCBBggQJEiRIEIIECRIkSJAgQQgSJEiQIEGCBAlCkCBBggQJEiQIQYIECRIkSJAgBAkSJEiQIEGCBCFIkCBBggQJEoQgQYIECRIkSBCCBAkSJEiQIEGCECRIkCBBggQJQpAgQX8W+FrheNbQSb0AAAAASUVORK5CYII="],
	["detail.png", "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAjklEQVR42u3QIREAAAgEsO+fB40iGA2QqN0twVLTHKJAkCBBggQJEiQIQYIECRIkSJAgBAkSJEiQIEGCECRIkCBBggQJEoQgQYIECRIkSBCCBAkSJEiQIEEIEiRIkCBBggQJQpAgQYIECRIkCEGCBAkSJEiQIAQJEiRIkCBBggQhSJAgQYIECRKEIEGC/ixJ6JyibmqDhwAAAABJRU5ErkJggg=="],
	["packaging.png", "iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAjklEQVR42u3QMQ0AAAgDsMlGBCKQigNOriZV0FQPhygQJEiQIEGCBAlCkCBBggQJEiQIQYIECRIkSJAgBAkSJEiQIEGCBCFIkCBBggQJEoQgQYIECRIkSBCCBAkSJEiQIEGCECRIkCBBggQJQpAgQYIECRIkCEGCBAkSJEiQIEEIEiRIkCBBggQhSJCgPwtdxxN2y2mR6gAAAABJRU5ErkJggg=="],
]

function decode(base64: string) {
	const binary = atob(base64)
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
	return bytes
}

/** Three images, stable across renders and across runs. */
export const SAMPLE_IMAGES: File[] = SWATCHES.map(
	([name, base64]) => new File([decode(base64)], name, { type: "image/png" }),
)

/** A stored image, for the `previewUrl` case — a data URI, so no network and no flake. */
export const SAMPLE_IMAGE_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAIAAABt+uBvAAAAj0lEQVR42u3QMQ0AAAgDsOlADjrwrwMHnFxNqqCpaQ5RIEiQIEGCBAkShCBBggQJEiRIEIIECRIkSJAgQQgSJEiQIEGCBAlCkCBBggQJEiQIQYIECRIkSJAgBAkSJEiQIEGCBCFIkCBBggQJEoQgQYIECRIkSBCCBAkSJEiQIEGCECRIkCBBggQJQpAgQX8W+FrheNbQSb0AAAAASUVORK5CYII="
