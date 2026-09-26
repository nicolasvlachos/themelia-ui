/** TypeScript is the API inventory. Preview metadata only selects an owner/path. */
import ts from 'typescript'
import { resolve } from 'node:path'

const unwrap = (node) => {
  while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node))) node = node.expression
  return node
}
const textOf = (node) => node && (ts.isStringLiteralLike(node) || ts.isIdentifier(node)) ? node.text : undefined
const property = (node, name) => node?.properties?.find(p => ts.isPropertyAssignment(p) && textOf(p.name) === name)?.initializer
const attr = (node, name) => {
  const value = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === name)?.initializer
  return value && ts.isJsxExpression(value) ? value.expression : value
}
const strings = (node) => ts.isArrayLiteralExpression(node ?? {}) ? node.elements.map(textOf) : textOf(node) ? [textOf(node)] : []

function createApiInspector(program) {
  const checker = program.getTypeChecker()
  const unalias = (symbol) => {
    const resolved = symbol?.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    return resolved?.declarations?.length ? resolved : undefined
  }
  function evaluate(node, seen = new Set()) {
    node = unwrap(node)
    if (!node || seen.has(node)) return { known: false }
    seen.add(node)
    if (ts.isStringLiteralLike(node)) return { known: true, value: node.text }
    if (ts.isNumericLiteral(node)) return { known: true, value: Number(node.text) }
    if (node.kind === ts.SyntaxKind.TrueKeyword) return { known: true, value: true }
    if (node.kind === ts.SyntaxKind.FalseKeyword) return { known: true, value: false }
    if (node.kind === ts.SyntaxKind.NullKeyword) return { known: true, value: null }
    if (ts.isPrefixUnaryExpression(node)) {
      const operand = evaluate(node.operand, seen)
      if ([ts.SyntaxKind.MinusToken, ts.SyntaxKind.PlusToken].includes(node.operator) && operand.known && typeof operand.value === 'number') return { known: true, value: node.operator === ts.SyntaxKind.MinusToken ? -operand.value : operand.value }
    }
    if (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) {
      const symbol = unalias(checker.getSymbolAtLocation(node))
      for (const declaration of symbol?.declarations ?? []) {
        if (ts.isVariableDeclaration(declaration) || ts.isPropertyAssignment(declaration) || ts.isEnumMember(declaration)) return evaluate(declaration.initializer, seen)
      }
    }
    return { known: false }
  }
  function moduleSymbols(importPath, containingFile) {
    const resolved = ts.resolveModuleName(importPath, containingFile, program.getCompilerOptions(), ts.sys).resolvedModule
    const file = resolved && program.getSourceFile(resolved.resolvedFileName)
    const symbol = file && checker.getSymbolAtLocation(file)
    return new Map(symbol ? checker.getExportsOfModule(symbol).map(s => [s.name, unalias(s)]) : [])
  }
  function scope(file, page) {
    const symbols = new Map()
    for (const statement of file.statements) {
      if (!ts.isImportDeclaration(statement)) continue
      const bindings = statement.importClause?.namedBindings
      if (bindings && ts.isNamedImports(bindings)) for (const specifier of bindings.elements) symbols.set(specifier.name.text, unalias(checker.getSymbolAtLocation(specifier.name)))
    }
    const importPath = textOf(attr(page, 'importPath'))
    if (importPath) for (const [name, symbol] of moduleSymbols(importPath, file.fileName)) {
      if (!symbols.has(name)) symbols.set(name, symbol)
    }
    symbols.containingFile = file.fileName
    return symbols
  }
  function inspect(symbols, target) {
    if (target.includes('#')) {
      const [module, member] = target.split('#')
      return inspect(moduleSymbols(module, symbols.containingFile ?? program.getRootFileNames()[0]), member)
    }
    const match = /^([\w$]+)(\(\)|\[(\d+)\])?(?:\.(.+))?$/.exec(target)
    if (!match) return { error: `invalid-target ${target}` }
    const [, owner, mode, argumentIndex, path] = match
    const symbol = symbols.get(owner)
    if (!symbol) return { error: `unknown-owner ${owner}` }
    if (!path && !mode) return { symbol }
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0]
    let type = symbol.flags & (ts.SymbolFlags.Interface | ts.SymbolFlags.TypeAlias)
      ? checker.getDeclaredTypeOfSymbol(symbol)
      : checker.getTypeOfSymbolAtLocation(symbol, declaration)
    const signature = checker.getSignaturesOfType(type, ts.SignatureKind.Call)[0]
    let parameter
    if (mode === '()') {
      if (!signature) return { error: `not-callable ${owner}` }
      type = checker.getReturnTypeOfSignature(signature)
    } else if (signature) {
      parameter = signature.parameters[Number(argumentIndex ?? 0)]
      if (!parameter) return { error: `missing-parameter ${target}` }
      type = checker.getTypeOfSymbolAtLocation(parameter, declaration)
    } else if (mode) return { error: `not-callable ${owner}` }
    let member
    for (const segment of path?.split('.') ?? []) {
      type = checker.getNonNullableType(type)
      member = checker.getPropertyOfType(type, segment)
      if (!member) return { error: `unknown-member ${target} (${segment})` }
      type = checker.getTypeOfSymbolAtLocation(member, member.valueDeclaration ?? declaration)
    }
    let initializer
    // Follow the implementation, including aliased exports and forwardRef/memo wrappers.
    const functions = []
    const visited = new Set()
    const findFunction = (node) => {
      if (!node || visited.has(node)) return
      visited.add(node)
      if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) functions.push(node)
      else if (ts.isVariableDeclaration(node)) findFunction(node.initializer)
      // memo/forwardRef own the first argument. Comparator and options callbacks
      // are separate functions and must never contribute component defaults.
      else if (ts.isCallExpression(node)) findFunction(node.arguments[0])
      else if (ts.isIdentifier(node)) for (const decl of unalias(checker.getSymbolAtLocation(node))?.declarations ?? []) if (decl !== node.parent) findFunction(decl)
    }
    if (mode !== '()') {
      for (const decl of symbol.declarations ?? []) findFunction(decl)
      for (const fn of functions) {
        const binding = fn.parameters[Number(argumentIndex ?? 0)]?.name
        if (binding && ts.isObjectBindingPattern(binding)) {
          const element = binding.elements.find(e => textOf(e.propertyName ?? e.name) === path)
          if (element?.initializer) initializer = element.initializer
        }
      }
    }
    return { symbol, member, initializer, value: evaluate(initializer) }
  }
  return { scope, inspect, evaluate }
}

/** Only actual PropTable JSX rows are inspected; example data and code strings are not docs. */
function readApiTables(program, paths) {
  const tables = []
  for (const path of paths) {
    const file = program.getSourceFile(path) ?? program.getSourceFile(resolve(path))
    if (!file) throw new Error(`Preview missing from TypeScript program: ${path}`)
    const visit = (node, page) => {
      if (ts.isJsxElement(node) && node.openingElement.tagName.getText(file) === 'ComponentPage') page = node.openingElement
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(file) === 'PropTable') {
        const rows = unwrap(attr(node, 'rows'))
        tables.push({ file, node, page, owner: textOf(attr(node, 'owner')), rows: rows && ts.isArrayLiteralExpression(rows) ? rows.elements.map(row => ({
          node: row, name: textOf(property(row, 'name')), api: strings(property(row, 'api')), defaultNode: property(row, 'default'),
        })) : null })
      }
      ts.forEachChild(node, child => visit(child, page))
    }
    visit(file)
  }
  return tables
}

function rowTargets(row, owner, symbols) {
  if (row.api.length) return row.api
  const parts = row.name?.split(/\s+\/\s+/) ?? []
  let currentOwner = owner
  return parts.map(part => {
    const qualified = /^(\w+)\s+([\w.]+)$/.exec(part)
    if (qualified) { currentOwner = qualified[1]; return `${currentOwner}.${qualified[2]}` }
    const symbolName = part.replace(/\(\)$/, '')
    if (symbols.has(symbolName)) return symbolName
    if (symbols.has(part.split('.')[0])) return part
    return currentOwner ? `${currentOwner}.${part}` : null
  })
}

export function verifyApiTables(program, paths, { cssTokens = new Set() } = {}) {
  const inspector = createApiInspector(program)
  const result = { failures: [], diagnostics: [], names: 0, defaults: 0, tables: 0 }
  for (const table of readApiTables(program, paths)) {
    result.tables++
    const { file, node, page, owner, rows } = table
    const location = `${file.fileName}:${file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1}`
    if (!page) { result.failures.push(`missing-page ${location}`); continue }
    if (!rows) { result.failures.push(`unresolved-rows ${location}: use a literal API row array`); continue }
    const symbols = inspector.scope(file, page)
    for (const row of rows) {
      if (!row.name) { result.failures.push(`missing-name ${location}`); continue }
      const targets = rowTargets(row, owner, symbols)
      const defaultValue = inspector.evaluate(row.defaultNode)
      const documentedDefault = defaultValue.known && typeof defaultValue.value === 'string' ? defaultValue.value : undefined
      if (row.defaultNode && documentedDefault === undefined) {
        result.diagnostics.push(`unsupported-default-expression ${location} ${row.name}: ${row.defaultNode.getText(file)} (documented default is not a statically resolvable string; name validation still applies)`)
      }
      const defaults = documentedDefault?.split(/\s+\/\s+/)
      for (const [index, target] of targets.entries()) {
        if (target?.startsWith('css:')) {
          const token = target.slice(4)
          const exists = token.endsWith('*') ? [...cssTokens].some(t => t.startsWith(token.slice(0, -1))) : cssTokens.has(token)
          if (!exists) result.failures.push(`unknown-token ${location} ${token}`)
          else result.names++
          if (documentedDefault !== undefined) result.diagnostics.push(`css-default ${location} ${token}: ${JSON.stringify(documentedDefault)} (token exists; its cascaded default needs CSS/runtime verification)`)
          continue
        }
        if (!target) { result.failures.push(`missing-owner ${location} ${row.name}: select a PropTable owner or row api target`); continue }
        const inspected = inspector.inspect(symbols, target)
        if (inspected.error) { result.failures.push(`${inspected.error} ${location}`); continue }
        result.names++
        if (documentedDefault === undefined) continue
        if (!inspected.value?.known) {
          result.diagnostics.push(`${inspected.initializer ? 'dynamic-default' : 'unresolved-default'} ${location} ${target}: ${JSON.stringify(documentedDefault)} (${inspected.initializer ? 'initializer is not a static literal' : 'no direct literal parameter initializer; delegated/provider defaults require runtime verification'})`)
          continue
        }
        const actual = inspected.value.value
        let documented = (defaults?.length === targets.length ? defaults[index] : documentedDefault).trim()
        if (documented.startsWith("'") && documented.endsWith("'")) documented = JSON.stringify(documented.slice(1, -1))
        let expected
        try { expected = JSON.parse(documented) } catch { expected = documented }
        if (actual !== expected) result.failures.push(`wrong-default ${location} ${target}: documented ${JSON.stringify(documentedDefault)}, source ${JSON.stringify(actual)}`)
        else result.defaults++
      }
    }
  }
  return result
}
