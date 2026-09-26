import { resolve } from 'node:path'
import ts from 'typescript'

import { documentationFor } from './api-documentation.mjs'

import { signaturesIn } from './api-signatures.mjs'

/**
 * Resolve public exports with the compiler: text matching misses `export type`, imported
 * aliases, type-only stars and cycles, and would leak private helpers through star barrels.
 */
export function apiExportsFor(files, { documentation = false } = {}) {
  const program = ts.createProgram(files.map((file) => resolve(file)), {
    noEmit: true,
    noLib: true,
    types: [],
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
  })
  const checker = program.getTypeChecker()
  const records = new Map()

  function recordFor(symbol) {
    for (const declaration of symbol.declarations ?? []) {
      const source = declaration.getSourceFile()
      if (!records.has(source.fileName)) {
        records.set(source.fileName, signaturesIn(source.fileName, source.text))
      }
      const name = declaration.name?.text ?? symbol.name
      const record = records.get(source.fileName).get(name)
      if (record) {
        if (!documentation) return record
        return {
          ...record,
          documentation: documentationFor(declaration),
          memberDocumentation: Object.fromEntries((declaration.members ?? []).filter((member) => member.name).map((member) => [member.name.getText(source).replace(/^['"]|['"]$/g, ''), documentationFor(member)])),
        }
      }
    }
    return null
  }

  return (file) => {
    const source = program.getSourceFile(resolve(file))
    if (!source) throw new Error(`API entrypoint is missing: ${file}`)
    const module = source && checker.getSymbolAtLocation(source)
    // A side-effect-only stylesheet entry legitimately emits an empty declaration.
    if (!module) return []
    return checker.getExportsOfModule(module).map((symbol) => {
      const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
      const typeOnly = (symbol.declarations ?? []).some((node) =>
        ts.isExportSpecifier(node) && (node.isTypeOnly || node.parent.parent.isTypeOnly),
      )
      return [symbol.name, recordFor(resolved) ?? { kind: typeOnly ? 'type' : 'value' }]
    })
  }
}
