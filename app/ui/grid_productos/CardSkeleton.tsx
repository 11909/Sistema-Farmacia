/**
 * Esqueleto de carga para `TarjetaProducto` (app/grid_productos/page.tsx).
 *
 * Replica la estructura y las medidas de la tarjeta real (nombre, código de
 * barras, resumen de proveedores, banner de mejor precio, ranking de cuatro
 * filas y botón de carrito) para que el layout no salte cuando el contenido
 * real se monta.
 *
 * Es puramente decorativo: se marca con `aria-hidden` y el anuncio para
 * lectores de pantalla se delega a `CardSkeletonGrid`.
 */
export default function CardSkeleton() {
    return (
        <article
            aria-hidden="true"
            className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200/80"
        >
            {/* Nombre del medicamento */}
            <div className="h-5 w-4/5 animate-pulse rounded bg-gray-200" />

            {/* Código de barras */}
            <div className="mt-2.5 h-3 w-32 animate-pulse rounded bg-gray-100" />

            {/* Resumen: proveedores y ahorro */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Banner de mejor precio */}
            <div className="mt-4 rounded-2xl bg-gray-100 px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="h-2.5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="mt-2.5 flex items-end justify-between gap-2">
                    <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-6 w-20 animate-pulse rounded bg-gray-200/70" />
                </div>
            </div>

            {/* Ranking de proveedores */}
            <div className="mt-4 flex flex-col gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2.5 px-2.5 py-2">
                        <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-gray-100" />
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                        <div className="min-w-4 flex-1 border-t border-dashed border-gray-200" />
                        <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-gray-200" />
                    </div>
                ))}
            </div>

            {/* Botón de carrito */}
            <div className="mt-5 h-14 w-full animate-pulse rounded-2xl bg-gray-200" />
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
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
            <span className="sr-only">{etiqueta}</span>
            {Array.from({ length: cantidad }, (_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}
