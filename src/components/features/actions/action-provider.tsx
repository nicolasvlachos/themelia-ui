import {
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from 'react';

import { createActionStore, type ActionStore } from './action-store';
import {
	ACTION_GLOBAL_SCOPE,
	type ActionProviderProps,
	type ActionStoreSnapshot,
} from './actions.types';
import { ActionScopeContext, ActionStoreContext } from './action-store';

export function ActionProvider<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>({
	actions,
	runtime,
	feedback,
	guards,
	parseErrors,
	requestRunner,
	onOverlayOpenChange,
	onRunningChange,
	children,
}: ActionProviderProps<TPayload, TValues, TResult>): ReactNode {
	/* One store per mount, created synchronously so SSR and sibling React roots stay isolated. */
	const [store] = useState(createActionStore);
	const resolvedFeedback = feedback ?? runtime?.feedback;
	const resolvedGuards = guards ?? runtime?.guards;
	const resolvedParseErrors = parseErrors ?? runtime?.parseErrors;
	const resolvedRequestRunner = requestRunner ?? runtime?.requestRunner;
	const resolvedOverlayOpenChange =
		onOverlayOpenChange ?? runtime?.onOverlayOpenChange;
	const resolvedRunningChange = onRunningChange ?? runtime?.onRunningChange;

	useEffect(() => {
		store.setOptions({
			feedback: resolvedFeedback,
			guards: resolvedGuards,
			parseErrors: resolvedParseErrors,
			requestRunner: resolvedRequestRunner,
		});
	}, [
		resolvedFeedback,
		resolvedGuards,
		resolvedParseErrors,
		resolvedRequestRunner,
		store,
	]);

	useEffect(() => {
		if (!actions || actions.length === 0) return undefined;
		return store.registerActions(actions, { scope: ACTION_GLOBAL_SCOPE });
	}, [actions, store]);

	return (
		<ActionStoreContext.Provider value={store}>
			<ActionScopeContext.Provider value={ACTION_GLOBAL_SCOPE}>
				<ActionProviderStateEffects
					store={store}
					onOverlayOpenChange={resolvedOverlayOpenChange}
					onRunningChange={resolvedRunningChange}
				/>
				{children}
			</ActionScopeContext.Provider>
		</ActionStoreContext.Provider>
	);
}

interface ActionProviderStateEffectsProps {
	store: ActionStore;
	onOverlayOpenChange?: (
		open: boolean,
		snapshot: ActionStoreSnapshot,
	) => void;
	onRunningChange?: (
		running: boolean,
		snapshot: ActionStoreSnapshot,
	) => void;
}

function ActionProviderStateEffects({
	store,
	onOverlayOpenChange,
	onRunningChange,
}: ActionProviderStateEffectsProps) {
	const snapshot = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getSnapshot,
	);
	const isOverlayOpen = snapshot.active !== null;
	const isRunning = Object.values(snapshot.runStates).some((state) => state.isRunning);
	const previousOverlayOpenRef = useRef(isOverlayOpen);
	const previousRunningRef = useRef(isRunning);
	const onOverlayOpenChangeRef = useRef(onOverlayOpenChange);
	const onRunningChangeRef = useRef(onRunningChange);

	useEffect(() => {
		onOverlayOpenChangeRef.current = onOverlayOpenChange;
	}, [onOverlayOpenChange]);

	useEffect(() => {
		onRunningChangeRef.current = onRunningChange;
	}, [onRunningChange]);

	useEffect(() => {
		if (previousOverlayOpenRef.current === isOverlayOpen) return;
		previousOverlayOpenRef.current = isOverlayOpen;
		onOverlayOpenChangeRef.current?.(isOverlayOpen, snapshot);
	}, [isOverlayOpen, snapshot]);

	useEffect(() => {
		if (previousRunningRef.current === isRunning) return;
		previousRunningRef.current = isRunning;
		onRunningChangeRef.current?.(isRunning, snapshot);
	}, [isRunning, snapshot]);

	return null;
}

