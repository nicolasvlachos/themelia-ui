import { createContext, type ReactNode } from "react"
import type { CommentData } from "./comments.types"

/** Internal lookup so each expanded reply can reveal its own children. */
export const CommentThreadContext = createContext<ReadonlyMap<string, readonly CommentData[]>>(new Map())

/** How deep in a thread an item sits (internal); replies draw a smaller avatar and gutter. */
export const CommentDepthContext = createContext(0)

/**
 * The composer `Comments` opens inside the thread (a reply or an edit). `Comments` owns it and
 * hands over the element and target id; the matching item places it. Without a provider,
 * nothing opens inline and `onReply` / `onEdit` are the consumer's.
 */
export interface CommentInlineComposer {
	replyingToId?: string
	editingId?: string
	composer?: ReactNode
}

export const CommentInlineComposerContext = createContext<CommentInlineComposer>({})
