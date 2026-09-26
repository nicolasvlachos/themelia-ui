import { createElement } from 'react';

import type {
	ActionDefinition,
	ActionMetadata,
	ActionModalityConfig,
	ActionRequestRunner,
	ResolvedAction,
	ResolvedActionRequest,
} from './actions.types';

export interface ActionHttpErrorOptions {
	status: number;
	statusText: string;
	body: unknown;
	response: Response;
}

export class ActionHttpError extends Error {
	status: number;
	statusText: string;
	body: unknown;
	response: Response;
	errors?: unknown;

	constructor({ status, statusText, body, response }: ActionHttpErrorOptions) {
		super(statusText || `Request failed with status ${status}`);
		this.name = 'ActionHttpError';
		this.status = status;
		this.statusText = statusText;
		this.body = body;
		this.response = response;
		this.errors =
			body && typeof body === 'object' && 'errors' in body
				? (body as { errors?: unknown }).errors
				: undefined;
	}
}

export interface CreateHttpActionRunnerOptions {
	baseUrl?: string;
	fetcher?: typeof fetch;
	parseResponse?: (response: Response) => Promise<unknown>;
}

async function defaultParseResponse(response: Response): Promise<unknown> {
	if (response.status === 204) return undefined;
	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) return response.json();
	return response.text();
}

function resolveUrlTarget(request: ResolvedActionRequest): string | undefined {
	if (request.target?.type === 'url') return request.target.url;
	return undefined;
}

function joinUrl(baseUrl: string | undefined, url: string | undefined): string {
	if (!url) {
		throw new Error('Action request requires a url.');
	}
	if (!baseUrl) return url;
	return new URL(url, baseUrl).toString();
}

function serializeBody(data: unknown): BodyInit | undefined {
	if (data === undefined || data === null) return undefined;
	if (
		typeof FormData !== 'undefined' && data instanceof FormData ||
		typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams ||
		typeof Blob !== 'undefined' && data instanceof Blob
	) {
		return data;
	}
	if (typeof data === 'string') return data;
	return JSON.stringify(data);
}

export function createHttpActionRunner<TResult = unknown>({
	baseUrl,
	fetcher = fetch,
	parseResponse = defaultParseResponse,
}: CreateHttpActionRunnerOptions = {}): ActionRequestRunner<TResult> {
	return async (request, context) => {
		const method = request.method.toUpperCase();
		const body = method === 'GET' ? undefined : serializeBody(request.data);
		const isFormDataBody = typeof FormData !== 'undefined' && body instanceof FormData;
		const headers = {
			...(body && !isFormDataBody ? { 'Content-Type': 'application/json' } : {}),
			...request.headers,
		};
		const response = await fetcher(joinUrl(baseUrl, resolveUrlTarget(request)), {
			...(request.options as RequestInit | undefined),
			method,
			headers,
			body,
			signal: context.signal,
		});
		const parsed = await parseResponse(response);
		if (!response.ok) {
			throw new ActionHttpError({
				status: response.status,
				statusText: response.statusText,
				body: parsed,
				response,
			});
		}
		return parsed as TResult;
	};
}

export function defineAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	definition: ActionDefinition<TPayload, TValues, TResult>,
): ActionDefinition<TPayload, TValues, TResult> {
	return definition;
}

export function defineDeleteAction<
	TPayload = unknown,
	TResult = unknown,
>(
	definition: Omit<ActionDefinition<TPayload, undefined, TResult>, 'modality'> & {
		modality: Omit<
			ActionModalityConfig<TPayload, undefined, TResult>,
			'type' | 'tone'
		> & Partial<Pick<ActionModalityConfig<TPayload, undefined, TResult>, 'type' | 'tone'>>;
	},
): ActionDefinition<TPayload, undefined, TResult> {
	return {
		...definition,
		tone: definition.tone ?? 'destructive',
		modality: {
			type: 'alert',
			tone: 'destructive',
			...definition.modality,
		},
	};
}

export function defineFormAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	definition: Omit<ActionDefinition<TPayload, TValues, TResult>, 'modality'> & {
		modality: Omit<
			ActionModalityConfig<TPayload, TValues, TResult>,
			'type'
		> & Partial<Pick<ActionModalityConfig<TPayload, TValues, TResult>, 'type'>>;
	},
): ActionDefinition<TPayload, TValues, TResult> {
	return {
		...definition,
		modality: {
			type: 'dialog',
			...definition.modality,
		},
	};
}

export function defineSilentAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	definition: Omit<ActionDefinition<TPayload, TValues, TResult>, 'modality'>,
): ActionDefinition<TPayload, TValues, TResult> {
	return {
		...definition,
		modality: 'none',
	};
}

type ActionPresentationSource = {
	definition: {
		tone?: string;
		buttonStyle?: string;
		modality?: 'none' | {
			tone?: string;
		};
	};
};
type ActionLabelSource = {
	id: string;
	searchLabel: string;
};

function getActionTone(action: ActionPresentationSource) {
	const modalityTone =
		action.definition.modality && action.definition.modality !== 'none'
			? action.definition.modality.tone
			: undefined;
	const tone = action.definition.tone ?? modalityTone;
	if (tone === 'destructive') return 'destructive' as const;
	if (tone === 'warning') return 'warning';
	if (tone === 'success') return 'success';
	if (tone === 'info') return 'info';
	if (tone === 'neutral') return 'neutral';
	if (tone === 'primary') return 'primary';
	if (tone === 'secondary') return 'secondary';
	return undefined;
}

function getActionButtonStyle(action: ActionPresentationSource) {
	const style = action.definition.buttonStyle;
	if (style === 'solid' || style === 'outline' || style === 'ghost' || style === 'link') {
		return style;
	}
	return undefined;
}

function getActionLabel(action: ActionLabelSource): string {
	return action.searchLabel || action.id;
}

export function toPageAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(action: ResolvedAction<TPayload, TValues, TResult>) {
	return {
		id: action.id,
		label: action.label,
		onClick: () => action.open(),
		disabled: action.disabled,
		loading: action.isRunning,
		icon: action.icon,
		tone: getActionTone(action),
		buttonStyle: getActionButtonStyle(action),
		visible: action.visible,
		group: action.group,
		placement: action.placement,
	};
}

export function toMenuAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(action: ResolvedAction<TPayload, TValues, TResult>) {
	return {
		label: getActionLabel(action),
		onClick: () => action.open(),
		disabled: action.disabled || action.isRunning,
		icon: action.icon,
		tone: getActionTone(action) ?? 'secondary',
		buttonStyle: getActionButtonStyle(action),
	};
}

export function toTableAction<TData = unknown>(action: ResolvedAction<TData>) {
	return {
		id: action.id,
		label: getActionLabel(action),
		onClick: (row: TData) => action.open(row),
		disabled: action.disabled,
		isDisabled: () => action.disabled || action.isRunning,
		isVisible: () => action.visible,
		icon: action.icon ? createElement(action.icon, { className: 'size-4' }) : undefined,
		tone: getActionTone(action) ?? 'secondary',
		buttonStyle: getActionButtonStyle(action),
	};
}

export function toCommandAction<
	TPayload = unknown,
	TValues = unknown,
	TResult = unknown,
>(
	action: ResolvedAction<TPayload, TValues, TResult>,
	metadata?: ActionMetadata,
) {
	return {
		id: action.id,
		label: getActionLabel(action),
		group: action.group,
		disabled: action.disabled || action.isRunning,
		icon: action.icon,
		onSelect: () => action.open(undefined, metadata),
	};
}
