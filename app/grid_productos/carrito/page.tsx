// Carrito del comparador: partidas del pedido agrupadas por proveedor.
import type { Metadata } from "next";
import Link from "next/link";
import CarritoCliente, {
    type LineaCarrito,
} from "../../ui/grid_productos/CarritoCliente";

export const metadata: Metadata = {
    title: "Carrito · Sistema Farmacia",
    description:
        "Revisa las partidas de tu pedido agrupadas por proveedor antes de confirmar.",
};

/**
 * Datos de ejemplo mientras no hay persistencia del carrito.
 *
 * `precioUnitario` es el del proveedor elegido en el comparador y
 * `precioMasAlto` el del proveedor disponible más caro del mismo medicamento:
 * de la diferencia sale el ahorro que se muestra en el resumen. Las cifras
 * coinciden con las del catálogo (`app/grid_productos/page.tsx`).
 */
const LINEAS: LineaCarrito[] = [
    {
        id: 1,
        nombre: "Paracetamol 500 mg",
        presentacion: "Caja con 20 tabletas",
        codigoBarras: "7501234567890",
        proveedor: "City",
        precioUnitario: 45,
        precioMasAlto: 60,
        cantidad: 4,
        existencias: 40,
    },
    {
        id: 4,
        nombre: "Ibuprofeno 400 mg",
        presentacion: "Caja con 30 tabletas",
        codigoBarras: "7505566778899",
        proveedor: "Ofasa",
        precioUnitario: 85,
        precioMasAlto: 100,
        cantidad: 2,
        existencias: 18,
    },
    {
        id: 10,
        nombre: "Suero oral electrolitos",
        presentacion: "Botella de 625 ml",
        codigoBarras: "7507788990011",
        proveedor: "Ofasa",
        precioUnitario: 30,
        precioMasAlto: 35,
        cantidad: 6,
        existencias: 24,
    },
    {
        id: 3,
        nombre: "Amoxicilina 500 mg",
        presentacion: "Caja con 12 cápsulas",
        codigoBarras: "7501122334455",
        proveedor: "Farmater",
        precioUnitario: 145,
        precioMasAlto: 152,
        cantidad: 1,
        existencias: 3,
    },
    {
        id: 12,
        nombre: "Cubrebocas KN95",
        presentacion: "Caja con 10 piezas",
        codigoBarras: "7509900112233",
        proveedor: "Farmater",
        precioUnitario: 82,
        precioMasAlto: 89,
        cantidad: 3,
        existencias: 30,
    },
    {
        id: 6,
        nombre: "Vitamina C 1 g",
        presentacion: "30 tabletas efervescentes",
        codigoBarras: "7503344556677",
        proveedor: "Tenorio",
        precioUnitario: 125,
        precioMasAlto: 140,
        cantidad: 2,
        existencias: 12,
    },
];

export default function Carrito() {
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
                    solo le entrega los datos iniciales. */}
                <CarritoCliente lineasIniciales={LINEAS} />
            </div>
        </main>
    );
}
