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

function categoryTabClass(isActive: boolean) {
	return [
		'shrink-0 border-b-2 py-2 text-mobile-body transition',
		isActive
			? 'border-foreground font-medium text-foreground'
			: 'border-transparent text-foreground-muted',
	]
		.filter(Boolean)
		.join(' ');
}

type GridProduct = CartaProduct & { categoryName: string };

type CartaState =
	| { status: 'loading' }
	| { status: 'success'; data: CartaData }
	| { status: 'error'; message: string };

function SearchIcon() {
	return (
		<svg
			className="h-5 w-5"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			aria-hidden
		>
			<circle cx="11" cy="11" r="7" />
			<path d="M20 20l-3.5-3.5" />
		</svg>
	);
}

function ProductThumbnail({
	product,
	className = '',
}: {
	product: GridProduct;
	className?: string;
}) {
	if (product.imageUrl) {
		return (
			<img
				src={product.imageUrl}
				alt=""
				loading="lazy"
				decoding="async"
				className={['h-full w-full object-cover', className].join(' ')}
			/>
		);
	}

	return (
		<span
			className={[
				'flex h-full w-full items-center justify-center bg-surface-muted text-xs text-foreground-subtle',
				className,
			].join(' ')}
		>
			{product.name.slice(0, 1)}
		</span>
	);
}

function MobileProductRow({
	product,
	onSelect,
}: {
	product: GridProduct;
	onSelect: () => void;
}) {
	return (
		<li className="border-b border-separator">
			<button
				type="button"
				className="flex w-full gap-4 py-5 text-left"
				onClick={onSelect}
			>
				{product.imageUrl ? (
					<div className="h-16 w-16 shrink-0 overflow-hidden bg-surface-muted">
						<ProductThumbnail product={product} />
					</div>
				) : null}
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-4">
						<h3 className="text-mobile-title leading-mobile-title text-foreground">
							{product.name}
						</h3>
						<p className="shrink-0 text-mobile-body tabular-nums text-foreground-muted">
							{formatPrice(product.price)}
						</p>
					</div>
					{product.description ? (
						<p className="mt-1.5 line-clamp-2 text-mobile-body leading-mobile-body text-foreground-subtle">
							{product.description}
						</p>
					) : null}
				</div>
			</button>
		</li>
	);
}

function DesktopProductCell({
	product,
	onSelect,
}: {
	product: GridProduct;
	onSelect: () => void;
}) {
	return (
		<li
			className={[
				'bg-surface',
				product.featured
					? 'col-span-2 row-span-2 aspect-square'
					: 'aspect-square',
			].join(' ')}
		>
			<button
				type="button"
				className="group relative block h-full w-full overflow-hidden"
				onClick={onSelect}
			>
				<ProductThumbnail product={product} />

				<span
					className={[
						'absolute inset-0 flex items-end bg-linear-to-t from-shadow/70 to-transparent p-3 transition',
						product.featured
							? 'opacity-100'
							: 'opacity-0 group-hover:opacity-100',
					].join(' ')}
				>
					<span className="w-full truncate text-left text-xs text-foreground-on-inverse">
						{product.featured
							? `${product.name} · ${formatPrice(product.price)}`
							: formatPrice(product.price)}
					</span>
				</span>
			</button>
		</li>
	);
}

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
			<header className="sticky top-0 z-40 border-b border-separator bg-surface">
				<div className="container-carta py-5">
					<div className="flex items-center justify-between gap-4">
						<div className="min-w-0">
							<h1 className="truncate text-xl font-medium tracking-tight text-foreground">
								{businessName}
							</h1>
							{cartaState.status === 'success' &&
							cartaState.data.settings?.hours ? (
								<p className="mt-0.5 truncate text-mobile-body text-foreground-subtle">
									{cartaState.data.settings.hours}
								</p>
							) : null}
						</div>

						<button
							type="button"
							className="shrink-0 text-foreground-muted transition hover:text-foreground"
							aria-label={searchOpen ? 'Cerrar búsqueda' : 'Buscar'}
							aria-expanded={searchOpen}
							onClick={() => setSearchOpen((open) => !open)}
						>
							<SearchIcon />
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
								placeholder="Buscar…"
								autoComplete="off"
								spellCheck={false}
								autoFocus
								className="w-full border-0 border-b border-separator bg-transparent py-2 text-mobile-body text-foreground outline-none placeholder:text-foreground-subtle focus:border-foreground"
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
							className="mt-4 -mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							aria-label="Categorías"
						>
							<ul className="flex gap-6">
								<li>
									<button
										type="button"
										className={categoryTabClass(activeCategoryId === null)}
										onClick={() => setActiveCategoryId(null)}
									>
										Todo
									</button>
								</li>
								{categories.map((category) => (
									<li key={category.id}>
										<button
											type="button"
											className={categoryTabClass(
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

			<main className="container-carta md:max-w-none md:px-0">
				{cartaState.status === 'loading' ? (
					<>
						<ul
							className="md:hidden"
							aria-busy="true"
							aria-label="Cargando carta"
						>
							{Array.from({ length: 6 }, (_, index) => (
								<li key={index} className="border-b border-separator py-5">
									<div className="h-4 w-2/3 animate-pulse bg-surface-muted" />
									<div className="mt-2 h-3 w-1/3 animate-pulse bg-surface-muted" />
								</li>
							))}
						</ul>
						<ul
							className="hidden grid-cols-4 gap-px bg-separator md:grid lg:grid-cols-5 xl:grid-cols-6"
							aria-busy="true"
							aria-hidden
						>
							{Array.from({ length: 9 }, (_, index) => (
								<li
									key={index}
									className="aspect-square animate-pulse bg-surface-muted"
								/>
							))}
						</ul>
					</>
				) : null}

				{cartaState.status === 'error' ? (
					<div role="alert" className="py-20 text-center">
						<p className="text-foreground">No se pudo cargar la carta</p>
						<p className="mt-2 text-sm text-foreground-muted">
							{cartaState.message}
						</p>
					</div>
				) : null}

				{cartaState.status === 'success' ? (
					visibleProducts.length > 0 ? (
						<>
							<ul className="md:hidden">
								{visibleProducts.map((product) => (
									<MobileProductRow
										key={product.id}
										product={product}
										onSelect={() => setSelectedProductId(product.id)}
									/>
								))}
							</ul>

							<ul className="hidden grid-flow-dense bg-separator md:grid md:grid-cols-4 md:gap-px lg:grid-cols-5 xl:grid-cols-6">
								{visibleProducts.map((product) => (
									<DesktopProductCell
										key={product.id}
										product={product}
										onSelect={() => setSelectedProductId(product.id)}
									/>
								))}
							</ul>
						</>
					) : (
						<p className="py-20 text-center text-sm text-foreground-muted">
							{query.trim() ? 'Sin resultados.' : 'No hay productos.'}
						</p>
					)
				) : null}
			</main>

			{selectedProduct ? (
				<div
					className="fixed inset-0 z-50 flex items-end bg-shadow/40 md:items-center md:justify-center"
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

					<article className="carta-fade-in relative z-10 max-h-[90dvh] w-full overflow-y-auto bg-surface md:max-w-sm">
						{selectedProduct.imageUrl ? (
							<div className="aspect-square w-full bg-surface-muted">
								<img
									src={selectedProduct.imageUrl}
									alt={selectedProduct.name}
									className="h-full w-full object-cover"
								/>
							</div>
						) : null}

						<div className="space-y-4 p-5 pb-safe">
							<div className="flex items-start justify-between gap-4">
								<h2
									id="producto-titulo"
									className="text-xl font-medium tracking-tight text-foreground"
								>
									{selectedProduct.name}
								</h2>
								<p className="shrink-0 text-mobile-body tabular-nums text-foreground-muted">
									{formatPrice(selectedProduct.price)}
								</p>
							</div>

							{selectedProduct.description ? (
								<p className="text-mobile-body leading-mobile-body text-foreground-subtle">
									{selectedProduct.description}
								</p>
							) : null}

							{selectedProduct.tags.length > 0 ? (
								<p className="text-xs text-foreground-muted">
									{selectedProduct.tags.map((tag) => tag.name).join(' · ')}
								</p>
							) : null}

							<div className="flex items-center justify-between pt-2">
								{visibleProducts.length > 1 ? (
									<div className="flex gap-4 text-sm text-foreground-muted">
										<button
											type="button"
											className="transition hover:text-foreground"
											aria-label="Anterior"
											onClick={() => selectSibling(-1)}
										>
											Anterior
										</button>
										<button
											type="button"
											className="transition hover:text-foreground"
											aria-label="Siguiente"
											onClick={() => selectSibling(1)}
										>
											Siguiente
										</button>
									</div>
								) : (
									<span />
								)}

								<button
									type="button"
									className="text-sm text-foreground-muted transition hover:text-foreground"
									onClick={() => setSelectedProductId(null)}
								>
									Cerrar
								</button>
							</div>

							{businessPhone ? (
								<a
									href={`tel:${businessPhone.replace(/\s/g, '')}`}
									className="block border-t border-separator pt-4 text-center text-sm text-foreground transition hover:text-foreground-muted"
								>
									{businessPhone}
								</a>
							) : null}
						</div>
					</article>
				</div>
			) : null}
		</div>
	);
}
