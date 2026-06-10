import {
	useDeferredValue,
	useEffect,
	useId,
	useMemo,
	useState,
} from 'react';
import { getCarta } from '../services/carta/cartaService.ts';
import type { Category, Data, Product } from '../services/carta/types.ts';

const priceFormatter = new Intl.NumberFormat('es-ES', {
	style: 'currency',
	currency: 'EUR',
});

function formatPrice(value: number): string {
	return priceFormatter.format(value);
}

function normalize(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

function matchesQuery(product: Product, query: string): boolean {
	if (!query) return true;

	const haystack = [
		product.name,
		product.description ?? '',
		...product.tags.map((tag) => tag.name),
	]
		.join(' ')
		.toLowerCase();

	return normalize(haystack).includes(normalize(query));
}

type State =
	| { status: 'loading' }
	| { status: 'success'; data: Data }
	| { status: 'error'; message: string };

type Section = {
	category: Category;
	products: Product[];
};

export default function CartaPage() {
	const searchId = useId();
	const [state, setState] = useState<State>({ status: 'loading' });
	const [query, setQuery] = useState('');
	const [activeId, setActiveId] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		let cancelled = false;

		getCarta()
			.then((data) => {
				if (!cancelled) setState({ status: 'success', data });
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				const message =
					error instanceof Error
						? error.message
						: 'No se pudo cargar la carta';
				setState({ status: 'error', message });
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const businessName =
		state.status === 'success'
			? state.data.settings?.name || 'Carta'
			: 'Carta';

	const businessPhone =
		state.status === 'success'
			? state.data.settings?.phone
			: null;

	const businessHours =
		state.status === 'success'
			? state.data.settings?.hours
			: null;

	useEffect(() => {
		document.title = businessName;
	}, [businessName]);

	useEffect(() => {
		if (!activeId) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setActiveId(null);
		};

		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKeyDown);

		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [activeId]);

	const sections = useMemo((): Section[] => {
		if (state.status !== 'success') return [];

		return state.data.categories
			.map((category) => ({
				category,
				products: category.products.filter((product) =>
					matchesQuery(product, deferredQuery),
				),
			}))
			.filter((section) => section.products.length > 0);
	}, [state, deferredQuery]);

	const products = useMemo(
		() => sections.flatMap((section) => section.products),
		[sections],
	);

	const activeProduct =
		products.find((product) => product.id === activeId) ?? null;

	return (
		<div className="container-carta min-h-screen bg-surface text-foreground">
			<header className="py-10 text-center">
				<h1 className="text-mobile-heading leading-mobile-heading font-medium text-foreground">
					{businessName}
				</h1>
				{businessHours ? (
					<p className="mt-2 text-mobile-caption leading-mobile-caption text-foreground-muted">
						{businessHours}
					</p>
				) : null}
			</header>

			<div className="pb-6">
				<label htmlFor={searchId} className="sr-only">
					Buscar
				</label>
				<input
					id={searchId}
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Buscar"
					autoComplete="off"
					spellCheck={false}
					className="w-full border-0 border-b border-separator bg-transparent py-2 text-center text-mobile-body text-foreground outline-none placeholder:text-foreground-subtle focus:border-foreground"
				/>
			</div>

			<main className="pb-16">
				{state.status === 'loading' ? (
					<div className="space-y-8 py-4" aria-busy="true" aria-label="Cargando">
						{Array.from({ length: 4 }, (_, index) => (
							<div
								key={index}
								className={[
									'mx-auto h-3 animate-pulse bg-surface-muted',
									index % 2 === 0 ? 'w-3/5' : 'w-2/3',
								].join(' ')}
							/>
						))}
					</div>
				) : null}

				{state.status === 'error' ? (
					<p
						role="alert"
						className="py-16 text-center text-mobile-caption leading-mobile-caption text-foreground-muted"
					>
						{state.message}
					</p>
				) : null}

				{state.status === 'success' ? (
					sections.length > 0 ? (
						sections.map((section) => (
							<section key={section.category.id} className="mb-12 last:mb-0">
								<h2 className="mb-5 text-center text-mobile-caption leading-mobile-caption text-foreground-muted">
									{section.category.name}
								</h2>
								<ul className="space-y-6">
									{section.products.map((product) => (
										<li key={product.id}>
											<button
												type="button"
												className="w-full text-left"
												onClick={() => setActiveId(product.id)}
											>
												<div className="flex items-baseline justify-between gap-4">
													<span className="text-mobile-title leading-mobile-title text-foreground">
														{product.name}
													</span>
													<span className="shrink-0 text-mobile-body tabular-nums text-foreground-muted">
														{formatPrice(product.price)}
													</span>
												</div>
												{product.description ? (
													<p className="mt-1 text-mobile-body leading-mobile-body text-foreground-subtle">
														{product.description}
													</p>
												) : null}
											</button>
										</li>
									))}
								</ul>
							</section>
						))
					) : (
						<p className="py-16 text-center text-mobile-caption leading-mobile-caption text-foreground-muted">
							{query.trim() ? 'Sin resultados.' : 'Sin productos.'}
						</p>
					)
				) : null}
			</main>

			{businessPhone ? (
				<footer className="border-t border-separator py-8 text-center">
					<a
						href={`tel:${businessPhone.replace(/\s/g, '')}`}
						className="text-mobile-caption leading-mobile-caption text-foreground-muted"
					>
						{businessPhone}
					</a>
				</footer>
			) : null}

			{activeProduct ? (
				<div
					className="fixed inset-0 z-50 flex justify-center bg-surface-muted"
					role="dialog"
					aria-modal="true"
					aria-labelledby="detalle-nombre"
				>
					<div className="container-carta flex h-full flex-col bg-surface">
						<div className="flex justify-end py-5">
							<button
								type="button"
								className="text-mobile-caption leading-mobile-caption text-foreground-muted"
								onClick={() => setActiveId(null)}
							>
								Cerrar
							</button>
						</div>

						<div className="flex-1 overflow-y-auto pb-safe">
							{activeProduct.imageUrl ? (
								<div className="mb-8 aspect-4/3 bg-surface-muted">
									<img
										src={activeProduct.imageUrl}
										alt={activeProduct.name}
										className="h-full w-full object-cover"
									/>
								</div>
							) : null}

							<div className="flex items-baseline justify-between gap-4">
								<h2
									id="detalle-nombre"
									className="text-mobile-title leading-mobile-title text-foreground"
								>
									{activeProduct.name}
								</h2>
								<p className="shrink-0 text-mobile-body tabular-nums text-foreground-muted">
									{formatPrice(activeProduct.price)}
								</p>
							</div>

							{activeProduct.description ? (
								<p className="mt-4 text-mobile-body leading-mobile-body text-foreground-subtle">
									{activeProduct.description}
								</p>
							) : null}

							{activeProduct.tags.length > 0 ? (
								<p className="mt-6 text-mobile-caption leading-mobile-caption text-foreground-muted">
									{activeProduct.tags.map((tag) => tag.name).join(' · ')}
								</p>
							) : null}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
