# Design follow-ups

These are bounded product decisions, not missing implementations. A future change should
select one row, name a consumer workflow, and meet its criteria before changing a published
API. Existing imports and behavior remain the compatibility baseline.

The concrete fixes in these areas are already implemented and independently verified:

- Uploads, search and data views: touch edit affordances, working picker and removal
  controls, form error feedback, pending-search cancellation, real demo paging, and truthful
  result counts.
- Layout: responsive admin and auth compositions, shell scroll and containment, keyboard
  and router navigation, and media-library fetch recovery.
- Features: keyboard actions, pending work, record changes and recovery in calendar,
  Kanban, comments, activities, chat and resource assignment.
- API compatibility: the snapshot covers type exports, re-exports included.

The rows below cover broader shape, layout, and workflow decisions; they are not evidence
that any of these fixes remain undone. The admin visual-fidelity row concerns matching a
particular external reference, and none of the work above waits on it.

| Decision | Concrete acceptance criteria | Input needed before implementation |
| --- | --- | --- |
| Pill radius and image-upload overlays | Compare the current treatment with one proposed treatment at 390px and 1440px in both themes; text meets 4.5:1, icons/focus remain visible, and selection/remove actions work with keyboard and touch. Use semantic tokens rather than changing palette ramps. | Which shape and overlay treatment serves the intended product? |
| Admin-shell visual fidelity | Select one of the three existing layouts and one reference screen. Record exact differences in navigation hierarchy, spacing, content width, and mobile collapse behavior. Verify no horizontal overflow and keyboard access to navigation/actions. | A specific reference screen and target layout, rather than a general comparison-kit preference. |
| Activities, analytics, and catalogue organization | Demonstrate one representative feed/dashboard/navigation task with populated, empty, and loading states. The primary action and grouping are explicit at desktop and mobile widths; example content uses current public components. | The end user's task, preferred grouping, and representative data. |
| Data-view/search and table-example density | Use the same records in list and table views, place search and filters once, preserve controlled filter/selection state across view changes, and keep actions usable at compact/default/comfortable density. | Whether the requested change concerns the preview example or a reusable package contract. |
| Pagination expansion | Implement only a named need (page size, direct page jump, or cursor navigation). Show first/last/empty/loading cases, a controlled callback contract, keyboard labels, narrow-screen behavior, and router-link composition. Existing numberless mode stays supported. | The pagination model and consumer data/router contract. |
| ContentBlock ownership | Show a real composition that the current title/description/actions/content slots cannot express. Compare a slots-only recipe with a proposed public split; require a migration path and packed-import coverage if exports change. | A concrete limitation experienced by a consumer. |
| Theme Tweaker scope | The corrected live provider recipe is the baseline. Any larger redesign must demonstrate editing, reset, export/persistence, invalid input recovery, scoped CSS and provider updates, and an accessible mobile editor. | Which workflow the existing editor cannot complete, and who should own persistence/configuration. |
| Map redesign | Demonstrate one map workflow with a loading/error/empty state, reachable controls, accessible alternative content, optional-peer containment, and a narrow layout. Avoid snapshot assertions against live tiles. | The domain task and required map interactions. |
| Color-format removal | Inventory consuming workflows and provide a replacement/migration for each removed format. No removal based solely on a preference for a simpler example. | Evidence that a supported format should leave the public API. |

## Existing platform boundaries

- RichTextEditor now defaults to TipTap with StarterKit and atomic mentions. Its
  editor, comments and activities imports require the three TipTap peers. The legacy
  `createExecCommandEngine` export remains experimental. The default family is stable
  after direct editing/history/selection, source, paste, mention and lifecycle coverage
  and focused Chromium, Firefox and WebKit validation. Custom schemas remain caller-owned.
- `Separator` belongs to a client family. Formatted primitives consume provider hooks.
  A server-only variant would be a separate compatibility/design decision, not a reason
  to remove current behavior or claim the old zero-client-JavaScript aspiration is met.
- Automated text contrast covers solid and composited backgrounds, with a targeted
  calendar test for its known range pseudo-element. It does not certify arbitrary
  gradients, background images, consumer palettes, or every interaction state.
- Nothing in the repository stores a release verdict. A release needs a clean committed tree
  that passes `npm run verify:release` on macOS, and `npm publish` runs that gate again
  through `prepublishOnly`.
