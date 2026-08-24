"use client";

import { useState, useTransition } from "react";
import BotonCopiarCodigo from "../grid_productos/BotonCopiarCodigo";
import type { FilaMedicamento } from "./TablaMedicamentos";
import { actualizarProducto, eliminarOfertaProducto, type ActualizarProductoInput } from "../../lib/accionesProductos";

type Props = {
    fila: FilaMedicamento;
    proveedores: string[];
    onBorrarClic: (fila: FilaMedicamento) => void;
};

export default function FilaMedicamentoComponent({ fila, proveedores, onBorrarClic }: Props) {
    const [editando, setEditando] = useState(false);
    const [pendiente, iniciarTransicion] = useTransition();
    
    // Estado del formulario de edición
    const [datos, setDatos] = useState({
        nombre: fila.nombre,
        codigoBarras: fila.codigoBarras,
        precio: fila.precio,
        existencias: fila.existencias ?? "",
        presentacion: fila.unidad ?? "",
    });

    async function guardar() {
        iniciarTransicion(async () => {
            const input: ActualizarProductoInput = {
                codigoBarrasOriginal: fila.codigoBarras,
                proveedorOriginal: fila.proveedor,
                nombre: datos.nombre,
                codigoBarras: datos.codigoBarras,
                precio: datos.precio,
                existencias: datos.existencias,
                presentacion: datos.presentacion,
            };

            const res = await actualizarProducto(input);
            if (res?.error) {
                alert(res.error);
            } else {
                setEditando(false);
            }
        });
    }

    function cancelar() {
        setDatos({
            nombre: fila.nombre,
            codigoBarras: fila.codigoBarras,
            precio: fila.precio,
            existencias: fila.existencias ?? "",
            presentacion: fila.unidad ?? "",
        });
        setEditando(false);
    }

    if (editando) {
        return (
            <tr className="bg-blue-50/50 transition">
                <td className="px-3 py-3">
                    <input
                        type="text"
                        value={datos.nombre}
                        onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                        disabled={pendiente}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                    />
                </td>
                <td className="px-3 py-3">
                    <input
                        type="text"
                        value={datos.codigoBarras}
                        onChange={(e) => setDatos({ ...datos, codigoBarras: e.target.value })}
                        disabled={pendiente}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                    />
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                    {fila.proveedor}
                </td>
                <td className="px-3 py-3">
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={datos.precio}
                        onChange={(e) => setDatos({ ...datos, precio: parseFloat(e.target.value) || 0 })}
                        disabled={pendiente}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                    />
                </td>
                <td className="px-3 py-3">
                    <input
                        type="number"
                        min="0"
                        value={datos.existencias}
                        onChange={(e) => setDatos({ ...datos, existencias: e.target.value })}
                        disabled={pendiente}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                    />
                </td>
                <td className="px-3 py-3">
                    <input
                        type="text"
                        value={datos.presentacion}
                        onChange={(e) => setDatos({ ...datos, presentacion: e.target.value })}
                        disabled={pendiente}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-2 py-1 border"
                    />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={guardar}
                            disabled={pendiente}
                            className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                            aria-label="Guardar cambios"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={cancelar}
                            disabled={pendiente}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 disabled:opacity-50"
                            aria-label="Cancelar edición"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className={`transition hover:bg-gray-50/60 ${pendiente ? 'opacity-50' : ''}`}>
            <td className="max-w-xs truncate px-6 py-4 font-medium text-gray-800" title={fila.nombre}>
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
                {fila.precio > 0 ? `$${fila.precio.toFixed(2)}` : "—"}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                {fila.existencias !== undefined ? fila.existencias : ""}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                {fila.unidad ?? ""}
            </td>
            <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setEditando(true)}
                        disabled={pendiente}
                        aria-label={`Editar ${fila.nombre}`}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => onBorrarClic(fila)}
                        disabled={pendiente}
                        aria-label={`Eliminar ${fila.nombre}`}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}
