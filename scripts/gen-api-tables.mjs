/*
 * Writes src/preview/generated/api-tables.json, the data behind the documentation site's API
 * tables. Every public name of the package is read from the declarations in src/ with the
 * TypeScript checker, so a table cannot say what the code does not; the file keeps the ones
 * a page's `<PropTable owner | owners | symbols>` names, and every entry their `ref`s reach.
 * A page naming something the package does not declare fails the generator, and with it
 * `verify docs-freshness`, instead of the page. A table with `rows` reads nothing from here.
 *
 *   symbols[key]   one entry per public declaration, keyed by its exported name. A name that
 *                  two modules export as different declarations is keyed `<module>#<Name>`
 *                  instead, with the manifest id of the module that declares it
 *                  (`base/action-menu#ActionDefinition`), and the bare name is absent: a page
 *                  must say which one it means. A re-export is the same declaration, one entry,
 *                  whose `modules` lists every module exporting it, the declaring one first.
 *   component      `props`, the members the kit declares, and `extends`, where the rest come
 *                  from (`span props`, `Base UI Menu.Popup props`). Members inherited from
 *                  React, the DOM, Base UI or another package are not listed, except those
 *                  the kit picks by name or gives a default of its own.
 *   interface      `members` and `extends` the same way. A type alias of an object does the
 *   type           same; any other alias keeps its `type` text.
 *   hook, function `signature`, `parameters` and `returns`.
 *   const, class   `type`; a class lists its public `members`.
 *
 * A member is `{ name, type, values?, required, default?, description?, deprecated?, ref?,
 * members? }`: `type` as the declaration writes it, `values` the literals a public alias there
 * stands for, `description` its doc comment, `default` the component's destructuring
 * initialiser or else an `@default` tag, never a guess. A member whose type is an object names
 * the entry that lists its members in `ref`, or carries them in `members` when that type is
 * not public. Members keep declaration order.
 *
 * Reads source rather than dist/: defaults exist only in source, and an edited doc comment
 * reaches the site without a package build. `verify docs-freshness` fails stale output.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'

import { documentationFor } from './lib/api-documentation.mjs'
import { normalise } from './lib/api-signatures.mjs'
import { readManifest } from './lib/read-architecture-manifest.mjs'
import { writeIfChanged } from './lib/write-if-changed.mjs'

const OUT = 'src/preview/generated/api-tables.json'
const PAGES = 'src/preview/pages'
const KIT = `${resolve('src')}/`
/* Inline members stop here; a public type is a `ref` at any depth, which also ends cycles. */
const NESTING = 3
const PRINT = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope

const families = readManifest().families.filter((family) => existsSync(family.source))
const config = ts.getParsedCommandLineOfConfigFile('tsconfig.app.json', {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
    throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
  },
})
const program = ts.createProgram(families.map((family) => resolve(family.source)), config.options)
const checker = program.getTypeChecker()

const inKit = (node) => node.getSourceFile().fileName.startsWith(KIT)
const unalias = (symbol) => (symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol)
const byCodePoint = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/* ── Which declaration each public name is ─────────────────────────────────────────── */

/* The root entry re-exports other modules, so it never declares anything itself. */
const familyDirectories = families
  .filter((family) => family.id !== 'index')
  .map((family) => ({ id: family.id, directory: `${resolve(family.source.replace(/\/index\.ts$/, ''))}/` }))
  .sort((a, b) => b.directory.length - a.directory.length)

/** name → declaration symbol → the modules exporting it under that name */
const exported = new Map()
for (const family of families) {
  const file = program.getSourceFile(resolve(family.source))
  const module = file && checker.getSymbolAtLocation(file)
  if (!module) continue
  for (const symbol of checker.getExportsOfModule(module)) {
    if (symbol.name === 'default') continue
    const target = unalias(symbol)
    if (!exported.has(symbol.name)) exported.set(symbol.name, new Map())
    const targets = exported.get(symbol.name)
    if (!targets.has(target)) targets.set(target, [])
    targets.get(target).push(family.id)
  }
}

/** The module that declares a symbol, or the first to export it when no module does. */
function homeOf(target, modules) {
  const file = target.declarations?.[0]?.getSourceFile().fileName ?? ''
  const home = familyDirectories.find(({ directory }) => file.startsWith(directory))?.id
  return home && modules.includes(home) ? home : modules.find((id) => id !== 'index') ?? modules[0]
}

const entries = []
for (const [name, targets] of exported) {
  for (const [target, found] of targets) {
    const home = homeOf(target, found)
    const modules = [home, ...found.filter((id) => id !== home).sort(byCodePoint)]
    entries.push({ key: targets.size === 1 ? name : `${home}#${name}`, name, target, modules })
  }
}

/** The key a member's type points at: the entry named as the declaration is, else the first. */
const keyOfSymbol = new Map()
for (const entry of entries) {
  if (!keyOfSymbol.has(entry.target) || entry.name === entry.target.name) keyOfSymbol.set(entry.target, entry.key)
}

/* ── Doc comments and printing ──────────────────────────────────────────────────────── */

/** A variable's doc comment belongs to its statement, not to the declaration inside it. */
function documentationOf(declaration) {
  if (!declaration) return { description: '', tags: [] }
  const host = ts.isVariableDeclaration(declaration) && declaration.parent.declarations.length === 1
    ? declaration.parent.parent
    : declaration
  const { description, tags } = documentationFor(host)
  return { description: description.trim(), tags }
}

function describedBy(declaration) {
  const { description, tags } = documentationOf(declaration)
  const deprecated = tags.find((tag) => tag.name === 'deprecated')
  return {
    ...(description && { description }),
    ...(deprecated && { deprecated: deprecated.text.trim() || true }),
  }
}

const printType = (type, at) => normalise(checker.typeToString(type, at, PRINT))

/*
 * A type as written, reprinted the way a declaration file prints it: source laid out one union
 * member per line, or a type literal without semicolons, would otherwise run together here.
 */
const printer = ts.createPrinter({ removeComments: true })
const reprint = (node) => normalise(printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile()))
const written = (node) => reprint(node).replace(/\[ /g, '[').replace(/ \]/g, ']')

const LITERAL = ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral |
  ts.TypeFlags.Null | ts.TypeFlags.Undefined

const quoted = (node) => (ts.isStringLiteral(node) ? JSON.stringify(node.text) : node.getText())

/**
 * The order a set of literals is written in: the alias that declares them, or the keys of the
 * variant map they are drawn from. The checker orders a union by when it met each member.
 */
function declaredOrder(declaration, seen = new Set()) {
  if (!declaration || seen.has(declaration)) return []
  seen.add(declaration)
  if (ts.isPropertyAssignment(declaration) && ts.isObjectLiteralExpression(declaration.initializer)) {
    return declaration.initializer.properties.flatMap((property) => (property.name ? [quoted(property.name)] : []))
  }
  return ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration) ? orderIn(declaration.type, seen) : []
}

/** Literals in the order a type node writes them, through aliases and `Props['key']` lookups. */
function orderIn(node, seen) {
  if (!node) return []
  if (ts.isParenthesizedTypeNode(node)) return orderIn(node.type, seen)
  if (ts.isLiteralTypeNode(node)) return [quoted(node.literal)]
  if (ts.isUnionTypeNode(node)) return node.types.flatMap((member) => orderIn(member, seen))
  if (ts.isTypeReferenceNode(node)) {
    const alias = unalias(checker.getSymbolAtLocation(node.typeName))?.declarations?.find(ts.isTypeAliasDeclaration)
    if (!alias || seen.has(alias)) return []
    seen.add(alias)
    return orderIn(alias.type, seen)
  }
  if (ts.isIndexedAccessTypeNode(node) && ts.isLiteralTypeNode(node.indexType) && ts.isStringLiteral(node.indexType.literal)) {
    const property = checker.getTypeFromTypeNode(node.objectType).getProperty(node.indexType.literal.text)
    return declaredOrder(property?.declarations?.[0], seen)
  }
  return []
}

/**
 * A type no kit declaration writes: another package's member, or a key of a variant map. A set
 * of literals is spelled out, since the alias naming it elsewhere is not one a reader can look up.
 */
function readableType(property, at, required) {
  const type = checker.getTypeOfSymbol(property)
  const parts = (type.isUnion() ? type.types : [type]).filter((part) => required || !(part.flags & ts.TypeFlags.Undefined))
  /* A public alias is one a reader can look up, so it keeps its name. */
  const publicAlias = type.aliasSymbol && keyOfSymbol.has(type.aliasSymbol)
  if (!publicAlias && parts.length > 1 && parts.every((part) => part.flags & LITERAL)) {
    const order = declaredOrder(at)
    const rank = (text) => (order.includes(text) ? order.indexOf(text) : order.length)
    /* Values in their written order, and the absence of one last. */
    const empty = ts.TypeFlags.Null | ts.TypeFlags.Undefined
    const texts = [
      ...parts.filter((part) => !(part.flags & empty)).map((part) => printType(part, at)).sort((a, b) => rank(a) - rank(b)),
      ...parts.filter((part) => part.flags & empty).map((part) => printType(part, at)),
    ]
    const boolean = texts.findIndex((text) => text === 'true' || text === 'false')
    if (texts.includes('true') && texts.includes('false')) {
      return texts.flatMap((text, index) => (index === boolean ? ['boolean'] : text === 'true' || text === 'false' ? [] : [text])).join(' | ')
    }
    return texts.join(' | ')
  }
  const printed = printType(type, at)
  return required ? printed : printed.replace(/ \| undefined$/, '')
}

const stripExpression = (node) => {
  while (node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) ||
    ts.isTypeAssertionExpression(node) || ts.isNonNullExpression(node))) node = node.expression
  return node
}

const isLiteral = (node) => ts.isStringLiteral(node) || ts.isNumericLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
  node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword || node.kind === ts.SyntaxKind.NullKeyword ||
  (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand))

/**
 * A default as written, strings in the kit's double quotes. A named constant with a literal
 * value shows the value; any other expression shows as the code says it.
 */
function valueText(node) {
  if (ts.isIdentifier(node)) {
    const declaration = unalias(checker.getSymbolAtLocation(node))?.valueDeclaration
    const value = declaration && ts.isVariableDeclaration(declaration) &&
      declaration.parent.flags & ts.NodeFlags.Const && stripExpression(declaration.initializer)
    if (value && isLiteral(value)) return valueText(value)
  }
  if (ts.isStringLiteral(node)) return JSON.stringify(node.text)
  /* A literal laid out over lines keeps its trailing comma when reprinted. */
  const literal = ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node)
  return literal ? reprint(node).replace(/,\s+([}\]])$/, ' $1') : reprint(node)
}

/** An `@default` tag's text, with a single-quoted string written the way the kit writes one. */
function defaultTag(tags) {
  const text = tags.find((tag) => tag.name === 'default')?.text.trim()
  if (!text) return undefined
  return /^'[^'"]*'$/.test(text) ? `"${text.slice(1, -1)}"` : text
}

/** A binding name as a declaration file prints it: the pattern without its initialisers. */
function bindingText(name) {
  if (ts.isIdentifier(name)) return name.text
  const parts = name.elements.map((element) => {
    if (ts.isOmittedExpression(element)) return ''
    const property = element.propertyName ? `${element.propertyName.getText()}: ` : ''
    return `${element.dotDotDotToken ? '...' : ''}${property}${bindingText(element.name)}`
  })
  return ts.isObjectBindingPattern(name) ? `{ ${parts.join(', ')} }` : `[${parts.join(', ')}]`
}

function parameterText(parameter) {
  const optional = parameter.questionToken || parameter.initializer ? '?' : ''
  const type = parameter.type ? written(parameter.type) : printType(checker.getTypeAtLocation(parameter), parameter)
  return `${parameter.dotDotDotToken ? '...' : ''}${bindingText(parameter.name)}${optional}: ${type}`
}

function signatureText(signature) {
  const declaration = signature.getDeclaration()
  if (!declaration?.parameters) return normalise(checker.signatureToString(signature, undefined, PRINT))
  const generics = declaration.typeParameters?.length
    ? `<${declaration.typeParameters.map(written).join(', ')}>`
    : ''
  const returns = declaration.type ? written(declaration.type) : printType(signature.getReturnType(), declaration)
  return `${generics}(${declaration.parameters.map(parameterText).join(', ')}) => ${returns}`
}

/* ── Where a component's props and defaults are written ────────────────────────────── */

/**
 * The function that renders a component and the props type written for it, followed through
 * `forwardRef`, `memo`, `Object.assign`, casts and aliases. A component the kit re-exports
 * from another package has no function here, only the expression it re-exports.
 */
function implementationOf(node, seen = new Set()) {
  node = stripExpression(node)
  if (!node || seen.has(node)) return null
  seen.add(node)
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
    return node.body ? { fn: node, propsNode: node.parameters[0]?.type ?? null } : null
  }
  if (ts.isVariableDeclaration(node)) {
    const found = implementationOf(node.initializer, seen)
    /* `const X: React.FC<Props> = (props) => …` writes the props on the variable. */
    if (found?.fn && !found.propsNode && node.type && ts.isTypeReferenceNode(node.type)) {
      found.propsNode = node.type.typeArguments?.[0] ?? null
    }
    return found
  }
  if (ts.isCallExpression(node)) {
    const callee = node.expression.getText()
    if (!/(^|\.)(forwardRef|memo)$/.test(callee) && callee !== 'Object.assign') return null
    const found = implementationOf(node.arguments[0], seen)
    /* `forwardRef<Ref, Props>(function …)` writes the props as its second type argument. */
    if (found?.fn && !found.propsNode && node.typeArguments) {
      found.propsNode = node.typeArguments[/forwardRef$/.test(callee) ? 1 : 0] ?? null
    }
    return found
  }
  if (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) {
    const target = unalias(checker.getSymbolAtLocation(node))
    for (const declaration of target?.declarations ?? []) {
      if (!inKit(declaration)) return { fn: null, propsNode: null, external: node }
      const found = implementationOf(declaration, seen)
      if (found) return found
    }
  }
  return null
}

function implementationOfSymbol(symbol) {
  for (const declaration of symbol.declarations ?? []) {
    const found = implementationOf(declaration)
    if (found) return found
  }
  return null
}

/**
 * Initialisers in the props parameter's destructuring, or in a `const { … } = props` at the
 * top of the body. Anything else — a `??` fallback, a provider default — is not read here.
 */
function defaultsOf(fn) {
  const defaults = new Map()
  const parameter = fn?.parameters[0]
  if (!parameter) return defaults
  const read = (pattern) => {
    for (const element of pattern.elements) {
      if (element.dotDotDotToken || !element.initializer) continue
      const key = element.propertyName ?? element.name
      if (ts.isIdentifier(key) || ts.isStringLiteral(key)) defaults.set(key.text, valueText(element.initializer))
    }
  }
  if (ts.isObjectBindingPattern(parameter.name)) read(parameter.name)
  else if (ts.isIdentifier(parameter.name) && fn.body && ts.isBlock(fn.body)) {
    for (const statement of fn.body.statements) {
      if (!ts.isVariableStatement(statement)) continue
      for (const declaration of statement.declarationList.declarations) {
        const from = declaration.initializer && stripExpression(declaration.initializer)
        if (ts.isObjectBindingPattern(declaration.name) && from && ts.isIdentifier(from) && from.text === parameter.name.text) {
          read(declaration.name)
        }
      }
    }
  }
  return defaults
}

/* ── What a props type extends ─────────────────────────────────────────────────────── */

const PACKAGES = [[/^@base-ui\/react(\/|$)/, 'Base UI'], [/^react(-dom)?$/, 'React']]
const TRANSPARENT = new Set(['Omit', 'Partial', 'Required', 'Readonly', 'NonNullable'])

const typeName = (node) => (ts.isTypeReferenceNode(node) ? node.typeName : node.expression)
const leftmost = (name) => {
  while (ts.isQualifiedName(name) || ts.isPropertyAccessExpression(name)) name = ts.isQualifiedName(name) ? name.left : name.expression
  return name
}
const nameParts = (name) => name.getText().split('.')

/** The string keys of a `Pick`'s second argument. */
function literalKeys(node) {
  if (!node) return []
  if (ts.isUnionTypeNode(node)) return node.types.flatMap(literalKeys)
  return ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal) ? [node.literal.text] : []
}

/** Where a name's leftmost identifier is imported from, and the name as that module spells it. */
function importOf(name) {
  const declaration = checker.getSymbolAtLocation(leftmost(name))?.declarations?.[0]
  let parts = nameParts(name)
  if (!declaration || !(ts.isImportSpecifier(declaration) || ts.isNamespaceImport(declaration) || ts.isImportClause(declaration))) {
    return { from: null, parts }
  }
  if (ts.isImportSpecifier(declaration)) parts[0] = (declaration.propertyName ?? declaration.name).text
  else if (parts.length > 1) parts = parts.slice(1)
  return { from: ts.findAncestor(declaration, ts.isImportDeclaration)?.moduleSpecifier.text ?? null, parts }
}

/**
 * `MenuPrimitive.Popup.Props` → `Base UI Menu.Popup props`: a type of another package, named
 * the way that package names it rather than by this file's import alias.
 */
function externalLabel(name, typeArguments, { component = false } = {}) {
  let { from, parts } = importOf(name)
  /* Base UI spells a part's props `Menu.Popup.Props`: the part is the name. */
  if (parts.length > 1 && parts.at(-1) === 'Props') {
    parts = parts.slice(0, -1)
    component = true
  }
  const pack = PACKAGES.find(([pattern]) => from && pattern.test(from))?.[1] ?? from
  const generics = typeArguments?.length ? `<${typeArguments.map(written).join(', ')}>` : ''
  const label = `${pack && pack !== 'React' ? `${pack} ` : ''}${parts.join('.')}${generics}`
  return component ? `${label} props` : label
}

/**
 * Walks a props type as written: into the kit's own types, which the member list covers, and
 * out to the first type of another package on each branch, which becomes an `extends` label.
 */
function walkProps(node, found = { labels: [], picked: new Set(), seen: new Set() }) {
  if (!node) return found
  if (ts.isParenthesizedTypeNode(node)) return walkProps(node.type, found)
  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    for (const type of node.types) walkProps(type, found)
    return found
  }
  if (!ts.isTypeReferenceNode(node) && !ts.isExpressionWithTypeArguments(node)) return found
  const name = typeName(node)
  const typeArguments = node.typeArguments ?? []
  const target = unalias(checker.getSymbolAtLocation(name))
  const declaration = target?.declarations?.[0]
  const add = (label) => {
    if (!found.labels.includes(label)) found.labels.push(label)
  }

  if (declaration && inKit(declaration)) {
    if (found.seen.has(declaration)) return found
    found.seen.add(declaration)
    if (ts.isInterfaceDeclaration(declaration)) {
      for (const clause of declaration.heritageClauses ?? []) for (const type of clause.types) walkProps(type, found)
    } else if (ts.isTypeAliasDeclaration(declaration)) walkProps(declaration.type, found)
    return found
  }
  const last = nameParts(name).at(-1)
  if (TRANSPARENT.has(last)) return walkProps(typeArguments[0], found)
  /* A record over named keys has members, which the list shows; over `string` it has none. */
  if (last === 'Record' && typeArguments[0] && !/^(string|number|PropertyKey)$/.test(typeArguments[0].getText())) return found
  if (last === 'Pick') {
    const source = typeArguments[0] && ts.isTypeReferenceNode(typeArguments[0])
      ? unalias(checker.getSymbolAtLocation(typeArguments[0].typeName))?.declarations?.[0]
      : null
    /* Members picked by name from another package are listed, so the source is no `extends`. */
    if (source && !inKit(source)) {
      for (const key of literalKeys(typeArguments[1])) found.picked.add(key)
      return found
    }
    return walkProps(typeArguments[0], found)
  }
  if (/^ComponentProps(WithRef|WithoutRef)?$/.test(last) && typeArguments[0]) {
    const argument = typeArguments[0]
    if (ts.isLiteralTypeNode(argument) && ts.isStringLiteral(argument.literal)) {
      add(`${argument.literal.text} props`)
      /* Base UI's `useRender.ComponentProps` is the element's props plus `render`, the kit's substitution prop. */
      const { from, parts } = importOf(name)
      if (from?.startsWith('@base-ui/react') && parts[0] === 'useRender') found.picked.add('render')
      return found
    }
    if (ts.isTypeQueryNode(argument)) {
      const component = implementationOfSymbol(unalias(checker.getSymbolAtLocation(argument.exprName)) ?? {})
      if (component?.fn) return walkProps(component.propsNode, found)
      add(externalLabel(argument.exprName, [], { component: true }))
      return found
    }
  }
  add(externalLabel(name, typeArguments))
  return found
}

/* ── Members ───────────────────────────────────────────────────────────────────────── */

/**
 * Properties with whether each is required. A union's branches each contribute theirs, and a
 * property is required only when every branch requires it.
 */
function propertiesOf(type) {
  if (type.isUnion()) {
    const branches = type.types.filter((branch) => !(branch.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)))
    const found = new Map()
    for (const branch of branches) {
      for (const property of checker.getPropertiesOfType(branch)) {
        const required = !(property.flags & ts.SymbolFlags.Optional)
        const seen = found.get(property.name)
        if (seen) seen.count += 1
        if (seen) seen.required &&= required
        else found.set(property.name, { property, required, count: 1 })
      }
    }
    return [...found.values()].map(({ property, required, count }) => ({ property, required: required && count === branches.length }))
  }
  const apparent = type.flags & ts.TypeFlags.TypeParameter ? checker.getApparentType(type) : type
  return checker.getPropertiesOfType(apparent).map((property) => ({ property, required: !(property.flags & ts.SymbolFlags.Optional) }))
}

/** A declaration that writes its member's type, as an interface or a type literal does. */
const typed = (declaration) => declaration && (ts.isPropertySignature(declaration) || ts.isPropertyDeclaration(declaration) ||
  ts.isParameter(declaration)) && declaration.type

function memberType(property, declaration, required) {
  if (declaration && inKit(declaration) && typed(declaration)) return written(declaration.type)
  if (declaration && inKit(declaration) && (ts.isMethodSignature(declaration) || ts.isMethodDeclaration(declaration))) {
    const signature = checker.getSignatureFromDeclaration(declaration)
    if (signature) return signatureText(signature)
  }
  return readableType(property, declaration, required)
}

/** A type node that names an object worth listing, through `| undefined`, arrays and wrappers. */
function objectNode(node) {
  while (node) {
    if (ts.isParenthesizedTypeNode(node)) node = node.type
    else if (ts.isTypeOperatorNode(node) && node.operator === ts.SyntaxKind.ReadonlyKeyword) node = node.type
    else if (ts.isArrayTypeNode(node)) node = node.elementType
    else if (ts.isUnionTypeNode(node)) {
      const rest = node.types.filter((type) => type.kind !== ts.SyntaxKind.UndefinedKeyword &&
        !(ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.NullKeyword))
      if (rest.length !== 1) return null
      node = rest[0]
    } else if (ts.isTypeReferenceNode(node) && /^(Array|ReadonlyArray|Partial|Required|Readonly)$/.test(node.typeName.getText())) {
      node = node.typeArguments?.[0]
    } else break
  }
  return node && (ts.isTypeLiteralNode(node) || ts.isIntersectionTypeNode(node) || ts.isTypeReferenceNode(node)) ? node : null
}

/** An object with properties and no call signature: something a reader looks inside. */
const isObjectType = (type) =>
  !type.isUnion() && !!(type.flags & (ts.TypeFlags.Object | ts.TypeFlags.Intersection)) &&
  type.getCallSignatures().length === 0 && checker.getPropertiesOfType(type).length > 0

const objectDeclaration = (symbol) => symbol && (symbol.flags & ts.SymbolFlags.Interface ||
  (symbol.flags & ts.SymbolFlags.TypeAlias && isObjectType(checker.getDeclaredTypeOfSymbol(symbol))))

/** `ref` to the public entry that lists an object type's members, or the members inline. */
function nestedOf(typeNode, depth) {
  const node = objectNode(typeNode)
  if (!node) return {}
  if (ts.isTypeReferenceNode(node)) {
    const target = unalias(checker.getSymbolAtLocation(node.typeName))
    if (!target?.declarations?.some(inKit) || !objectDeclaration(target)) return {}
    const key = keyOfSymbol.get(target)
    if (key) return { ref: key }
  }
  if (depth >= NESTING) return {}
  const type = checker.getTypeFromTypeNode(node)
  if (!isObjectType(type)) return {}
  const members = membersOf(type, { depth: depth + 1 })
  return members.length ? { members } : {}
}

/** `"a" | "b" | 1`: a union of literals and nothing else. */
const LITERAL_TEXT = String.raw`(?:"[^"]*"|-?\d+(?:\.\d+)?|true|false|null)`
const LITERAL_UNION = new RegExp(`^${LITERAL_TEXT}(?: \\| ${LITERAL_TEXT})+$`)

/**
 * The literals a member's type stands for when it names a public alias of them (`BadgeTone`),
 * so a table can show the values under the name without carrying the alias's own entry.
 */
function valuesOf(property, declaration, type) {
  const alias = declaration && inKit(declaration) && typed(declaration) && ts.isTypeReferenceNode(declaration.type)
    ? unalias(checker.getSymbolAtLocation(declaration.type.typeName))
    : checker.getTypeOfSymbol(property).aliasSymbol
  const aliased = alias?.name === type && keyOfSymbol.has(alias) && alias.declarations?.find(ts.isTypeAliasDeclaration)
  const text = aliased && written(aliased.type)
  return text && LITERAL_UNION.test(text) ? text : undefined
}

function member(property, declaration, required, { defaults, depth }) {
  const documentation = documentationOf(declaration)
  /* Another package's doc comment is its own reference; its first paragraph is the gist. */
  const description = declaration && !inKit(declaration) ? documentation.description.split(/\n\s*\n/)[0] : documentation.description
  const deprecated = documentation.tags.find((tag) => tag.name === 'deprecated')
  const value = defaults.get(property.name) ?? defaultTag(documentation.tags)
  const type = memberType(property, declaration, required)
  const values = valuesOf(property, declaration, type)
  return {
    name: property.name,
    type,
    ...(values && { values }),
    required,
    ...(value !== undefined && { default: value }),
    ...(description && { description }),
    ...(deprecated && { deprecated: deprecated.text.trim() || true }),
    ...(declaration && inKit(declaration) && typed(declaration) ? nestedOf(declaration.type, depth) : {}),
  }
}

/** Declaration order: members grouped by the type that declares them, in source order within. */
function inDeclarationOrder(found) {
  const groups = new Map()
  for (const item of found) {
    const container = item.declaration?.parent ?? item
    if (!groups.has(container)) groups.set(container, [])
    groups.get(container).push(item)
  }
  return [...groups.values()].flatMap((group) => group.sort((a, b) => (a.declaration?.pos ?? 0) - (b.declaration?.pos ?? 0)))
}

/**
 * The members a type's kit declarations contribute, then the members of other packages the
 * kit picks by name or gives a default of its own.
 */
function membersOf(type, { defaults = new Map(), picked = new Set(), depth = 0 } = {}) {
  const own = []
  const adopted = []
  for (const { property, required } of propertiesOf(type)) {
    const declarations = property.declarations ?? []
    const kit = declarations.filter(inKit)
    if (declarations.length && !kit.length && !picked.has(property.name) && !defaults.has(property.name)) continue
    const declaration = kit.find((node) => documentationOf(node).description) ?? kit[0] ?? declarations[0]
    ;(kit.length || !declarations.length ? own : adopted).push({ property, declaration, required })
  }
  return [...inDeclarationOrder(own), ...inDeclarationOrder(adopted)]
    .map(({ property, declaration, required }) => member(property, declaration, required, { defaults, depth }))
}

/* ── Entries ───────────────────────────────────────────────────────────────────────── */

function describeComponent(symbol, signature) {
  const implementation = implementationOfSymbol(symbol)
  const walked = walkProps(implementation?.propsNode)
  if (implementation?.external) walked.labels.push(externalLabel(implementation.external, [], { component: true }))
  const parameter = signature.getParameters()[0]
  const props = parameter
    ? membersOf(checker.getTypeOfSymbol(parameter), { defaults: defaultsOf(implementation?.fn), picked: walked.picked })
    : []
  return {
    kind: 'component',
    ...describedBy(symbol.valueDeclaration ?? symbol.declarations?.[0]),
    ...(walked.labels.length && { extends: walked.labels }),
    props,
  }
}

function describeReturn(signature) {
  const declaration = signature.getDeclaration()
  const type = signature.getReturnType()
  const note = declaration && ts.getJSDocReturnTag(declaration)?.comment
  const nested = declaration?.type
    ? nestedOf(declaration.type, 0)
    : type.symbol && keyOfSymbol.has(type.aliasSymbol ?? type.symbol) && objectDeclaration(type.aliasSymbol ?? type.symbol)
      ? { ref: keyOfSymbol.get(type.aliasSymbol ?? type.symbol) }
      : isObjectType(type) ? { members: membersOf(type, { depth: 1 }) } : {}
  return {
    type: declaration?.type ? written(declaration.type) : printType(type, declaration),
    ...(typeof note === 'string' && note.trim() && { description: note.trim() }),
    ...(nested.members?.length === 0 ? {} : nested),
  }
}

function describeParameter(parameter) {
  const note = ts.getJSDocParameterTags(parameter).map((tag) => (typeof tag.comment === 'string' ? tag.comment : '')).join(' ').trim()
  return {
    name: bindingText(parameter.name),
    type: parameter.type ? written(parameter.type) : printType(checker.getTypeAtLocation(parameter), parameter),
    required: !(parameter.questionToken || parameter.initializer || parameter.dotDotDotToken),
    ...(parameter.initializer && { default: valueText(parameter.initializer) }),
    ...(note && { description: note }),
    ...nestedOf(parameter.type, 0),
  }
}

function describeFunction(symbol, kind, signatures) {
  const [first, ...overloads] = signatures
  const declaration = first.getDeclaration()
  return {
    kind,
    ...describedBy(symbol.valueDeclaration ?? symbol.declarations?.[0]),
    signature: signatureText(first),
    ...(overloads.length && { overloads: overloads.map(signatureText) }),
    parameters: (declaration?.parameters ?? []).map(describeParameter),
    returns: describeReturn(first),
  }
}

function describeObject(symbol, kind) {
  const declaration = symbol.declarations.find((node) => ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
  const walked = { labels: [], picked: new Set(), seen: new Set([declaration]) }
  if (ts.isInterfaceDeclaration(declaration)) {
    for (const clause of declaration.heritageClauses ?? []) for (const type of clause.types) walkProps(type, walked)
  } else walkProps(declaration.type, walked)
  return {
    kind,
    ...describedBy(declaration),
    ...(walked.labels.length && { extends: walked.labels }),
    members: membersOf(checker.getDeclaredTypeOfSymbol(symbol), { picked: walked.picked }),
  }
}

function describeAlias(symbol) {
  const declaration = symbol.declarations.find(ts.isTypeAliasDeclaration)
  if (isObjectType(checker.getDeclaredTypeOfSymbol(symbol))) return describeObject(symbol, 'type')
  return { kind: 'type', ...describedBy(declaration), type: written(declaration.type) }
}

function describeClass(symbol) {
  const declaration = symbol.declarations.find(ts.isClassDeclaration)
  const hidden = ts.ModifierFlags.Private | ts.ModifierFlags.Protected
  const members = membersOf(checker.getDeclaredTypeOfSymbol(symbol))
    .filter((found) => {
      const node = declaration.members.find((candidate) => candidate.name?.getText() === found.name)
      return !node || !(ts.getCombinedModifierFlags(node) & hidden)
    })
  return { kind: 'class', ...describedBy(declaration), members: members.filter((found) => !found.name.startsWith('#')) }
}

/** React's Context type is callable as its own provider, but a page documents it as a value. */
const isContext = (type) => type.symbol?.name === 'Context' && !type.symbol.declarations?.some(inKit)

function describe({ name, target }) {
  if (target.flags & ts.SymbolFlags.Class) return describeClass(target)
  if (target.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable)) {
    const declaration = target.valueDeclaration ?? target.declarations[0]
    const type = checker.getTypeOfSymbolAtLocation(target, declaration)
    const signatures = isContext(type) ? [] : type.getCallSignatures()
    if (signatures.length && /^use[A-Z]/.test(name)) return describeFunction(target, 'hook', signatures)
    if (signatures.length && /^[A-Z]/.test(name)) return describeComponent(target, signatures[0])
    if (signatures.length) return describeFunction(target, 'function', signatures)
    return {
      kind: 'const',
      ...describedBy(declaration),
      type: ts.isVariableDeclaration(declaration) && declaration.type ? written(declaration.type) : printType(type, declaration),
    }
  }
  if (target.flags & ts.SymbolFlags.Interface) return describeObject(target, 'interface')
  if (target.flags & ts.SymbolFlags.TypeAlias) return describeAlias(target)
  throw new Error(`gen-api-tables: ${name} is neither a value nor a type this generator describes`)
}

const symbols = {}
for (const entry of [...entries].sort((a, b) => byCodePoint(a.key, b.key))) {
  symbols[entry.key] = { ...describe(entry), modules: entry.modules }
}

/* ── What the pages show ───────────────────────────────────────────────────────────── */

const HINT = 'A name two modules declare is keyed by module, as in "base/action-menu#ActionDefinition".'

/** The members a key or a member lists, following `ref` into the entry that holds them. */
function membersIn(holder) {
  if (holder?.members) return holder.members
  const target = holder?.ref ? symbols[holder.ref] : undefined
  return target?.props ?? target?.members ?? []
}

/**
 * The key an `owner` resolves to, read the way PropTable reads it: `Badge`, `useThing()` for
 * what a hook returns, and a dotted path into members, each step of which must exist.
 */
function ownerKey(owner, file) {
  const [head = '', ...path] = owner.split('.')
  const returns = head.endsWith('()')
  const key = returns ? head.slice(0, -2) : head
  const entry = symbols[key]
  if (!entry) throw new Error(`gen-api-tables: ${file} names "${key}", which is not a public declaration. ${HINT}`)
  let rows = returns ? membersIn(entry.returns) : (entry.props ?? entry.members ?? membersIn(entry.parameters?.[0]))
  for (const name of path) {
    const found = rows.find((row) => row.name === name)
    if (!found) throw new Error(`gen-api-tables: ${file} names "${owner}", but nothing on that path has a member "${name}".`)
    rows = membersIn(found)
  }
  return key
}

/** An attribute's strings, which must be literals: a computed value is one no generator can see. */
function literalStrings(initializer, attribute, file) {
  const expression = initializer && ts.isJsxExpression(initializer) ? initializer.expression : initializer
  const many = attribute !== 'owner'
  const nodes = many && expression && ts.isArrayLiteralExpression(expression) ? [...expression.elements] : many ? [] : [expression]
  if (!nodes.length || !nodes.every((node) => node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)))) {
    throw new Error(`gen-api-tables: ${file} gives PropTable a computed \`${attribute}\`; write ${many ? 'an array of strings' : 'a string'}.`)
  }
  return nodes.map((node) => node.text)
}

/** The keys `<PropTable>` elements name. One with `rows` renders those and reads nothing here. */
function namedByPages() {
  const keys = []
  for (const name of readdirSync(PAGES).filter((file) => file.endsWith('.tsx')).sort(byCodePoint)) {
    const file = `${PAGES}/${name}`
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const visit = (node) => {
      const tag = ts.isJsxSelfClosingElement(node) ? node : ts.isJsxElement(node) ? node.openingElement : undefined
      if (tag?.tagName.getText(source) === 'PropTable') {
        const attributes = new Map()
        for (const property of tag.attributes.properties) {
          if (ts.isJsxSpreadAttribute(property)) throw new Error(`gen-api-tables: ${file} spreads props into a PropTable; name what it shows.`)
          attributes.set(property.name.getText(source), property.initializer)
        }
        if (!attributes.has('rows')) {
          if (attributes.has('owner')) keys.push(ownerKey(literalStrings(attributes.get('owner'), 'owner', file)[0], file))
          if (attributes.has('owners')) keys.push(...literalStrings(attributes.get('owners'), 'owners', file).map((owner) => ownerKey(owner, file)))
          for (const key of attributes.has('symbols') ? literalStrings(attributes.get('symbols'), 'symbols', file) : []) {
            if (!symbols[key]) throw new Error(`gen-api-tables: ${file} names "${key}", which is not a public declaration. ${HINT}`)
            keys.push(key)
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return keys
}

/** Every `ref` in an entry, at any depth: the entries a table follows into. */
function refsIn(value, found = []) {
  if (Array.isArray(value)) for (const item of value) refsIn(item, found)
  else if (value && typeof value === 'object') {
    if (typeof value.ref === 'string') found.push(value.ref)
    for (const nested of Object.values(value)) refsIn(nested, found)
  }
  return found
}

const shown = new Set()
const queue = namedByPages()
while (queue.length) {
  const key = queue.shift()
  if (shown.has(key)) continue
  shown.add(key)
  queue.push(...refsIn(symbols[key]))
}

mkdirSync('src/preview/generated', { recursive: true })
writeIfChanged(
  OUT,
  `${JSON.stringify(
    {
      note:
        'Generated by scripts/gen-api-tables.mjs from the declarations and doc comments in src/, ' +
        "for what the pages' PropTables name. A description is the doc comment on the " +
        "declaration and a default is the component's own initialiser: edit those, then regenerate.",
      symbols: Object.fromEntries([...shown].sort(byCodePoint).map((key) => [key, symbols[key]])),
    },
    null,
    2,
  )}\n`,
)

const components = Object.values(symbols).filter((entry) => entry.kind === 'component')
const props = components.flatMap((entry) => entry.props)
console.log(
  `gen:api-tables — ${shown.size} of ${Object.keys(symbols).length} public declarations shown; the package's ` +
    `${components.length} components have ${props.length} props (${props.filter((prop) => prop.description).length} ` +
    `described, ${props.filter((prop) => prop.default !== undefined).length} with a default)`,
)
