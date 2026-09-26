import ts from 'typescript'

/** Curated decisions augment generated exports; they never define public API. */
export function validateGuidance(guidance, records) {
  const failures = []
  for (const [family, entries] of Object.entries(guidance)) {
    const record = records.find((record) => record.id === family)
    if (!record) { failures.push(`unknown family ${family}`); continue }
    for (const [symbol, entry] of Object.entries(entries)) {
      const allowed = new Set(['chooseWhen', 'avoidWhen', 'composition', 'capabilities', 'alternatives'])
      for (const key of Object.keys(entry)) {
        if (!allowed.has(key)) failures.push(`${symbol}: ${key} is generated or unsupported guidance`)
      }
      if (!Array.isArray(entry.alternatives) || entry.alternatives.some((value) => typeof value !== 'string')) failures.push(`${symbol}: alternatives must be component names`)
      if (!record.components.includes(symbol)) failures.push(`${family}: unknown component ${symbol}`)
      for (const key of ['chooseWhen', 'avoidWhen', 'composition']) {
        if (typeof entry[key] !== 'string' || !entry[key].trim()) failures.push(`${symbol}: missing ${key}`)
      }
      if (!Array.isArray(entry.capabilities) || !entry.capabilities.length || entry.capabilities.some((value) => typeof value !== 'string' || !value.trim())) failures.push(`${symbol}: missing capabilities`)
      for (const alternative of Array.isArray(entry.alternatives) ? entry.alternatives : []) {
        if (!records.some((record) => record.components.includes(alternative))) failures.push(`${symbol}: unknown alternative ${alternative}`)
      }
    }
  }
  return failures
}

/** Resolve aliases from the snippet first, then its preview imports. Ignore prose/string literals. */
export function recipeFamilies(code, page, records) {
  const bindings = new Map()
  for (const text of [page, code]) {
    const source = ts.createSourceFile('recipe.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const node of source.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue
      const path = node.moduleSpecifier.text
      const record = records.find((record) => path === record.import || path === `@/components/${record.id}`)
      const clause = node.importClause?.namedBindings
      if (!clause || !ts.isNamedImports(clause)) continue
      for (const element of clause.elements) {
        const imported = element.propertyName?.text ?? element.name.text
        // Preview-only aggregate barrels are not consumer entrypoints. Resolve their
        // named exports to the unique public owner, preserving aliases.
        const candidates = path.startsWith('@/') ? records.filter((record) => record.symbols.includes(imported)) : []
        bindings.set(element.name.text, record?.symbols.includes(imported) ? record.id : candidates.length === 1 ? candidates[0].id : null)
      }
    }
  }
  const found = new Set()
  const source = ts.createSourceFile('recipe.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  function visit(node) {
    if (ts.isImportDeclaration(node)) return // An unused import is not a recipe attribution.
    if (ts.isIdentifier(node)) {
      const binding = bindings.get(node.text)
      if (binding) found.add(binding)
      else if (!bindings.has(node.text)) {
        const owners = records.filter((record) => record.symbols.includes(node.text))
        if (owners.length === 1) found.add(owners[0].id)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return [...found].sort()
}
