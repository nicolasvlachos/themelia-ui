# Forms

The kit does not own your form state. It defines a one-method interface that any form library
can satisfy, and binds its fields to whatever satisfies it.

```ts fragment — shape only, not a program
interface FormControl<TValues> {
  useField<TValue>(name: string): FieldState<TValue>
}
```

That is the whole contract. `FieldState` is `{ value, setValue, onBlur?, error?, disabled? }`
— everything past the first two is optional.

## Plain React state

```tsx compile
import { FormField } from "themelia-ui/base/forms"
import { Input } from "themelia-ui/base/text-inputs"
import { type FormControl, useFormFieldBinding, useStateFormControl } from "themelia-ui/forms"

type Invite = { email: string; workspace: string }

function BoundInput({ name, label, control }: { name: keyof Invite; label: string; control: FormControl<Invite> }) {
  const field = useFormFieldBinding<string, Invite>({ name, control })
  return (
    <FormField label={label} error={field.error}>
      <Input
        value={field.value ?? ""}
        onChange={(event) => field.onValueChange(event.target.value)}
        onBlur={field.onBlur}
      />
    </FormField>
  )
}

/* The control is a hook: create it inside the component that owns the form. */
export function InviteForm() {
  const control = useStateFormControl<Invite>({ email: "", workspace: "acme-corp" })
  return (
    <form>
      <BoundInput name="email" label="Email" control={control} />
      <BoundInput name="workspace" label="Workspace" control={control} />
    </form>
  )
}
```

`useStateFormControl` also exposes `values` and `reset`, which a library-backed control owns
itself.

## React Hook Form

```tsx compile
import { useForm } from "react-hook-form"
import { rhfFormControl } from "themelia-ui/forms-rhf"

export function useInviteControl() {
  const form = useForm({ defaultValues: { email: "" } })
  return { form, control: rhfFormControl(form.control) }
}
```

It delegates to `useController`, so registration, validation and dirty tracking keep working;
it adds a shape, not a second source of truth.

The adapter lives behind its own subpath so `themelia-ui/forms` stays dependency-free, and a
consumer on plain state never resolves react-hook-form.

## Field chrome

`FormField` renders exactly **one** supporting line, resolved as `error || helperText ||
hint`. They replace each other rather than stacking, so a field never grows or shifts as
validation state changes. It also owns the wiring: it associates the label, points
`aria-describedby` at the supporting line, and sets `aria-invalid` on the control when there
is an error, without overriding any of these that the caller set explicitly. Errors are
announced politely (`role="status"`), so validation firing on each keystroke does not
interrupt typing.

`FieldGroup` covers several controls sharing one label and one supporting line — a date
range, a name split in two.

## Generated forms

When the fields come from a schema at runtime, use `features/schema-form`. When they are
known at build time, write them: a schema adds indirection that only pays off when the shape
is genuinely dynamic.

Preview routes with recipes: `/form-binding`, `/form-field`, `/form-workflow`, `/schema-form`
(search them with the finder's `--route=` option).
