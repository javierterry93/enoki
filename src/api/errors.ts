export class ApiError extends Error {
	cause?: unknown;

	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.cause = cause;
	}
}

export function wrapApiError(message: string, error: unknown): ApiError {
	if (error instanceof ApiError) return error;

	const detail =
		error && typeof error === 'object' && 'message' in error
			? String((error as { message: unknown }).message)
			: String(error);

	return new ApiError(`${message}: ${detail}`, error);
}
