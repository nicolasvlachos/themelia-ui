import { createContext, useContext } from 'react';

import {
	ACTION_GLOBAL_SCOPE,
	type ActionContext,
	type ActionDefinition,
	type ActionEntry,
	type ActionErrorParseContext,
	type ActionErrorParser,
	type ActionFeedbackHandlers,
	type ActionFieldErrors,
	type ActionGuards,
	type ActionLifecycleEvent,
	type ActionLifecycleType,
	type ActionMessage,
	type ActionMessageContext,
	type ActionMetadata,
	type ActionRegistration,
	type ActionRegistrationOptions,
	type ActionRequestConfig,
	type ActionRequestRunner,
	type ActionRunContext,
	type ActionRunState,
	type ActionStatus,
	type ParsedActionError,
	type ResolvedActionRequest,
	type ActionStoreSnapshot,
	type ActionSurfaceOptions,
	type ResolvedAction,
	type UseActionOptions,
} from './actions.types';

const EMPTY_ERRORS: ActionFieldErrors = Object.freeze({});

let nextRegistrationId = 0;

function createRunState(
	status: ActionStatus,
	state: Omit<
		Partial<ActionRunState>,
		'status' | 'isIdle' | 'isRunning' | 'isSuccess' | 'isError'
	> = {},
): ActionRunState {
	return {
		...state,
		status,
		isIdle: status === 'idle',
		isRunning: status === 'running',
		isSuccess: status === 'succeeded',
		isError: status === 'failed',
		error: state.error ?? null,
		errors: state.errors ?? EMPTY_ERRORS,
	};
}

function mergeMetadata(
	base?: ActionMetadata,
	override?: ActionMetadata,
): ActionMetadata | undefined {
	if (!base) return override;
	if (!override) return base;
	return { ...base, ...override };
}

function createSnapshot(
	version: number,
	registrations: readonly ActionRegistration[],
	runStates: Readonly<Record<string, ActionRunState>>,
	active: ActionStoreSnapshot['active'],
): ActionStoreSnapshot {
	return Object.freeze({
		version,
		registrations: Object.freeze([...registrations]),
		runStates: Object.freeze({ ...runStates }),
		active: active ? Object.freeze({ ...active }) : null,
	});
}

function resolveScope(scope?: string): string {
	const trimmed = scope?.trim();
	return trimmed ? trimmed : ACTION_GLOBAL_SCOPE;
}

function createActionKey(registrationId: string, actionId: string): string {
	return `${registrationId}:${actionId}`;
}

function getDefaultSurfaces(action: ActionDefinition): readonly string[] {
	return action.surfaces ?? ['page'];
}

function evaluatePredicate<TPayload>(
	predicate: ActionDefinition<TPayload>['visible'],
	context: ActionContext<TPayload>,
	fallback: boolean,
): boolean {
	if (predicate === undefined) return fallback;
	if (typeof predicate === 'function') return predicate(context);
	return predicate;
}

function resolveSearchLabel(action: ActionDefinition): string {
	if (action.searchLabel) return action.searchLabel;
	if (typeof action.label === 'string') return action.label;
	return action.id;
}

function toStringArray(value: string | readonly string[] | undefined): readonly string[] {
	if (!value) return [];
	return Array.isArray(value) ? value : [value as string];
}

function isActionFieldErrors(value: unknown): value is ActionFieldErrors {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
	return Object.values(value).every((item) =>
		typeof item === 'string' ||
		(Array.isArray(item) && item.every((child) => typeof child === 'string')),
	);
}

function normalizeParsedError(
	parsed: ParsedActionError | ActionFieldErrors | string | null | undefined,
	error: unknown,
): ParsedActionError {
	if (typeof parsed === 'string') return { message: parsed };
	if (parsed && typeof parsed === 'object') {
		if ('fieldErrors' in parsed || 'message' in parsed) {
			const maybeParsed = parsed as ParsedActionError;
			return {
				fieldErrors: maybeParsed.fieldErrors ?? extractActionFieldErrors(error),
				message: typeof maybeParsed.message === 'string' ? maybeParsed.message : undefined,
			};
		}
		if (isActionFieldErrors(parsed)) {
			return { fieldErrors: parsed };
		}
	}
	return { fieldErrors: extractActionFieldErrors(error) };
}

function resolveRequestValue<TPayload, TValues, TValue>(
	value:
		| TValue
		| ((context: ActionRunContext<TPayload, TValues>) => TValue)
		| undefined,
	context: ActionRunContext<TPayload, TValues>,
): TValue | undefined {
	if (typeof value === 'function') {
		return (value as (context: ActionRunContext<TPayload, TValues>) => TValue)(context);
	}
	return value;
}

export function extractActionFieldErrors(error: unknown): ActionFieldErrors {
	if (!error || typeof error !== 'object') return EMPTY_ERRORS;
	const maybeErrors = (error as { errors?: unknown }).errors;
	if (!maybeErrors || typeof maybeErrors !== 'object' || Array.isArray(maybeErrors)) {
		return EMPTY_ERRORS;
	}

	const result: ActionFieldErrors = {};
	for (const [key, value] of Object.entries(maybeErrors)) {
		if (typeof value === 'string') {
			result[key] = value;
			continue;
		}
		if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
			result[key] = value;
		}
	}
	return Object.keys(result).length > 0 ? result : EMPTY_ERRORS;
}

export function resolveActionMessage<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	message: ActionMessage<TPayload, TValues, TResult> | undefined,
	context: ActionMessageContext<TPayload, TValues, TResult>,
): string | undefined {
	if (message === undefined) return undefined;
	if (typeof message === 'function') {
		const resolved = message(context);
		return resolved ?? undefined;
	}
	return message;
}

export function resolveActionRequest<TPayload = unknown, TValues = unknown>(
	request: ActionRequestConfig<TPayload, TValues>,
	context: ActionRunContext<TPayload, TValues>,
): ResolvedActionRequest {
	const target = resolveRequestValue(request.target, context);

	return {
		method: request.method,
		target,
		data: resolveRequestValue(request.data, context),
		headers: resolveRequestValue(request.headers, context),
		options: resolveRequestValue(request.options, context),
	};
}

export function parseActionError<TPayload = unknown, TValues = unknown>(
	error: unknown,
	context: ActionErrorParseContext<TPayload, TValues>,
	parser?: ActionErrorParser,
): ParsedActionError {
	const parsed = parser?.(error, context as ActionErrorParseContext);
	return normalizeParsedError(parsed, error);
}

export class ActionStore {
	private registrations: ActionRegistration[] = [];
	private runStates: Record<string, ActionRunState> = {};
	private active: ActionStoreSnapshot['active'] = null;
	private version = 0;
	private snapshot: ActionStoreSnapshot = createSnapshot(0, [], {}, null);
	private readonly listeners = new Set<() => void>();
	private feedback: ActionFeedbackHandlers | undefined;
	private guards: ActionGuards | undefined;
	private errorParser: ActionErrorParser | undefined;
	private requestRunner: ActionRequestRunner | undefined;
	private readonly abortControllers = new Map<string, AbortController>();
	private readonly runTokens = new Map<string, number>();

	subscribe = (listener: () => void): (() => void) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	getSnapshot = (): ActionStoreSnapshot => this.snapshot;

	setFeedback(feedback?: ActionFeedbackHandlers): void {
		this.feedback = feedback;
	}

	setOptions(options: {
		feedback?: ActionFeedbackHandlers;
		guards?: ActionGuards;
		parseErrors?: ActionErrorParser;
		requestRunner?: ActionRequestRunner;
	}): void {
		const shouldPublish =
			this.feedback !== options.feedback ||
			this.guards !== options.guards ||
			this.errorParser !== options.parseErrors ||
			this.requestRunner !== options.requestRunner;
		this.feedback = options.feedback;
		this.guards = options.guards;
		this.errorParser = options.parseErrors;
		this.requestRunner = options.requestRunner;
		if (shouldPublish) this.publish();
	}

	registerActions<TPayload = unknown, TValues = unknown, TResult = unknown>(
		actions: readonly ActionDefinition<TPayload, TValues, TResult>[],
		options: ActionRegistrationOptions = {},
	): () => void {
		if (actions.length === 0) return () => undefined;

		const registration: ActionRegistration = {
			id: `registration-${nextRegistrationId++}`,
			scope: resolveScope(options.scope),
			order: this.registrations.length,
			actions: actions as readonly ActionDefinition[],
		};

		this.registrations = [...this.registrations, registration];
		this.publish();

		return () => {
			this.registrations = this.registrations.filter((item) => item.id !== registration.id);
			const removedKeys = registration.actions.map((action) =>
				createActionKey(registration.id, action.id),
			);
			for (const key of removedKeys) {
				this.abortAction(key);
				delete this.runStates[key];
			}
			if (this.active && removedKeys.includes(this.active.key)) {
				this.active = null;
			}
			this.publish();
		};
	}

	selectSurfaceActions<TPayload = unknown, TValues = unknown, TResult = unknown>(
		options: ActionSurfaceOptions<TPayload>,
	): ResolvedAction<TPayload, TValues, TResult>[] {
		const entries = this.getEntriesForScope(options.scope, options.includeGlobal);
		const result: ResolvedAction<TPayload, TValues, TResult>[] = [];

		for (const entry of entries) {
			const surfaces = getDefaultSurfaces(entry.action);
			if (!surfaces.includes(options.surface)) continue;

			const resolved = this.resolveEntry<TPayload, TValues, TResult>(entry, {
				surface: options.surface,
				payload: options.payload,
				metadata: options.metadata,
			});
			if (resolved.visible) result.push(resolved);
		}

		return result.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
	}

	selectAction<TPayload = unknown, TValues = unknown, TResult = unknown>(
		actionId: string,
		options: UseActionOptions<TPayload> = {},
	): ResolvedAction<TPayload, TValues, TResult> | null {
		const entries = this.getEntriesForScope(options.scope, options.includeGlobal);
		for (let index = entries.length - 1; index >= 0; index -= 1) {
			const entry = entries[index];
			// `noUncheckedIndexedAccess` cannot narrow a reverse indexed loop.
			if (!entry || entry.action.id !== actionId) continue;
			const resolved = this.resolveEntry<TPayload, TValues, TResult>(entry, {
				payload: options.payload,
				metadata: options.metadata,
			});
			return resolved.visible ? resolved : null;
		}
		return null;
	}

	getActiveAction<TPayload = unknown, TValues = unknown, TResult = unknown>():
		| ResolvedAction<TPayload, TValues, TResult>
		| null {
		const active = this.snapshot.active;
		if (!active) return null;
		const entry = this.findEntry(active.key);
		if (!entry) return null;
		return this.resolveEntry<TPayload, TValues, TResult>(entry, {
			payload: active.payload as TPayload | undefined,
			metadata: active.metadata,
		});
	}

	openAction<TPayload = unknown>(key: string, payload?: TPayload, metadata?: ActionMetadata): void {
		const entry = this.findEntry(key);
		if (!entry) return;
		if (this.isEntryDisabled(entry, payload, metadata)) return;

		if (!entry.action.modality || entry.action.modality === 'none') {
			void this.executeAction(key, { payload, metadata });
			return;
		}

		this.active = {
			key,
			actionId: entry.action.id,
			scope: entry.registration.scope,
			payload,
			metadata,
		};
		this.setRunState(key, createRunState('idle', {
			error: null,
			errors: EMPTY_ERRORS,
			message: undefined,
			payload,
			values: undefined,
			metadata: mergeMetadata(entry.action.metadata, metadata),
		}), false);
		this.publish();
	}

	closeActive(options: { abort?: boolean } = {}): void {
		const active = this.active;
		if (!active) return;
		if (options.abort !== false) {
			this.abortAction(active.key);
		}
		this.active = null;
		this.publish();
	}

	async submitActive<TValues = unknown, TResult = unknown>(
		values?: TValues,
	): Promise<TResult | undefined> {
		const active = this.active;
		if (!active) return undefined;
		this.active = { ...active, values };
		this.publish();
		const result = await this.executeAction<unknown, TValues, TResult>(active.key, {
			payload: active.payload,
			values,
			metadata: active.metadata,
		});
		const entry = this.findEntry(active.key);
		const closeOnSuccess =
			entry?.action.modality &&
			entry.action.modality !== 'none' &&
			entry.action.modality.closeOnSuccess === false
				? false
				: true;
		if (closeOnSuccess && this.active?.key === active.key) {
			this.closeActive({ abort: false });
		}
		return result;
	}

	async executeAction<TPayload = unknown, TValues = unknown, TResult = unknown>(
		key: string,
		args: {
			payload?: TPayload;
			values?: TValues;
			metadata?: ActionMetadata;
		} = {},
	): Promise<TResult | undefined> {
		const entry = this.findEntry(key);
		if (!entry) {
			throw new Error(`Action is not registered: ${key}`);
		}
		if (this.isEntryDisabled(entry, args.payload, args.metadata)) {
			return undefined;
		}

		this.abortAction(key);
		const token = (this.runTokens.get(key) ?? 0) + 1;
		this.runTokens.set(key, token);
		const abortController = new AbortController();
		this.abortControllers.set(key, abortController);
		const metadata = mergeMetadata(entry.action.metadata, args.metadata);
		const startedAt = Date.now();

		const context = this.createRunContext<TPayload, TValues>(entry, {
			payload: args.payload,
			values: args.values,
			metadata,
			signal: abortController.signal,
		});

		this.setRunState(key, createRunState('running', {
			error: null,
			errors: EMPTY_ERRORS,
			message: undefined,
			payload: args.payload,
			values: args.values,
			metadata,
			startedAt,
		}));
		this.emitLifecycle('started', entry, context, key);

		let result: TResult | undefined;
		let failedError: unknown;
		const action = entry.action as ActionDefinition<TPayload, TValues, TResult>;
		try {
			if (action.run) {
				result = await action.run(context);
			} else if (action.request) {
				const runner = action.requestRunner ?? this.requestRunner;
				if (!runner) {
					throw new Error(
						`Action request runner is not configured: ${action.id}`,
					);
				}
				const request = resolveActionRequest(action.request, context);
				result = await runner(request, context) as TResult;
			}
			if (!this.isCurrentRun(key, token)) return undefined;

			this.setRunState(key, createRunState('succeeded', {
				error: null,
				errors: EMPTY_ERRORS,
				message: undefined,
				result,
				payload: args.payload,
				values: args.values,
				metadata,
				startedAt,
				completedAt: Date.now(),
			}));
			this.emitLifecycle('succeeded', entry, context, key, { result });
			return result;
		} catch (error) {
			if (!this.isCurrentRun(key, token)) return undefined;
			failedError = error;
			const parsedError = parseActionError(
				error,
				{ ...context, error },
				action.parseErrors ?? this.errorParser,
			);
			const errors = parsedError.fieldErrors ?? EMPTY_ERRORS;
			this.setRunState(key, createRunState('failed', {
				error,
				errors,
				message: parsedError.message,
				payload: args.payload,
				values: args.values,
				metadata,
				startedAt,
				completedAt: Date.now(),
			}));
			this.emitLifecycle('failed', entry, context, key, {
				error,
				message: parsedError.message,
			});
			throw error;
		} finally {
			if (this.isCurrentRun(key, token)) {
				this.abortControllers.delete(key);
				this.emitLifecycle('settled', entry, context, key, {
					result,
					error: failedError,
				});
			}
		}
	}

	private getEntriesForScope(scope?: string, includeGlobal = true): ActionEntry[] {
		const resolvedScope = scope ? resolveScope(scope) : ACTION_GLOBAL_SCOPE;
		const entries: ActionEntry[] = [];

		for (const registration of this.snapshot.registrations) {
			const isGlobal = registration.scope === ACTION_GLOBAL_SCOPE;
			if (isGlobal && !includeGlobal) continue;
			if (!isGlobal && registration.scope !== resolvedScope) continue;

			for (const action of registration.actions) {
				entries.push({
					key: createActionKey(registration.id, action.id),
					registration,
					action,
				});
			}
		}

		return entries;
	}

	private resolveEntry<TPayload, TValues, TResult>(
		entry: ActionEntry,
		args: {
			surface?: ActionSurfaceOptions['surface'];
			payload?: TPayload;
			metadata?: ActionMetadata;
		},
	): ResolvedAction<TPayload, TValues, TResult> {
		const metadata = mergeMetadata(entry.action.metadata, args.metadata);
		const context: ActionContext<TPayload> = {
			actionId: entry.action.id,
			scope: entry.registration.scope,
			surface: args.surface,
			payload: args.payload,
			metadata,
		};
		const runState = this.getRunState(entry.key);
		const visible = this.isEntryVisible(entry, context);
		const disabled = evaluatePredicate(
			entry.action.disabled as ActionDefinition<TPayload>['visible'],
			context,
			false,
		);
		const action = entry.action as ActionDefinition<TPayload, TValues, TResult>;

		return {
			key: entry.key,
			id: entry.action.id,
			scope: entry.registration.scope,
			label: entry.action.label,
			searchLabel: resolveSearchLabel(entry.action),
			icon: entry.action.icon,
			group: entry.action.group,
			placement: entry.action.placement ?? 'auto',
			order: entry.action.order ?? entry.registration.order,
			surface: args.surface,
			visible,
			disabled,
			status: runState.status,
			isIdle: runState.isIdle,
			isRunning: runState.isRunning,
			isSuccess: runState.isSuccess,
			isError: runState.isError,
			error: runState.error,
			errors: runState.errors,
			message: runState.message,
			result: runState.result as TResult | undefined,
			runState,
			payload: args.payload,
			values: runState.values as TValues | undefined,
			metadata,
			startedAt: runState.startedAt,
			completedAt: runState.completedAt,
			definition: action,
			open: (payload?: TPayload, openMetadata?: ActionMetadata) =>
				this.openAction(
					entry.key,
					payload ?? args.payload,
					mergeMetadata(args.metadata, openMetadata),
				),
			execute: (values?: TValues, payload?: TPayload, executeMetadata?: ActionMetadata) =>
				this.executeAction<TPayload, TValues, TResult>(entry.key, {
					payload: payload ?? args.payload,
					values,
					metadata: mergeMetadata(args.metadata, executeMetadata),
				}),
			close: () => this.closeActive(),
			submit: (values?: TValues) => this.submitActive<TValues, TResult>(values),
		};
	}

	private createRunContext<TPayload, TValues>(
		entry: ActionEntry,
		args: {
			payload?: TPayload;
			values?: TValues;
			metadata?: ActionMetadata;
			signal: AbortSignal;
		},
	): ActionRunContext<TPayload, TValues> {
		return {
			action: entry.action,
			actionId: entry.action.id,
			scope: entry.registration.scope,
			payload: args.payload,
			values: args.values,
			metadata: args.metadata,
			signal: args.signal,
		};
	}

	private isEntryDisabled<TPayload>(
		entry: ActionEntry,
		payload?: TPayload,
		metadata?: ActionMetadata,
	): boolean {
		const context: ActionContext<TPayload> = {
			actionId: entry.action.id,
			scope: entry.registration.scope,
			payload,
			metadata: mergeMetadata(entry.action.metadata, metadata),
		};
		if (!this.isEntryVisible(entry, context)) return true;
		return evaluatePredicate(
			entry.action.disabled as ActionDefinition<TPayload>['disabled'],
			context,
			false,
		);
	}

	private isEntryVisible<TPayload>(
		entry: ActionEntry,
		context: ActionContext<TPayload>,
	): boolean {
		const predicateVisible = evaluatePredicate(
			entry.action.visible as ActionDefinition<TPayload>['visible'],
			context,
			true,
		);
		if (!predicateVisible) return false;

		const guardContext = {
			...context,
			action: entry.action,
		};
		const permissions = toStringArray(entry.action.permission);
		if (permissions.length > 0) {
			if (!this.guards?.can) return false;
			if (!permissions.every((permission) =>
				this.guards?.can?.(permission, guardContext),
			)) {
				return false;
			}
		}

		const roles = toStringArray(entry.action.roles);
		if (roles.length > 0) {
			if (!this.guards?.hasAnyRole) return false;
			if (!this.guards.hasAnyRole(roles, guardContext)) return false;
		}

		return true;
	}

	private emitLifecycle<TPayload, TValues, TResult>(
		type: ActionLifecycleType,
		entry: ActionEntry,
		context: ActionRunContext<TPayload, TValues>,
		key: string,
		args: { result?: TResult; error?: unknown; message?: string } = {},
	): void {
		const action = entry.action as ActionDefinition<TPayload, TValues, TResult>;
		const runState = this.getRunState(key);
		const messageContext: ActionMessageContext<TPayload, TValues, TResult> = {
			...context,
			action: entry.action,
			status: runState.status,
			errors: runState.errors,
			result: args.result,
			error: args.error,
		};
		const message =
			type === 'succeeded'
				? resolveActionMessage(action.successMessage, messageContext)
				: type === 'failed'
					? resolveActionMessage(action.errorMessage, messageContext) ?? args.message
					: undefined;
		const event: ActionLifecycleEvent<TPayload, TValues, TResult> = {
			...messageContext,
			type,
			key,
			status: runState.status,
			runState,
			message,
		};

		if (type === 'started') action.onStart?.(event);
		if (type === 'succeeded') action.onAfterMutate?.(event);
		if (type === 'failed') action.onError?.(event);
		if (type === 'settled') action.onSettled?.(event);

		if (type === 'started') this.feedback?.onStart?.(event as ActionLifecycleEvent);
		if (type === 'succeeded') this.feedback?.onSuccess?.(event as ActionLifecycleEvent);
		if (type === 'failed') this.feedback?.onError?.(event as ActionLifecycleEvent);
		if (type === 'settled') this.feedback?.onSettled?.(event as ActionLifecycleEvent);
	}

	private findEntry(key: string): ActionEntry | null {
		for (const registration of this.snapshot.registrations) {
			for (const action of registration.actions) {
				if (createActionKey(registration.id, action.id) === key) {
					return { key, registration, action };
				}
			}
		}
		return null;
	}

	private getRunState(key: string): ActionRunState {
		return this.snapshot.runStates[key] ?? createRunState('idle');
	}

	private setRunState(key: string, state: ActionRunState, shouldPublish = true): void {
		this.runStates = {
			...this.runStates,
			[key]: {
				...state,
				errors: state.errors ?? EMPTY_ERRORS,
			},
		};
		if (shouldPublish) this.publish();
	}

	private abortAction(key: string): void {
		const controller = this.abortControllers.get(key);
		if (!controller) return;
		const previous = this.getRunState(key);
		this.runTokens.set(key, (this.runTokens.get(key) ?? 0) + 1);
		controller.abort();
		this.abortControllers.delete(key);
		this.setRunState(key, createRunState('idle', {
			...previous,
			error: null,
			errors: EMPTY_ERRORS,
			completedAt: Date.now(),
		}), false);
	}

	private isCurrentRun(key: string, token: number): boolean {
		return this.runTokens.get(key) === token;
	}

	private publish(): void {
		this.version += 1;
		this.snapshot = createSnapshot(
			this.version,
			this.registrations,
			this.runStates,
			this.active,
		);
		for (const listener of this.listeners) listener();
	}
}

export function createActionStore(): ActionStore {
	return new ActionStore();
}

/* Contexts and the store hook live here, not beside the provider, so that file stays hot-reloadable. */
export const ActionStoreContext = createContext<ActionStore | null>(null);
export const ActionScopeContext = createContext<string | null>(null);

export function useActionStore(): ActionStore {
	const store = useContext(ActionStoreContext);
	if (!store) {
		throw new Error('Action hooks must be used inside <ActionProvider>.');
	}
	return store;
}
