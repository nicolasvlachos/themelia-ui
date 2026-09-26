import type {
	ComponentType,
	FormEvent,
	FormEventHandler,
	ReactNode,
	RefObject,
} from 'react';

import type { StringsProp } from '@/lib/strings';
import type { SemanticTone } from '@/lib/component-vocabulary';
import type { ActionButtonStyle, ActionPresentation } from '@/lib/action-presentation';

export type { ActionButtonStyle } from '@/lib/action-presentation';

export const ACTION_GLOBAL_SCOPE = '__global__';

export type ActionSurface =
	| 'page'
	| 'table'
	| 'table-row'
	| 'card'
	| 'command'
	| (string & {});

export type ActionPlacement = 'auto' | 'inline' | 'menu';
export type ActionModalityType = 'alert' | 'dialog' | 'drawer';
export type ActionTone = SemanticTone;
export type ActionStatus = 'idle' | 'running' | 'succeeded' | 'failed';
export type ActionOverlaySize =
	| 'xs'
	| 'sm'
	| 'md'
	| 'lg'
	| 'xl'
	| '2xl'
	| '3xl'
	| '4xl'
	| '5xl'
	| 'full';
export type ActionDrawerDirection = 'left' | 'right' | 'top' | 'bottom';
export type ActionRequestMethod =
	| 'get'
	| 'post'
	| 'put'
	| 'patch'
	| 'delete';

export type ActionRequestTarget =
	| { type: 'url'; url: string }
	| { type: 'named'; name: string; params?: unknown };

export type ActionFieldErrors = Record<string, string | string[]>;
export type ActionMetadata = Record<string, unknown>;
type BivariantCallback<TArgs extends readonly unknown[], TResult> = {
	bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

export interface ActionContext<TPayload = unknown> {
	actionId: string;
	scope: string;
	surface?: ActionSurface;
	payload: TPayload | undefined;
	metadata?: ActionMetadata;
}

export interface ActionGuardContext<TPayload = unknown>
	extends ActionContext<TPayload> {
	action: ActionDefinition;
}

export interface ActionMessageContext<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> extends ActionContext<TPayload> {
	action: ActionDefinition;
	values: TValues | undefined;
	status?: ActionStatus;
	errors?: ActionFieldErrors;
	result?: TResult;
	error?: unknown;
}

export type ActionMessage<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> =
	| string
	| BivariantCallback<
			[context: ActionMessageContext<TPayload, TValues, TResult>],
			string | null | undefined
	  >;

export interface ActionRunContext<TPayload = unknown, TValues = unknown>
	extends ActionContext<TPayload> {
	action: ActionDefinition;
	values: TValues | undefined;
	signal: AbortSignal;
}

export interface ActionErrorParseContext<TPayload = unknown, TValues = unknown>
	extends ActionRunContext<TPayload, TValues> {
	error: unknown;
}

export interface ActionRenderContext<TPayload = unknown, TValues = unknown>
	extends ActionContext<TPayload> {
	action: ActionDefinition;
	values: TValues | undefined;
	formId?: string;
	status: ActionStatus;
	isIdle: boolean;
	isRunning: boolean;
	isSuccess: boolean;
	isError: boolean;
	result: unknown;
	error: unknown;
	errors: ActionFieldErrors;
	close: () => void;
	submit: (values?: TValues) => Promise<unknown>;
	getFormProps: (options?: ActionFormSubmitOptions<TValues>) => ActionFormProps;
}

export interface ActionFormSubmitOptions<TValues = unknown> {
	resolveValues?: (
		formData: FormData,
		event: FormEvent<HTMLFormElement>,
	) => TValues | Promise<TValues>;
}

export interface ActionFormProps {
	id?: string;
	onSubmit: FormEventHandler<HTMLFormElement>;
}

export type ActionRequestValue<
	TPayload = unknown,
	TValues = unknown,
	TValue = unknown,
> =
	| TValue
	| BivariantCallback<
			[context: ActionRunContext<TPayload, TValues>],
			TValue
	  >;

export interface ActionRequestConfig<
	TPayload = unknown,
	TValues = unknown,
> {
	method: ActionRequestMethod;
	target?: ActionRequestValue<TPayload, TValues, ActionRequestTarget>;
	data?: ActionRequestValue<TPayload, TValues, unknown>;
	headers?: ActionRequestValue<
		TPayload,
		TValues,
		Record<string, string>
	>;
	options?: ActionRequestValue<
		TPayload,
		TValues,
		Record<string, unknown>
	>;
}

export interface ResolvedActionRequest {
	method: ActionRequestMethod;
	target?: ActionRequestTarget;
	data?: unknown;
	headers?: Record<string, string>;
	options?: Record<string, unknown>;
}

export type ActionRequestRunner<TResult = unknown> = BivariantCallback<
	[
		request: ResolvedActionRequest,
		context: ActionRunContext,
	],
	TResult | Promise<TResult>
>;

export interface ParsedActionError {
	fieldErrors?: ActionFieldErrors;
	message?: string;
}

export type ActionErrorParser = BivariantCallback<
	[
		error: unknown,
		context: ActionErrorParseContext,
	],
	ParsedActionError | ActionFieldErrors | string | null | undefined
>;

export interface ActionModalityConfig<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> {
	type: ActionModalityType;
	title: ActionMessage<TPayload, TValues, TResult>;
	description?: ActionMessage<TPayload, TValues, TResult>;
	confirmLabel?: ActionMessage<TPayload, TValues, TResult>;
	cancelLabel?: ActionMessage<TPayload, TValues, TResult>;
	tone?: ActionTone;
	size?: ActionOverlaySize;
	drawerDirection?: ActionDrawerDirection;
	formId?: string;
	showCancel?: boolean;
	showConfirm?: boolean;
	showIcon?: boolean;
	emphasis?: boolean;
	showFooter?: boolean;
	visuallyHideHeader?: boolean;
	className?: string;
	contentClassName?: string;
	initialFocusRef?: RefObject<HTMLElement>;
	closeOnEscape?: boolean;
	closeOnSuccess?: boolean;
	closeOnBackdropClick?: boolean;
	confirmStyle?: Extract<ActionButtonStyle, 'solid' | 'outline'>;
	footer?: ReactNode;
	alertMessage?: ActionMessage<TPayload, TValues, TResult>;
	render?: BivariantCallback<
		[context: ActionRenderContext<TPayload, TValues>],
		ReactNode
	>;
}

export type ActionPredicate<TPayload = unknown> =
	| boolean
	| BivariantCallback<[context: ActionContext<TPayload>], boolean>;

export type ActionPermission = string | readonly string[];
export type ActionRoles = string | readonly string[];

export interface ActionDefinition<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> extends Omit<ActionPresentation, 'visible' | 'disabled'> {
	id: string;
	label: ReactNode;
	searchLabel?: string;
	icon?: ComponentType<{ className?: string }>;
	surfaces?: readonly ActionSurface[];
	group?: string;
	placement?: ActionPlacement;
	order?: number;
	visible?: ActionPredicate<TPayload>;
	disabled?: ActionPredicate<TPayload>;
	permission?: ActionPermission;
	roles?: ActionRoles;
	modality?: 'none' | ActionModalityConfig<TPayload, TValues, TResult>;
	request?: ActionRequestConfig<TPayload, TValues>;
	requestRunner?: ActionRequestRunner<TResult>;
	run?: BivariantCallback<
		[context: ActionRunContext<TPayload, TValues>],
		TResult | Promise<TResult>
	>;
	parseErrors?: ActionErrorParser;
	successMessage?: ActionMessage<TPayload, TValues, TResult>;
	errorMessage?: ActionMessage<TPayload, TValues, TResult>;
	onStart?: BivariantCallback<
		[event: ActionLifecycleEvent<TPayload, TValues, TResult>],
		void
	>;
	onAfterMutate?: BivariantCallback<
		[event: ActionLifecycleEvent<TPayload, TValues, TResult>],
		void
	>;
	onError?: BivariantCallback<
		[event: ActionLifecycleEvent<TPayload, TValues, TResult>],
		void
	>;
	onSettled?: BivariantCallback<
		[event: ActionLifecycleEvent<TPayload, TValues, TResult>],
		void
	>;
	metadata?: ActionMetadata;
}

export interface ActionRegistrationOptions {
	scope?: string;
}

export interface ActionRegistration {
	id: string;
	scope: string;
	order: number;
	actions: readonly ActionDefinition[];
}

export interface ActionSurfaceOptions<TPayload = unknown> {
	surface: ActionSurface;
	scope?: string;
	includeGlobal?: boolean;
	payload?: TPayload;
	metadata?: ActionMetadata;
}

export interface UseActionOptions<TPayload = unknown> {
	scope?: string;
	includeGlobal?: boolean;
	payload?: TPayload;
	metadata?: ActionMetadata;
}

export interface ActionRunState {
	status: ActionStatus;
	isIdle: boolean;
	isRunning: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: unknown;
	errors: ActionFieldErrors;
	message?: string;
	result?: unknown;
	payload?: unknown;
	values?: unknown;
	metadata?: ActionMetadata;
	startedAt?: number;
	completedAt?: number;
}

export interface ActiveActionState {
	key: string;
	actionId: string;
	scope: string;
	payload?: unknown;
	values?: unknown;
	metadata?: ActionMetadata;
}

export interface ActionStoreSnapshot {
	version: number;
	registrations: readonly ActionRegistration[];
	runStates: Readonly<Record<string, ActionRunState>>;
	active: ActiveActionState | null;
}

export interface ResolvedAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> {
	key: string;
	id: string;
	scope: string;
	label: ReactNode;
	searchLabel: string;
	icon?: ComponentType<{ className?: string }>;
	group?: string;
	placement: ActionPlacement;
	order: number;
	surface?: ActionSurface;
	visible: boolean;
	disabled: boolean;
	status: ActionStatus;
	isIdle: boolean;
	isRunning: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: unknown;
	errors: ActionFieldErrors;
	message?: string;
	result: TResult | undefined;
	runState: ActionRunState;
	payload: TPayload | undefined;
	values: TValues | undefined;
	metadata?: ActionMetadata;
	startedAt?: number;
	completedAt?: number;
	definition: ActionDefinition<TPayload, TValues, TResult>;
	open: (payload?: TPayload, metadata?: ActionMetadata) => void;
	execute: (
		values?: TValues,
		payload?: TPayload,
		metadata?: ActionMetadata,
	) => Promise<TResult | undefined>;
	close: () => void;
	submit: (values?: TValues) => Promise<TResult | undefined>;
}

export type ActionLifecycleType = 'started' | 'succeeded' | 'failed' | 'settled';

export interface ActionLifecycleEvent<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> extends ActionMessageContext<TPayload, TValues, TResult> {
	type: ActionLifecycleType;
	key: string;
	status: ActionStatus;
	runState: ActionRunState;
	message?: string;
}

export interface ActionFeedbackHandlers {
	onStart?: (event: ActionLifecycleEvent) => void;
	onSuccess?: (event: ActionLifecycleEvent) => void;
	onError?: (event: ActionLifecycleEvent) => void;
	onSettled?: (event: ActionLifecycleEvent) => void;
}

export interface ActionGuards {
	can?: (
		permission: string,
		context: ActionGuardContext,
	) => boolean;
	hasAnyRole?: (
		roles: readonly string[],
		context: ActionGuardContext,
	) => boolean;
}

export interface ActionRuntimeGlue {
	requestRunner?: ActionRequestRunner;
	parseErrors?: ActionErrorParser;
	guards?: ActionGuards;
	feedback?: ActionFeedbackHandlers;
	onOverlayOpenChange?: (
		open: boolean,
		snapshot: ActionStoreSnapshot,
	) => void;
	onRunningChange?: (
		running: boolean,
		snapshot: ActionStoreSnapshot,
	) => void;
}

export interface ActionProviderProps<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> {
	actions?: readonly ActionDefinition<TPayload, TValues, TResult>[];
	runtime?: ActionRuntimeGlue;
	feedback?: ActionFeedbackHandlers;
	guards?: ActionGuards;
	parseErrors?: ActionErrorParser;
	requestRunner?: ActionRequestRunner;
	onOverlayOpenChange?: (
		open: boolean,
		snapshot: ActionStoreSnapshot,
	) => void;
	onRunningChange?: (
		running: boolean,
		snapshot: ActionStoreSnapshot,
	) => void;
	children: ReactNode;
}

export interface ActionScopeProps<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
> extends ActionRegistrationOptions {
	actions: readonly ActionDefinition<TPayload, TValues, TResult>[];
	children: ReactNode;
}

export interface ActionOverlayStrings {
	confirm: string;
	cancel: string;
}

export interface ActionOverlayOutletProps {
	strings?: StringsProp<ActionOverlayStrings>;
}

export interface ActionEntry {
	key: string;
	registration: ActionRegistration;
	action: ActionDefinition;
}

export interface UseLocalActionOptions<TPayload = unknown>
	extends UseActionOptions<TPayload> {
	scope?: string;
}
