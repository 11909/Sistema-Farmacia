// Carrito del comparador: partidas del pedido agrupadas por proveedor.
import type { Metadata } from "next";
import Link from "next/link";
import { requerirSesion } from "../../lib/sesion";
import { leerCarritoDeRender } from "../../lib/carrito";
import { obtenerCatalogo } from "../../lib/catalogo";
import { puedeVerPrecios } from "../../lib/permisos";
import { sinPrecios } from "../../lib/tiposCarrito";
import CarritoCliente from "../../ui/grid_productos/CarritoCliente";

export const metadata: Metadata = {
    title: "Carrito · Sistema Farmacia",
    description:
        "Revisa las partidas de tu pedido agrupadas por proveedor antes de confirmar.",
};

export default async function Carrito() {
    // El layout del segmento ya exige sesión, pero esta página lee datos de una
    // cuenta concreta, así que vuelve a pedirla en lugar de confiar en el padre.
    const sesion = await requerirSesion("/grid_productos/carrito");
    // `leerCarritoDeRender` está memoizado por petición, así que esta lectura y
    // la del conteo en el layout comparten una sola llamada a Sheets. Las
    // paletas salen del catálogo, que ya está en caché por haberlo usado el
    // carrito para resolver nombres y precios: no cuesta otra lectura.
    const [lineas, catalogo] = await Promise.all([
        leerCarritoDeRender(sesion.user!.email!),
        obtenerCatalogo(),
    ]);

    // Las sucursales no ven importes. Los precios se quitan aquí, antes de
    // pasar las partidas a `CarritoCliente`: es un componente de cliente, así
    // que todo lo que reciba como prop viaja al navegador.
    const mostrarPrecios = puedeVerPrecios(sesion.user?.rol);
    const visibles = mostrarPrecios ? lineas : sinPrecios(lineas);

    // El fondo degradado y la barra superior los aporta `layout.tsx` del
    // segmento, así que aquí solo va el contenido de la página.
    return (
        <main>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <nav aria-label="Ruta de navegación" className="mb-2">
                    <ol className="flex items-center gap-1.5 text-sm text-gray-500">
                        <li>
                            <Link
                                href="/grid_productos"
                                className="transition hover:text-blue-700 focus:outline-none focus-visible:underline"
                            >
                                Catálogo
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li className="font-semibold text-gray-700">Carrito</li>
                    </ol>
                </nav>

                <h1 className="text-2xl font-bold text-gray-900">Carrito de compra</h1>
                <p className="mb-6 mt-1 text-sm text-gray-500">
                    Ajusta cantidades y revisa el pedido antes de confirmarlo. Cada bloque
                    agrupa lo que se le compra a un proveedor.
                </p>

                {/* Toda la interacción (cantidades, eliminar, totales) vive en el
                    componente de cliente; la página se mantiene en el servidor y
                    solo le entrega el carrito guardado de la cuenta. */}
                <CarritoCliente
                    lineasIniciales={visibles}
                    paletas={catalogo.paletas}
                    mostrarPrecios={mostrarPrecios}
                />
            </div>
        </main>
    );
}
