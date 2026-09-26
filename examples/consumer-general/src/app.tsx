/*
 * A general-profile consumer, built the way the documentation says to build one.
 *
 * Every import is an exact published subpath and every family brings its own stylesheet.
 * Nothing here reaches into `src/`, nothing imports `style.css`, and nothing installs an
 * optional peer — which is what makes this a test of the package rather than of the
 * repository. `verify:reference-consumers` installs it from a packed tarball and builds it.
 *
 * The composition is deliberately cross-cutting. Smoke snippets import one family at a
 * time and prove resolution; what they cannot pressure is a provider nested inside another
 * provider, an overlay rendered through a portal out of a scoped subtree, or a controlled
 * form whose values three components read at once.
 */
import { useMemo, useState } from "react"

import { Button } from "themelia-ui/base/buttons"
import { FormField } from "themelia-ui/base/forms"
import { Popover, PopoverContent, PopoverTrigger } from "themelia-ui/base/popover"
import { Stack } from "themelia-ui/base/structure"
import { Input } from "themelia-ui/base/text-inputs"
import { Heading, Text } from "themelia-ui/base/typography"
import { Tab, TabList, TabPanel, Tabs } from "themelia-ui/base/navigation"
import { GlobalSearch } from "themelia-ui/features/global-search"
import { ActionDialog, useOverlayVisibility } from "themelia-ui/features/overlays"
import { useFormFieldBinding, useStateFormControl } from "themelia-ui/forms"
import { StackedLayout } from "themelia-ui/layout/app-shell"
import { SideNav } from "themelia-ui/layout/navigation"
import { Page, PageHeader } from "themelia-ui/layout/page"
import { UIPortalHost, UIRoot, UIScope } from "themelia-ui/ui-provider"

import "./app.css"

const NAV = [
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", href: "/" },
      { id: "activity", label: "Activity", href: "/activity" },
    ],
  },
]

const RESULTS = [
  { id: "1", group: "pages" as const, title: "Overview", href: "/" },
  { id: "2", group: "people" as const, title: "Ada Lovelace", href: "/people/ada" },
]

/**
 * A controlled form through the dependency-free contract.
 *
 * `themelia-ui/forms` is the seam; the react-hook-form adapter lives behind its own
 * subpath, so this consumer resolves no optional peer at all. The admin example takes the
 * other branch, and the two together are what prove the seam is real.
 */
function InviteForm({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [errors, setErrors] = useState<{ email?: string }>({})
  const control = useStateFormControl({ email: "" }, { errors })
  const email = useFormFieldBinding<string>({ name: "email", control })

  return (
    <form
      id="invite-form"
      onSubmit={(event) => {
        event.preventDefault()
        if (!email.value.includes("@")) {
          setErrors({ email: "That is not an email address." })
          return
        }
        setErrors({})
        onSubmit(email.value)
      }}
    >
      <FormField label="Email" error={email.error}>
        <Input
          value={email.value}
          onChange={(event) => email.onValueChange(event.target.value)}
          onBlur={email.onBlur}
        />
      </FormField>
    </form>
  )
}

/**
 * A portal host inside a scoped subtree.
 *
 * `UIScope` sets its tokens on an element; a portal escapes that element by definition, so
 * without a host inside the scope the popover would render against the root's tokens. This
 * is the composition that most often goes wrong and that a per-family smoke test cannot see.
 */
function ScopedPanel() {
  return (
    <UIScope config={{ density: "compact" }}>
      <UIPortalHost>
        <Stack gap="sm" className="workspace">
          <Text size="xs" type="secondary">
            This panel is compact; the page around it is not.
          </Text>
          <Popover>
            <PopoverTrigger render={<Button buttonStyle="outline">Open in scope</Button>} />
            <PopoverContent>
              <Text size="xs">Rendered through a portal, still inside the compact scope.</Text>
            </PopoverContent>
          </Popover>
        </Stack>
      </UIPortalHost>
    </UIScope>
  )
}

export function App() {
  const [query, setQuery] = useState("")
  const [invited, setInvited] = useState<string[]>([])
  const dialog = useOverlayVisibility()

  const results = useMemo(
    () => RESULTS.filter((r) => r.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <UIRoot config={{ formatting: { locale: "en-GB" } }}>
      <StackedLayout header={<GlobalSearch query={query} onQueryChange={setQuery} results={results} />}>
        <SideNav groups={NAV} currentPath="/" />
        <Page>
          <PageHeader
            title="Overview"
            actions={<Button onClick={dialog.show}>Invite someone</Button>}
          />

          <Stack gap="lg" className="consumer-override">
            <ScopedPanel />

            <section>
              <Heading level={2}>Invited</Heading>
              {invited.length === 0 ? (
                <Text type="secondary">Nobody yet.</Text>
              ) : (
                <Stack gap="2xs">
                  {invited.map((email) => (
                    <Text key={email}>{email}</Text>
                  ))}
                </Stack>
              )}
            </section>

            <Tabs defaultValue="overview">
              <TabList label="Workspace sections" variant="enclosed" edgeFade>
                <Tab value="overview">Overview</Tab>
                <Tab value="activity">Activity</Tab>
                <Tab value="settings">Settings</Tab>
              </TabList>
              <TabPanel value="overview"><Text>Workspace overview.</Text></TabPanel>
              <TabPanel value="activity"><Text>Recent workspace activity.</Text></TabPanel>
              <TabPanel value="settings"><Text>Workspace settings.</Text></TabPanel>
            </Tabs>
          </Stack>
        </Page>
      </StackedLayout>

      <ActionDialog
        {...dialog.overlayProps}
        title="Invite someone"
        description="They will receive an email."
        formId="invite-form"
      >
        <InviteForm
          onSubmit={(email) => {
            setInvited((prev) => [...prev, email])
            dialog.hide()
          }}
        />
      </ActionDialog>
    </UIRoot>
  )
}
