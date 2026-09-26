# 0001 — One package, two profiles

**Status:** accepted

## Decision

`themelia-ui` stays one package with one version. It carries two profiles, **general** and
**admin**, distinguished by manifest metadata and enforced dependency direction rather than
by separate npm packages.

## Why

The alternative, splitting core and admin into independently versioned packages, buys
isolation and costs a version matrix. Every admin release would pin a core range, every core
change would need a compatibility sweep, and a consumer on both would hit the diamond
problem the first time the ranges disagreed.

The isolation is available more cheaply. An exact subpath per module already means a
consumer importing nothing from `admin/` ships nothing from `admin/`, and the architecture
check already fails a general module that imports an admin one. Two packages would enforce
the same rule with a release process instead of a local check.

## Consequences

- The direction is one-way: admin may build on general, never the reverse.
  `verify architecture` fails a `profile-edge` violation.
- Almost every module is general. The ratio is not the point; the direction is.
  `docs/generated/profiles.md` lists which module belongs to which profile.
- A consumer installs once.
- The root export stays free of optional peers, so `import "themelia-ui"` never drags in
  Leaflet or Recharts.

## What would justify revisiting

- Admin modules growing to a size where their release cadence genuinely diverges from
  general: not merely differs, but is blocked by it.
- A consumer class that must audit or licence the admin surface separately.
- Evidence that the peer-free root no longer holds in practice.
