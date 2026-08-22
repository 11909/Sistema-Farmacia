/**
 * Esqueleto de carga del carrito (app/grid_productos/carrito/page.tsx).
 *
 * Replica la estructura y las medidas de `CarritoCliente`: las dos columnas, los
 * bloques por proveedor con su cabecera y sus partidas, y el resumen lateral con
 * el banner del total. La idea es que al montarse el contenido real no salte el
 * layout.
 *
 * Todo es decorativo. El anuncio para lectores de pantalla lo pone
 * `CarritoSkeleton`, y las piezas internas van con `aria-hidden`.
 */

/** Una partida del pedido: espeja el `<li>` de `FilaProducto`. */
function FilaSkeleton() {
    return (
        <li
            aria-hidden="true"
            className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-5 sm:px-7"
        >
            {/* Nombre, unidad y código de barras */}
            <div className="min-w-0 flex-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
                <div className="mt-2.5 h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Precio unitario */}
            <div className="shrink-0 sm:w-28">
                <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100 sm:ml-auto" />
                <div className="mt-2 h-3.5 w-20 animate-pulse rounded bg-gray-200 sm:ml-auto" />
            </div>

            {/* Selector de cantidad */}
            <div className="h-10 w-32 shrink-0 animate-pulse rounded-xl bg-gray-100" />

            {/* Subtotal y botón de eliminar */}
            <div className="flex shrink-0 items-center justify-between gap-3 sm:w-36 sm:justify-end">
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-100" />
            </div>
        </li>
    );
}

/** Un bloque de proveedor con su cabecera de burbujas y sus partidas. */
function GrupoSkeleton({ partidas }: { partidas: number }) {
    return (
        <section
            aria-hidden="true"
            className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/80"
        >
            {/* Cabecera del grupo. En la real es el banner de burbujas teñido con
                el color del proveedor; aquí un gris neutro, porque hasta que
                lleguen los datos no se sabe de qué proveedor es. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 bg-gray-100 px-5 py-4 sm:px-7">
                <div className="h-7 w-28 animate-pulse rounded-full bg-gray-200" />
                <div className="h-7 w-44 animate-pulse rounded-full bg-gray-200/70" />
                <div className="min-w-4 flex-1 border-t border-dashed border-gray-300" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-gray-200" />
            </div>

            <ul className="divide-y divide-gray-100">
                {Array.from({ length: partidas }, (_, i) => (
                    <FilaSkeleton key={i} />
                ))}
            </ul>
        </section>
    );
}

/** Resumen lateral del pedido. */
function ResumenSkeleton() {
    return (
        <aside aria-hidden="true" className="lg:sticky lg:top-24">
            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200/80">
                {/* "Resumen del pedido" */}
                <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />

                {/* Banner del total */}
                <div className="mt-4 rounded-2xl bg-gray-100 px-5 py-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="h-2.5 w-28 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                    <div className="mt-2.5 flex items-end justify-between gap-2">
                        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
                        <div className="h-6 w-14 animate-pulse rounded bg-gray-200/70" />
                    </div>
                </div>

                {/* Desglose por proveedor */}
                <div className="mt-4 flex flex-col gap-1">
                    {[0, 1].map((i) => (
                        <div key={i} className="flex items-center gap-2.5 px-2.5 py-2">
                            <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-gray-200" />
                            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                            <div className="min-w-4 flex-1 border-t border-dashed border-gray-300" />
                            <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-gray-200" />
                        </div>
                    ))}
                </div>

                {/* Subtotal, envío y total a pagar */}
                <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
                    {[0, 1].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="h-3.5 w-20 animate-pulse rounded bg-gray-100" />
                            <div className="h-3.5 w-16 animate-pulse rounded bg-gray-200" />
                        </div>
                    ))}
                    <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                        <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>

                {/* Confirmar pedido */}
                <div className="mt-5 h-14 w-full animate-pulse rounded-2xl bg-gray-200" />
                <div className="mx-auto mt-3 h-3 w-4/5 animate-pulse rounded bg-gray-100" />
            </div>
        </aside>
    );
}

type CarritoSkeletonProps = {
    /** Bloques de proveedor a dibujar. */
    grupos?: number;
    /** Partidas por bloque. */
    partidasPorGrupo?: number;
    /** Texto anunciado a lectores de pantalla mientras se carga. */
    etiqueta?: string;
};

/**
 * Esqueleto completo del carrito, con las mismas dos columnas que el real.
 *
 * Los valores por defecto dibujan un carrito pequeño (dos proveedores con dos
 * partidas cada uno). No se sabe cuántos habrá hasta leer la hoja, así que se
 * apunta a un tamaño verosímil en lugar de a uno vacío.
 */
export default function CarritoSkeleton({
    grupos = 2,
    partidasPorGrupo = 2,
    etiqueta = "Cargando el carrito…",
}: CarritoSkeletonProps) {
    return (
        <div
            role="status"
            aria-busy="true"
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
        >
            <span className="sr-only">{etiqueta}</span>

            {/* Partidas del pedido, agrupadas por proveedor */}
            <div className="flex flex-col gap-6 lg:col-span-2">
                {Array.from({ length: grupos }, (_, i) => (
                    <GrupoSkeleton key={i} partidas={partidasPorGrupo} />
                ))}

                {/* Pie: volver al catálogo, estado de guardado y vaciar */}
                <div
                    aria-hidden="true"
                    className="flex flex-wrap items-center justify-between gap-3"
                >
                    <div className="h-4 w-52 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                </div>
            </div>

            <ResumenSkeleton />
        </div>
    );
}
