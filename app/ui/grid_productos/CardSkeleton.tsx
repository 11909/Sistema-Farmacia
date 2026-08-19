/**
 * Esqueleto de carga para `TarjetaProducto` (app/grid_productos/page.tsx).
 *
 * Replica la estructura y las medidas de la tarjeta real (arte cuadrado,
 * fila de etiquetas por proveedor, título, presentación y rango de precios)
 * para que el layout no salte cuando el contenido real se monta.
 *
 * Es puramente decorativo: se marca con `aria-hidden` y el anuncio para
 * lectores de pantalla se delega a `CardSkeletonGrid`.
 */
export default function CardSkeleton() {
    return (
        <article
            aria-hidden="true"
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
            {/* Arte del producto */}
            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                <div className="h-16 w-16 animate-pulse rounded-xl bg-gray-200" />
            </div>

            {/* Etiquetas de precios por proveedor */}
            <div className="border-b border-gray-100 px-3 py-2.5">
                <div className="flex flex-wrap gap-1.5">
                    {["w-24", "w-20", "w-24", "w-16"].map((ancho, i) => (
                        <span
                            key={i}
                            className={`h-6 ${ancho} animate-pulse rounded-full bg-gray-100`}
                        />
                    ))}
                </div>
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
