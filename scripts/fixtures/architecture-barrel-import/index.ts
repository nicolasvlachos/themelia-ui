/*
 * A family that reaches a layer through its bare barrel. `verify-architecture-manifest.test.mjs`
 * points a copy of the manifest at this file and expects the `barrel-import` rule to fire.
 * Never imported; not part of the package.
 */
export { SideNav } from "@/components/layout"
