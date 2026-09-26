import type { MediaLibraryItem } from "themelia-ui/features/media-library"

/* Tints rather than real images: the docs site has to render the same offline, and a grid
 * of broken thumbnails would be a worse demonstration than a grid of coloured tiles. */
export const ASSETS: MediaLibraryItem[] = [
	{ id: "m1", name: "marlow-hall-exterior.jpg", type: "image", alt: "Marlow Hall exterior at sunset", size: 2_400_000, width: 2400, height: 1600, collection: "venues", tags: ["exterior", "hero"], public: true, uploadedAt: "2026-08-02", usageCount: 4, tint: "oklch(0.72 0.10 240)" },
	{ id: "m2", name: "granary-interior.jpg", type: "image", size: 1_800_000, width: 1920, height: 1280, collection: "venues", tags: ["interior"], public: true, uploadedAt: "2026-08-11", usageCount: 2, tint: "oklch(0.75 0.09 120)" },
	{ id: "m3", name: "riverside-walkthrough.mp4", type: "video", size: 48_200_000, duration: "2:14", collection: "venues", tags: ["tour"], public: false, uploadedAt: "2026-07-22", usageCount: 1 },
	{ id: "m4", name: "floorplan-marlow.pdf", type: "file", size: 320_000, collection: "documents", tags: ["floorplan"], public: false, uploadedAt: "2026-06-30", usageCount: 6 },
	{ id: "m5", name: "granary-terrace.jpg", type: "image", size: 2_100_000, width: 2048, height: 1365, collection: "venues", tags: ["exterior"], public: true, uploadedAt: "2026-09-04", usageCount: 0, tint: "oklch(0.78 0.11 60)" },
	{ id: "m6", name: "catering-menu.pdf", type: "file", size: 145_000, collection: "documents", tags: ["menu"], public: true, uploadedAt: "2026-09-14", usageCount: 3 },
]

export const COLLECTIONS = [
	{ value: "venues", label: "Venues" },
	{ value: "documents", label: "Documents" },
]
