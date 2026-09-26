export function Box({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				padding: "var(--space-md) var(--space-lg)",
				borderRadius: "var(--radius-sm)",
				background: "var(--muted)",
				fontSize: "var(--text-sm)",
			}}
		>
			{children}
		</div>
	)
}
