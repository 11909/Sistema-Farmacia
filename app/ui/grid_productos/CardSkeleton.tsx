/**
 * Esqueleto de carga para `TarjetaProducto` (app/grid_productos/page.tsx).
 *
 * Replica la estructura y las medidas de la tarjeta real (rail de ranking de
 * proveedores a la izquierda, arte del producto arriba a la derecha, y debajo
 * título, presentación y rango de precios) para que el layout no salte cuando
 * el contenido real se monta.
 *
 * Es puramente decorativo: se marca con `aria-hidden` y el anuncio para
 * lectores de pantalla se delega a `CardSkeletonGrid`.
 */
export default function CardSkeleton() {
    return (
        <article
            aria-hidden="true"
            className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
            {/* Rail de ranking de proveedores */}
            <div className="flex w-16 shrink-0 flex-col self-stretch border-r border-gray-200/70 sm:w-[4.5rem]">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="flex flex-1 flex-col items-center justify-center gap-1 border-b border-white/40 bg-gray-50 px-1 py-2 last:border-b-0"
                    >
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gray-200" />
                        <div className="h-2.5 w-10 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-9 animate-pulse rounded bg-gray-100" />
                    </div>
                ))}
            </div>

            {/* Columna derecha: arte + detalle */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Arte del producto */}
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                    <div className="h-16 w-16 animate-pulse rounded-xl bg-gray-200" />
                </div>

                {/* Detalle */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                    {/* Título: dos líneas, la segunda más corta */}
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-3/5 animate-pulse rounded bg-gray-200" />

                    {/* Presentación */}
                    <div className="mt-1 h-3 w-2/5 animate-pulse rounded bg-gray-100" />

                    {/* Rango de precios */}
                    <div className="mt-auto pt-3">
                        <div className="flex items-baseline gap-1.5">
                            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-12 animate-pulse rounded bg-gray-100" />
                        </div>
                        <div className="mt-1.5 h-2.5 w-28 animate-pulse rounded bg-gray-100" />
                    </div>
                </div>
            </div>
        </article>
    );
}

type CardSkeletonGridProps = {
    /** Número de esqueletos a renderizar. Por defecto 12, igual que una página completa. */
    cantidad?: number;
    /** Texto anunciado a lectores de pantalla mientras se carga. */
    etiqueta?: string;
};

/**
 * Rejilla de esqueletos con las mismas columnas y gaps que la rejilla real.
 * Útil como fallback de página completa (por ejemplo en `loading.tsx`).
 */
export function CardSkeletonGrid({
    cantidad = 12,
    etiqueta = "Cargando medicamentos…",
}: CardSkeletonGridProps) {
    return (
        <div
            role="status"
            aria-busy="true"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
        >
            <span className="sr-only">{etiqueta}</span>
            {Array.from({ length: cantidad }, (_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}
