"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import BotonCopiarCodigo from "../grid_productos/BotonCopiarCodigo";

/** Fila de la tabla ya aplanada desde el server component. */
export type FilaMedicamento = {
    nombre: string;
    codigoBarras: string;
    proveedor: string;
    precio: number;
    existencias?: number;
    unidad?: string;
};

type Props = {
    filas: FilaMedicamento[];
    proveedores: string[];
    q?: string;
    prov?: string;
    pagina?: number;
    totalPaginas?: number;
    totalResultados?: number;
};

/**
 * Tabla de medicamentos con paginación desde el servidor.
 * Replica el diseño de la imagen de referencia.
 */
export default function TablaMedicamentos({
    filas,
    proveedores,
    q = "",
    prov = "",
    pagina = 1,
    totalPaginas = 1,
    totalResultados = 0,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Estado local para el buscador (con debounce)
    const [busqueda, setBusqueda] = useState(q);

    const actualizarUrl = useCallback(
        (clave: string, valor: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (valor) {
                params.set(clave, valor);
            } else {
                params.delete(clave);
            }
            // Al buscar o filtrar, volvemos a la página 1
            if (clave !== "p") {
                params.delete("p");
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            if (busqueda !== q) {
                actualizarUrl("q", busqueda);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [busqueda, q, actualizarUrl]);

    function enlacePagina(p: number) {
        const params = new URLSearchParams(searchParams.toString());
        if (p > 1) {
            params.set("p", String(p));
        } else {
            params.delete("p");
        }
        return `${pathname}?${params.toString()}`;
    }

    // Calcula qué números de página mostrar (ventana simple)
    const getVentanaPaginas = () => {
        const delta = 2;
        const rango: (number | null)[] = [];
        for (let i = 1; i <= totalPaginas; i++) {
            if (
                i === 1 ||
                i === totalPaginas ||
                (i >= pagina - delta && i <= pagina + delta)
            ) {
                rango.push(i);
            } else if (rango[rango.length - 1] !== null) {
                rango.push(null);
            }
        }
        return rango;
    };

    return (
        <>
            {/* Controles: buscador + filtro */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Campo de búsqueda */}
                <div className="relative">
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar medicamentos..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-64"
                    />
                </div>

                {/* Filtro por proveedor */}
                <div className="relative">
                    <select
                        value={prov}
                        onChange={(e) => actualizarUrl("prov", e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">Filtrar por proveedor...</option>
                        {proveedores.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Nombre
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Código de barras
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Proveedor
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Precio uni.
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Existencia
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                Presentación
                            </th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filas.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-12 text-center text-sm text-gray-400"
                                >
                                    No se encontraron medicamentos.
                                </td>
                            </tr>
                        ) : (
                            filas.map((fila) => (
                                <tr
                                    key={fila.codigoBarras}
                                    className="transition hover:bg-gray-50/60"
                                >
                                    <td
                                        className="max-w-xs truncate px-6 py-4 font-medium text-gray-800"
                                        title={fila.nombre}
                                    >
                                        {fila.nombre}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-gray-500">{fila.codigoBarras}</span>
                                            <BotonCopiarCodigo codigo={fila.codigoBarras} />
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                        {fila.proveedor}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                        {fila.precio > 0
                                            ? `$${fila.precio.toFixed(2)}`
                                            : "—"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                        {fila.existencias !== undefined
                                            ? fila.existencias
                                            : ""}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                        {fila.unidad ?? ""}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Botón editar */}
                                            <button
                                                type="button"
                                                aria-label={`Editar ${fila.nombre}`}
                                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </button>
                                            {/* Botón eliminar */}
                                            <button
                                                type="button"
                                                aria-label={`Eliminar ${fila.nombre}`}
                                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                                            >
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación y Contador */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-xs text-gray-400">
                    Mostrando{" "}
                    <span className="font-semibold text-gray-600">
                        {filas.length}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-gray-600">
                        {totalResultados}
                    </span>{" "}
                    medicamentos
                </p>

                {totalPaginas > 1 && (
                    <nav
                        aria-label="Paginación"
                        className="flex items-center gap-2"
                    >
                        {pagina > 1 ? (
                            <Link
                                href={enlacePagina(pagina - 1)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Anterior
                            </Link>
                        ) : (
                            <span
                                aria-hidden="true"
                                className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 shadow-sm"
                            >
                                Anterior
                            </span>
                        )}

                        <div className="hidden sm:flex sm:items-center sm:gap-1">
                            {getVentanaPaginas().map((n, i) =>
                                n === null ? (
                                    <span
                                        key={`dots-${i}`}
                                        className="px-2 text-sm text-gray-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <Link
                                        key={n}
                                        href={enlacePagina(n)}
                                        aria-current={n === pagina ? "page" : undefined}
                                        className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            n === pagina
                                                ? "bg-gray-900 text-white shadow-sm"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    >
                                        {n}
                                    </Link>
                                )
                            )}
                        </div>

                        {pagina < totalPaginas ? (
                            <Link
                                href={enlacePagina(pagina + 1)}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Siguiente
                            </Link>
                        ) : (
                            <span
                                aria-hidden="true"
                                className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 shadow-sm"
                            >
                                Siguiente
                            </span>
                        )}
                    </nav>
                )}
            </div>
        </>
    );
}
