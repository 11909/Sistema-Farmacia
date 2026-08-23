import Link from "next/link";
import { coloresDe } from "./coloresProveedor";
import type { PaletasProveedor, Proveedor } from "../../lib/proveedores";

/**
 * Filtro del catálogo por proveedor.
 *
 * La lista sale de `Lista_Proveedores` y en el orden en que está en la hoja, así
 * que añadir un proveedor allí lo hace aparecer aquí sin tocar código. El filtro
 * en sí lo aplica la página comparando el `id_proveedor` contra las ofertas de
 * `Producto_Lista_Proveedores`.
 *
 * Son enlaces y no botones, igual que la paginación: cada combinación de
 * búsqueda y proveedor tiene su URL, funciona el historial del navegador y no
 * hace falta un byte de JavaScript.
 */
export default function FiltroProveedores({
    proveedores,
    activo,
    conteos,
    paletas,
    enlaceDe,
}: {
    proveedores: Proveedor[];
    /** `id_proveedor` filtrado, o `null` si se están viendo todos. */
    activo: string | null;
    /** `id_proveedor` -> cuántos productos ofrece, con la búsqueda ya aplicada. */
    conteos: Map<string, number>;
    paletas: PaletasProveedor;
    /** URL a la que lleva cada opción. `null` es "todos los proveedores". */
    enlaceDe: (id: string | null) => string;
}) {
    if (proveedores.length === 0) return null;

    return (
        <nav aria-label="Filtrar por proveedor" className="mb-4">
            <ul className="flex flex-wrap items-center gap-2">
                <li>
                    <Link
                        href={enlaceDe(null)}
                        aria-current={activo === null ? "page" : undefined}
                        className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activo === null
                            ? "bg-slate-800 text-white"
                            : "border border-white/60 bg-white/50 text-gray-600 backdrop-blur-sm hover:bg-white/80"
                            }`}
                    >
                        Todos
                    </Link>
                </li>

                {proveedores.map((proveedor) => {
                    const colores = coloresDe(proveedor.nombre, paletas);
                    const esActivo = proveedor.id === activo;
                    const total = conteos.get(proveedor.id) ?? 0;

                    return (
                        <li key={proveedor.id}>
                            <Link
                                href={enlaceDe(proveedor.id)}
                                aria-current={esActivo ? "page" : undefined}
                                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${esActivo
                                    ? colores.insignia
                                    : "border border-white/60 bg-white/50 text-gray-600 backdrop-blur-sm hover:bg-white/80"
                                    }`}
                            >
                                {/* El punto de color repite la identidad del
                                    proveedor cuando la pastilla está apagada; con
                                    ella encendida el color ya lo lleva el fondo y
                                    el punto sobraría. */}
                                {!esActivo && (
                                    <span
                                        aria-hidden="true"
                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${colores.insignia}`}
                                    />
                                )}
                                {proveedor.nombre}
                                <span
                                    className={`font-mono text-xs tabular-nums ${esActivo ? "opacity-75" : "text-gray-400"
                                        }`}
                                >
                                    {total.toLocaleString("es-MX")}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
