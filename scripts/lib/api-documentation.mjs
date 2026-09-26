import ts from 'typescript'

/** Preserve declaration JSDoc separately from compatibility signatures. Never infer defaults. */
export function documentationFor(node) {
  const description = (node.jsDoc ?? []).map((doc) => typeof doc.comment === 'string'
    ? doc.comment : (doc.comment ?? []).map((part) => part.text ?? '').join('')).filter(Boolean).join('\n')
  const tags = ts.getJSDocTags(node).map((tag) => ({
    name: tag.tagName.text,
    text: typeof tag.comment === 'string' ? tag.comment : (tag.comment ?? []).map((part) => part.text ?? '').join(''),
  }))
  return { description, tags }
}
