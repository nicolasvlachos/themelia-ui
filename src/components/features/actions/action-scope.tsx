import { type ReactNode } from 'react';

import { ActionScopeContext } from './action-store';
import { useRegisterActions } from './hooks';
import { ACTION_GLOBAL_SCOPE, type ActionScopeProps } from './actions.types';

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
