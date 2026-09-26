import { useContext, useEffect, useId, useMemo, useSyncExternalStore, useRef } from 'react';

import { ActionScopeContext, useActionStore } from './action-store';
import {
	ACTION_GLOBAL_SCOPE,
	type ActionDefinition,
	type ActionRegistrationOptions,
	type ActionStoreSnapshot,
	type ActionSurfaceOptions,
	type ResolvedAction,
	type UseLocalActionOptions,
	type UseActionOptions,
} from './actions.types';

export function useActionScope(): string {
	return useContext(ActionScopeContext) ?? ACTION_GLOBAL_SCOPE;
}

export function useActionSnapshot(): ActionStoreSnapshot {
	const store = useActionStore();
	return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}

export function useRegisterActions<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	actions: readonly ActionDefinition<TPayload, TValues, TResult>[],
	options: ActionRegistrationOptions = {},
): void {
	const store = useActionStore();
	const inheritedScope = useActionScope();
	const scope = options.scope ?? inheritedScope;

	/*
	 * One array for the hook's lifetime, refreshed in place. Callers pass a fresh array every
	 * render; keying registration on it would loop (register → version bump → re-render).
	 * Registration is keyed on the action ids instead, and the store holds this array by
	 * reference, so in-place refreshes keep definitions current.
	 */
	const box = useRef<ActionDefinition<TPayload, TValues, TResult>[]>([]);

	/* Refreshed after commit; declared first so it runs before the registration effect reads it. */
	useEffect(() => {
		box.current.length = 0;
		box.current.push(...actions);
	});

	const signature = actions.map((action) => action.id).join('|');

	useEffect(() => {
		if (box.current.length === 0) return undefined;
		return store.registerActions(box.current, { scope });
		// `signature` IS the dependency: the ids are what decide what is registered.
	}, [signature, scope, store]);
}

export function useActionSurface<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	options: ActionSurfaceOptions<TPayload>,
): ResolvedAction<TPayload, TValues, TResult>[] {
	const store = useActionStore();
	const inheritedScope = useActionScope();
	const scope = options.scope ?? inheritedScope;
	const { surface, payload, metadata, includeGlobal } = options;

	useActionSnapshot();

	return store.selectSurfaceActions<TPayload, TValues, TResult>({
		surface,
		payload,
		metadata,
		includeGlobal,
		scope,
	});
}

export function useAction<TPayload = unknown, TValues = unknown, TResult = unknown>(
	actionId: string,
	options: UseActionOptions<TPayload> = {},
): ResolvedAction<TPayload, TValues, TResult> | null {
	const store = useActionStore();
	const inheritedScope = useActionScope();
	const scope = options.scope ?? inheritedScope;
	const { payload, metadata, includeGlobal } = options;

	useActionSnapshot();

	return store.selectAction<TPayload, TValues, TResult>(actionId, {
		payload,
		metadata,
		includeGlobal,
		scope,
	});
}

export function useLocalAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	definition: ActionDefinition<TPayload, TValues, TResult>,
	options: UseLocalActionOptions<TPayload> = {},
): ResolvedAction<TPayload, TValues, TResult> | null {
	const inheritedScope = useActionScope();
	const localId = useId();
	const scope = options.scope ?? `${inheritedScope}:local:${localId}`;
	const actions = useMemo(() => [definition], [definition]);

	useRegisterActions(actions, { scope });

	return useAction<TPayload, TValues, TResult>(definition.id, {
		...options,
		scope,
		includeGlobal: false,
	});
}

export function useActiveAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(): ResolvedAction<TPayload, TValues, TResult> | null {
	const store = useActionStore();
	useActionSnapshot();

	return store.getActiveAction<TPayload, TValues, TResult>();
}
