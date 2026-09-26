/*
 * The normalised shape of one exported `.d.ts` declaration, for the API snapshot. Comments
 * and whitespace go and object types become a member map, so reordering or reflowing is not
 * a diff while removing a member or narrowing a type is.
 */
import ts from 'typescript'

/** Comments out, whitespace collapsed: what the type says, not how it was typed. */
const normalise = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    /*
     * A relative `import('./x.js').Foo` is `Foo` after a move between modules, so strip it.
     * A package path stays: `import("react").JSX.Element` is not the same type as `JSX.Element`.
     */
    .replace(/import\(['"]\.[^'"]*['"]\)\./g, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Members of an interface or type literal by name. Optionality is kept apart from the type
 * because optional → required breaks callers and the reverse does not.
 */
function members(node) {
  const list = ts.isInterfaceDeclaration(node)
    ? node.members
    : ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)
      ? node.type.members
      : null
  if (!list) return null

  const out = {}
  for (const member of list) {
    if (!member.name) continue
    const name = member.name.getText()
    out[name] = {
      optional: Boolean(member.questionToken),
      type: member.type ? normalise(member.type.getText()) : 'unknown',
    }
  }
  return Object.keys(out).length > 0 ? out : null
}

/** Public bases are part of an interface's usable prop surface, even when it adds few props. */
function inheritedTypes(node) {
  if (!ts.isInterfaceDeclaration(node)) return []
  return (node.heritageClauses ?? [])
    .flatMap((clause) => clause.types)
    .map((type) => normalise(type.getText()))
}

/** Every exported declaration in one `.d.ts`, by name. */
export function signaturesIn(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const found = new Map()

  const record = (name, kind, node, typeNode) => {
    const entry = { kind }
    const inherited = inheritedTypes(node)
    if (inherited.length) entry.extends = inherited
    const shape = members(node)
    if (shape) entry.members = shape
    else if (typeNode) entry.signature = normalise(typeNode.getText())
    found.set(name, entry)
  }

  for (const statement of source.statements) {
    if (ts.isInterfaceDeclaration(statement)) {
      record(statement.name.text, 'interface', statement, null)
    } else if (ts.isTypeAliasDeclaration(statement)) {
      record(statement.name.text, 'type', statement, statement.type)
    } else if (ts.isFunctionDeclaration(statement) && statement.name) {
      /* A function and a const of the same arrow type both record as `callable`. */
      const parameters = statement.parameters.map((p) => normalise(p.getText())).join(', ')
      const returns = statement.type ? normalise(statement.type.getText()) : 'unknown'
      found.set(statement.name.text, { kind: 'callable', signature: `(${parameters}) => ${returns}` })
    } else if (ts.isClassDeclaration(statement) && statement.name) {
      record(statement.name.text, 'class', statement, null)
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue
        const type = declaration.type ? normalise(declaration.type.getText()) : 'unknown'
        /* A const whose type is a function type IS a callable, whatever it was declared as. */
        const callable = declaration.type && ts.isFunctionTypeNode(declaration.type)
        found.set(declaration.name.text, callable
          ? { kind: 'callable', signature: type }
          : { kind: 'const', signature: type })
      }
    }
  }
  return found
}
