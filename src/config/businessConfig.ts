export function resolveBusinessId(): string {
	const businessId = import.meta.env.VITE_BUSINESS_ID?.trim();

	if (!businessId) {
		throw new Error('VITE_BUSINESS_ID es obligatorio');
	}

	return businessId;
}
