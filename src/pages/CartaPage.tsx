import {
	useDeferredValue,
	useEffect,
	useId,
	useMemo,
	useState,
} from 'react';
import { getCarta } from '../services/carta/cartaService.ts';
import type { CartaData, CartaProduct } from '../services/carta/types.ts';

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

function productMatchesQuery(product: CartaProduct, query: string): boolean {
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

function navClassName(isActive: boolean) {
	return [
		'font-display shrink-0 text-xs font-semibold uppercase tracking-label transition',
		isActive ? 'text-accent-rose' : 'text-foreground-muted hover:text-foreground',
	]
		.filter(Boolean)
		.join(' ');
}

type GridProduct = CartaProduct & { categoryName: string };

type CartaState =
	| { status: 'loading' }
	| { status: 'success'; data: CartaData }
	| { status: 'error'; message: string };

export default function CartaPage() {
	const searchId = useId();
	const [cartaState, setCartaState] = useState<CartaState>({ status: 'loading' });
	const [query, setQuery] = useState('');
	const [searchOpen, setSearchOpen] = useState(false);
	const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null,
	);
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		let cancelled = false;

		getCarta()
			.then((data) => {
				if (!cancelled) setCartaState({ status: 'success', data });
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				const message =
					error instanceof Error
						? error.message
						: 'No se pudo cargar la carta';
				setCartaState({ status: 'error', message });
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const businessName =
		cartaState.status === 'success'
			? cartaState.data.settings?.name || 'Carta'
			: 'Carta';

	const businessPhone =
		cartaState.status === 'success'
			? cartaState.data.settings?.phone
			: null;

	useEffect(() => {
		document.title = `${businessName} · Carta`;
	}, [businessName]);

	useEffect(() => {
		if (!selectedProductId) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setSelectedProductId(null);
		};

		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKeyDown);

		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [selectedProductId]);

	const categories =
		cartaState.status === 'success' ? cartaState.data.categories : [];

	const gridProducts = useMemo((): GridProduct[] => {
		if (cartaState.status !== 'success') return [];

		const source = activeCategoryId
			? categories.filter((category) => category.id === activeCategoryId)
			: categories;

		return source.flatMap((category) =>
			category.products.map((product) => ({
				...product,
				categoryName: category.name,
			})),
		);
	}, [cartaState, categories, activeCategoryId]);

	const visibleProducts = useMemo(() => {
		const filtered = gridProducts.filter((product) =>
			productMatchesQuery(product, deferredQuery),
		);

		return [...filtered].sort((a, b) => {
			if (a.featured === b.featured) return 0;
			return a.featured ? -1 : 1;
		});
	}, [gridProducts, deferredQuery]);

	const selectedProduct = useMemo(
		() =>
			visibleProducts.find((product) => product.id === selectedProductId) ??
			null,
		[visibleProducts, selectedProductId],
	);

	const selectedIndex = selectedProduct
		? visibleProducts.findIndex((product) => product.id === selectedProduct.id)
		: -1;

	const isSearching = query !== deferredQuery;

	const selectSibling = (direction: -1 | 1) => {
		if (selectedIndex < 0 || visibleProducts.length === 0) return;

		const nextIndex =
			(selectedIndex + direction + visibleProducts.length) %
			visibleProducts.length;

		setSelectedProductId(visibleProducts[nextIndex]?.id ?? null);
	};

	return (
		<div className="min-h-screen bg-surface text-foreground">
			<header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl">
				<div className="container-carta py-4">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0 flex-1">
							<h1 className="truncate text-sm font-bold uppercase tracking-label text-foreground sm:text-base">
								{businessName}
							</h1>
							{cartaState.status === 'success' &&
							cartaState.data.settings?.hours ? (
								<p className="mt-1 truncate text-xs text-foreground-subtle">
									{cartaState.data.settings.hours}
								</p>
							) : null}
						</div>

						<button
							type="button"
							className="flex h-9 w-9 shrink-0 items-center justify-center text-foreground transition hover:text-accent-rose active:scale-press"
							aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar'}
							aria-expanded={searchOpen}
							onClick={() => setSearchOpen((open) => !open)}
						>
							<svg
								className="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.75"
								aria-hidden
							>
								<circle cx="11" cy="11" r="7" />
								<path d="M20 20l-3.5-3.5" />
							</svg>
						</button>
					</div>

					{searchOpen ? (
						<div className="mt-4">
							<label htmlFor={searchId} className="sr-only">
								Buscar en la carta
							</label>
							<input
								id={searchId}
								type="search"
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Buscar platos…"
								autoComplete="off"
								spellCheck={false}
								className="w-full border-0 border-b border-separator bg-transparent py-2 text-sm text-foreground outline-none transition placeholder:text-foreground-subtle focus:border-accent-rose"
							/>
							{isSearching ? (
								<p className="mt-2 text-xs text-foreground-subtle">
									Buscando…
								</p>
							) : null}
						</div>
					) : null}

					{cartaState.status === 'success' ? (
						<nav
							className="mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							aria-label="Categorías"
						>
							<ul className="flex gap-5">
								<li>
									<button
										type="button"
										className={navClassName(activeCategoryId === null)}
										onClick={() => setActiveCategoryId(null)}
									>
										Todo
									</button>
								</li>
								{categories.map((category) => (
									<li key={category.id}>
										<button
											type="button"
											className={navClassName(
												activeCategoryId === category.id,
											)}
											onClick={() => setActiveCategoryId(category.id)}
										>
											{category.name}
										</button>
									</li>
								))}
							</ul>
						</nav>
					) : null}
				</div>
			</header>

			<main>
				{cartaState.status === 'loading' ? (
					<ul
						className="grid grid-cols-3 gap-px bg-separator"
						aria-busy="true"
						aria-label="Cargando carta"
					>
						{Array.from({ length: 9 }, (_, index) => (
							<li
								key={index}
								className="aspect-square animate-pulse bg-surface-muted"
							/>
						))}
					</ul>
				) : null}

				{cartaState.status === 'error' ? (
					<div role="alert" className="container-carta py-20 text-center">
						<p className="text-lg text-foreground">No se pudo cargar la carta</p>
						<p className="mt-2 text-sm text-foreground-muted">
							{cartaState.message}
						</p>
					</div>
				) : null}

				{cartaState.status === 'success' ? (
					visibleProducts.length > 0 ? (
						<ul className="grid grid-flow-dense grid-cols-3 gap-px bg-separator sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
							{visibleProducts.map((product) => (
								<li
									key={product.id}
									className={[
										'bg-surface',
										product.featured
											? 'col-span-2 row-span-2 aspect-square'
											: 'aspect-square',
									].join(' ')}
								>
									<button
										type="button"
										className="group relative block h-full w-full overflow-hidden active:opacity-90"
										onClick={() => setSelectedProductId(product.id)}
									>
										{product.imageUrl ? (
											<img
												src={product.imageUrl}
												alt=""
												loading="lazy"
												decoding="async"
												className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
											/>
										) : (
											<span className="flex h-full w-full items-center justify-center bg-surface-muted text-lg font-semibold uppercase text-foreground-subtle">
												{product.name.slice(0, 2)}
											</span>
										)}

										{product.featured ? (
											<span className="font-display absolute left-2 top-2 rounded-full bg-accent-rose px-2 py-0.5 text-xs font-bold uppercase tracking-label text-on-accent-rose">
												VIP
											</span>
										) : null}

										<span
											className={[
												'absolute inset-0 flex items-end bg-gradient-to-t from-shadow/80 via-transparent to-transparent p-2 transition',
												product.featured
													? 'opacity-100'
													: 'opacity-0 group-hover:opacity-100',
											].join(' ')}
										>
											<span className="font-display w-full truncate text-left text-xs font-semibold uppercase tracking-label text-accent-rose">
												{product.featured
													? `${product.name} · ${formatPrice(product.price)}`
													: formatPrice(product.price)}
											</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="container-carta py-20 text-center text-sm text-foreground-muted">
							{query.trim()
								? 'Sin resultados.'
								: 'No hay productos en la carta.'}
						</p>
					)
				) : null}
			</main>

			{selectedProduct ? (
				<div
					className="fixed inset-0 z-50 flex items-end bg-shadow/70 backdrop-blur-overlay sm:items-center sm:justify-center sm:p-6"
					role="dialog"
					aria-modal="true"
					aria-labelledby="producto-titulo"
				>
					<button
						type="button"
						className="absolute inset-0"
						aria-label="Cerrar"
						onClick={() => setSelectedProductId(null)}
					/>

					<article className="carta-fade-in relative z-10 max-h-screen w-full overflow-y-auto bg-surface sm:max-w-md sm:rounded-3xl">
						<div className="relative aspect-square w-full bg-surface-muted">
							{selectedProduct.imageUrl ? (
								<img
									src={selectedProduct.imageUrl}
									alt={selectedProduct.name}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full items-center justify-center text-4xl font-bold uppercase text-foreground-subtle">
									{selectedProduct.name.slice(0, 2)}
								</div>
							)}

							<button
								type="button"
								className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-foreground backdrop-blur-xl active:scale-press"
								aria-label="Cerrar"
								onClick={() => setSelectedProductId(null)}
							>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									aria-hidden
								>
									<path d="M6 6l12 12M18 6L6 18" />
								</svg>
							</button>

							{visibleProducts.length > 1 ? (
								<>
									<button
										type="button"
										className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accent-rose text-on-accent-rose active:scale-press"
										aria-label="Anterior"
										onClick={() => selectSibling(-1)}
									>
										<svg
											className="h-4 w-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											aria-hidden
										>
											<path d="M15 6l-6 6 6 6" />
										</svg>
									</button>
									<button
										type="button"
										className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accent-rose text-on-accent-rose active:scale-press"
										aria-label="Siguiente"
										onClick={() => selectSibling(1)}
									>
										<svg
											className="h-4 w-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											aria-hidden
										>
											<path d="M9 6l6 6-6 6" />
										</svg>
									</button>
								</>
							) : null}
						</div>

						<div className="space-y-3 p-5">
							<p className="text-xs uppercase tracking-label text-foreground-subtle">
								{selectedProduct.categoryName}
							</p>
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-1">
									{selectedProduct.featured ? (
										<p className="font-display text-xs font-bold uppercase tracking-label text-accent-rose">
											VIP
										</p>
									) : null}
									<h2
										id="producto-titulo"
										className="text-base font-semibold uppercase tracking-label text-foreground"
									>
										{selectedProduct.name}
									</h2>
								</div>
								<p className="shrink-0 text-lg font-semibold tabular-nums text-accent-rose">
									{formatPrice(selectedProduct.price)}
								</p>
							</div>

							{selectedProduct.description ? (
								<p className="text-sm leading-relaxed text-foreground-muted">
									{selectedProduct.description}
								</p>
							) : null}

							{selectedProduct.tags.length > 0 ? (
								<p className="text-xs uppercase tracking-label text-foreground-subtle">
									{selectedProduct.tags.map((tag) => tag.name).join(' · ')}
								</p>
							) : null}

							{businessPhone ? (
								<a
									href={`tel:${businessPhone.replace(/\s/g, '')}`}
									className="font-display mt-2 flex w-full items-center justify-center rounded-full bg-accent-rose py-3.5 text-sm font-bold uppercase tracking-label text-on-accent-rose transition active:scale-press"
								>
									Pedir ahora
								</a>
							) : null}
						</div>
					</article>
				</div>
			) : null}
		</div>
	);
}
