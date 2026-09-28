import { useEffect, useRef, useState, type FormEvent } from "react"

import { Button, LoaderButton } from "themelia-ui/base/buttons"
import { Checkbox } from "themelia-ui/base/choice-inputs"
import { Alert, AlertDescription, AlertTitle } from "themelia-ui/base/feedback"
import { FormField } from "themelia-ui/base/forms"
import { Input, PasswordInput } from "themelia-ui/base/text-inputs"
import { Stack } from "themelia-ui/base/structure"

/* Local demo state belongs to the consumer. The layout components only receive slots. */
export function SignInDemo({ showFailureControl = false }: { showFailureControl?: boolean }) {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [simulateError, setSimulateError] = useState(false)
	const [state, setState] = useState<"idle" | "submitting" | "error" | "success">("idle")
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
	const emailRef = useRef<HTMLInputElement>(null)
	const passwordRef = useRef<HTMLInputElement>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pending = state === "submitting"

	useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (pending || state === "success") return
		const nextErrors = {
			email: /^\S+@\S+\.\S+$/.test(email.trim()) ? undefined : "Enter an email address, such as jane@example.com.",
			password: password.length >= 8 ? undefined : "Use at least 8 characters for this demo.",
		}
		setErrors(nextErrors)
		if (nextErrors.email || nextErrors.password) {
			setState("idle")
			;(nextErrors.email ? emailRef : passwordRef).current?.focus()
			return
		}
		setState("submitting")
		timer.current = setTimeout(() => {
			setState(simulateError ? "error" : "success")
			timer.current = null
		}, 700)
	}

	return (
		<form noValidate aria-busy={pending || undefined} onSubmit={submit}>
			<Stack>
				{state === "error" && (
					<Alert tone="destructive">
						<AlertTitle>Unable to sign in</AlertTitle>
						<AlertDescription>The demo connection failed. Turn off the connection error below and try again. Your details are still here.</AlertDescription>
					</Alert>
				)}
				{state === "success" && (
					<Alert tone="success">
						<AlertTitle>Signed in</AlertTitle>
						<AlertDescription>The demo is complete. No account was created.</AlertDescription>
					</Alert>
				)}
				<FormField label="Email" required error={errors.email}>
					<Input
						ref={emailRef}
						type="email"
						autoComplete="username"
						placeholder="jane@example.com"
						value={email}
						readOnly={pending || state === "success"}
						onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })) }}
					/>
				</FormField>
				<FormField label="Password" required error={errors.password} hint="Use any 8 characters for this demo.">
					<PasswordInput
						ref={passwordRef}
						autoComplete="current-password"
						value={password}
						readOnly={pending || state === "success"}
						onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })) }}
					/>
				</FormField>
				{showFailureControl && (
					<Checkbox
						label="Simulate a connection error"
						checked={simulateError}
						disabled={pending || state === "success"}
						onChange={(event) => setSimulateError(event.target.checked)}
					/>
				)}
				{state === "success" ? (
					<Button fullWidth tone="neutral" appearance="outline" onClick={() => {
						setState("idle")
						setPassword("")
						emailRef.current?.focus()
					}}>Try again</Button>
				) : (
					<LoaderButton type="submit" fullWidth loading={pending}>Sign in</LoaderButton>
				)}
			</Stack>
		</form>
	)
}
