# Security

## Supported versions

| version | supported |
|---|---|
| 3.x | ✅ |
| 2.x | ❌ superseded by 3.0 |
| 1.x | ❌ superseded by 2.0 |
| 0.x | ❌ pre-release, superseded by 1.0 |

## Reporting

Report a suspected vulnerability privately, through GitHub's **Report a vulnerability**
button on the repository's Security tab. Please do not open a public issue first.

Include what you did, what happened, and which version you were on. A reply should come
within a week, and a fix or a documented mitigation within thirty days for anything that
reaches a consumer's users.

## Untrusted input

This is a presentation library: it renders what it is given, has no authentication, and
keeps no data of its own beyond the two preferences under
[Network and storage](#network-and-storage). The trust boundary is the application's.

Text goes through the typography components, which render it as text, and values go
through the primitives, which format them. Neither interprets markup: `Value` and its
relatives escape by construction, because React does. Passing `dangerouslySetInnerHTML` to
a component that accepts arbitrary children is your call and your sanitiser's job.

### Rich text

The editor and the renderer sit on opposite sides of the trust boundary, on purpose.

**`RichTextEditor` and every `RichTextEngine` hold what the writer typed, unsanitised.** A
paste can carry markup and attributes the writer never saw. An editor that quietly removed
part of a draft would be a worse failure, and would not make the content safe anyway: the
value travels to a server and comes back by another path.

**`RichText` is where sanitisation happens.** It renders stored HTML only through a fixed
allow-list, with no prop to widen or skip it: paragraphs, headings, lists, quotes, code,
inline marks and links, with `http`, `https`, `mailto` and `tel` the only link protocols.
Scripts, styles, images, embeds, SVG, comments, event handlers and `style` and `class`
attributes are removed.

So store what the editor gives you and render it through `RichText`. Rendering editor output
with your own `dangerouslySetInnerHTML` is the classic stored-XSS shape. Where your policy is
stricter than `RichText`'s display allow-list (allowed tags, embeds, who may author what),
sanitise at your own trust boundary before storage too: `RichText` is a rendering safeguard,
not server-side validation.

Load only HTML you trust into an editor. The default TipTap engine parses its value, and the
HTML passed to the editor handle's `setHTML` and `insertHTML`, into its own document model,
keeping only what that model supports. `createExecCommandEngine`, and a custom engine without
`mount`, write HTML into the live page, where an inline event handler in it runs.

`createExecCommandEngine` is kept for existing integrations and is **experimental**: it edits
through `document.execCommand`, which is deprecated and has no standard replacement.
`RichTextEditor`, its `RichTextEditorHandle` and the `RichTextEngine` contract are stable.

## Network and storage

The package makes no network requests of its own except in `features/map`:

- Map tiles load from `tile.openstreetmap.org` unless a `MapTileLayer` sets `url`.
- `PlaceAutocomplete`, `MapSearchControl` and `usePlaceSearch` send the typed query to the
  public Photon geocoder at `photon.komoot.io` unless `searchUrl` points elsewhere.

It stores two interface preferences in `localStorage`: the sidebar's expanded state
(`SidebarProvider`'s `persist`, on by default) and a data table's column visibility when
`storageKey` is set.

## Dependencies

Runtime dependencies are few, and the optional peers are optional: a module that does not
need `recharts` never loads it.
