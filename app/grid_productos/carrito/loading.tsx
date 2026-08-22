import CarritoSkeleton from "../../ui/grid_productos/CarritoSkeleton";

/**
 * Fallback de /grid_productos/carrito: Next envuelve `page.tsx` en un
 * <Suspense> con este componente, así que se ve mientras la página lee el
 * carrito de la hoja.
 *
 * Aquí se nota más que en el catálogo: la página espera a `Carrito` y
 * `Carrito_Producto`, que se leen frescas en cada visita porque el carrito es
 * estado del usuario y no se puede cachear como el catálogo.
 *
 * La cabecera de la ruta (migas, título y descripción) se repite en lugar de
 * dibujarse como barras grises: es texto fijo, no depende de los datos, así que
 * mostrarlo ya da algo legible en vez de un esqueleto de más.
 */
export default function Loading() {
    return (
        // El fondo degradado y la barra superior los aporta el `layout.tsx` del
        // segmento, que envuelve también a este fallback.
        <main>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <nav aria-label="Ruta de navegación" className="mb-2">
                    <ol className="flex items-center gap-1.5 text-sm text-gray-500">
                        <li>Catálogo</li>
                        <li aria-hidden="true">/</li>
                        <li className="font-semibold text-gray-700">Carrito</li>
                    </ol>
                </nav>

                <h1 className="text-2xl font-bold text-gray-900">Carrito de compra</h1>
                <p className="mb-6 mt-1 text-sm text-gray-500">
                    Ajusta cantidades y revisa el pedido antes de confirmarlo. Cada bloque
                    agrupa lo que se le compra a un proveedor.
                </p>

                <CarritoSkeleton />
            </div>
        </main>
    );
}
