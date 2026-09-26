# 0001 — One package, two profiles

**Status:** accepted

## Decision

`themelia-ui` stays one package with one version. It carries two profiles — **general**
and **admin** — distinguished by manifest metadata and enforced dependency direction, not by
separate npm packages.

## Why

The alternative, splitting core and admin into independently versioned packages, buys
isolation and costs a version matrix. Every admin release would pin a core range, every core
change would need a compatibility sweep, and a consumer on both would hit the diamond
problem the first time the ranges disagreed.

The isolation it buys is available more cheaply. An exact subpath per family already means a
consumer importing nothing from `admin/` ships nothing from `admin/`, and the layer gate
already fails a general family that imports an admin one. Two packages would enforce the same
rule with a release process instead of a check that runs in two seconds.

## Consequences

- The direction is one-way: admin may build on general, never the reverse. `verify architecture`
  fails a `profile-edge` violation.
- The split today is 92 general families to 2 admin. The ratio is not the point — the
  direction is.
- A consumer installs once. Which families belong to which profile is generated into
  `docs/generated/profiles.md`.
- The root export stays free of optional peers, so `import "themelia-ui"` never drags in
  Leaflet or Recharts.

## What would justify revisiting

- Admin families growing to a size where their release cadence genuinely diverges from
  general — not merely differs, but is blocked by it.
- A consumer class that must audit or licence the admin surface separately.
- Evidence that the peer-free root claim has stopped holding in practice.
