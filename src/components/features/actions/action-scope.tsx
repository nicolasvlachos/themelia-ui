import { type ReactNode } from 'react';

import { ActionScopeContext } from './action-store';
import { useRegisterActions } from './hooks';
import { ACTION_GLOBAL_SCOPE, type ActionScopeProps } from './actions.types';

/**
 * Declarative registration, for actions that belong to a subtree rather than a component.
 * Registers `actions` under `scope` while mounted, and surfaces inside it resolve in that scope.
 */
export function ActionScope<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>({
	scope = ACTION_GLOBAL_SCOPE,
	actions,
	children,
}: ActionScopeProps<TPayload, TValues, TResult>): ReactNode {
	useRegisterActions(actions, { scope });

	return (
		<ActionScopeContext.Provider value={scope}>
			{children}
		</ActionScopeContext.Provider>
	);
}
