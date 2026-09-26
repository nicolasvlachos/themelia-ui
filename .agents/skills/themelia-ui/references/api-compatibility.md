# API compatibility

Within a major version, exact package subpaths, exported names, callable signatures, and
exported props/type members are compatibility surfaces. Public global theme tokens, documented
`data-slot` and BEM hooks, and the `strings` contracts are also consumer contracts.

## Change policy

| change | compatibility |
| --- | --- |
| new subpath, export, or optional prop | additive |
| optional prop becomes required | breaking |
| export, prop, or subpath is removed | breaking |
| prop type is narrowed | breaking |
| a documented default changes | behavioural change; release notes required |
| component token or hashed CSS Module name changes | internal unless documented as an extension point |

A deprecated API introduced during a stable major remains available for that major with a
named replacement and migration instructions. It is removed only in the next major unless
security or correctness makes retaining it unsafe.

A removal, a newly required member or an incompatible type change ships with a migration
record: the migration reference (`node_modules/themelia-ui/docs/generated/migration.md`) names each one with its
replacement.

## What consumers should depend on

Prefer the ready-made component, documented parts and hooks, the global theme contract,
`data-slot`, BEM hooks, and the state attributes the primitives set (`data-open`,
`data-checked`, `data-disabled`, `data-highlighted`, `data-popup-open`). Use `data-state`
only where a module reference documents it; few modules set it. Do not depend on source
paths, internal aliases, hashed CSS Module classes, undocumented DOM nesting, or
component-owned custom properties.

The generated [module references](components/INDEX.md) are the exact API
inventory for the package version you installed. The changelog (`node_modules/themelia-ui/CHANGELOG.md`) records
migrations and behavioural changes between versions.
