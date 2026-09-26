import type { UploadItem } from "themelia-ui/base/upload"

export const QUEUE: UploadItem[] = [
	{ id: "1", name: "report.pdf", size: 234_400, status: "uploading", progress: 62 },
	{ id: "2", name: "photo.jpg", size: 1_100_000, status: "done" },
	{ id: "3", name: "big.zip", size: 85_800_000, status: "error", error: "Larger than 5 MB." },
]
