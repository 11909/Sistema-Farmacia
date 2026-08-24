"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarNuevoProducto } from "../../lib/accionesProductos";

type Proveedor = {
    id: string;
    nombre: string;
};

type Props = {
    proveedores: Proveedor[];
};

export default function FormNuevoProducto({ proveedores }: Props) {
    const router = useRouter();
    const [nombre, setNombre] = useState("");
    const [codigoBarras, setCodigoBarras] = useState("");
    
    type OfertaForm = {
        idProveedor: string;
        precio: string;
        existencias: number | string;
        presentacion: string;
    };
    const [ofertas, setOfertas] = useState<OfertaForm[]>([
        { idProveedor: "", precio: "", existencias: 0, presentacion: "" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const agregarOferta = () => {
        setOfertas([...ofertas, { idProveedor: "", precio: "", existencias: 0, presentacion: "" }]);
    };

    const quitarOferta = (index: number) => {
        setOfertas(ofertas.filter((_, i) => i !== index));
    };

    const actualizarOferta = (index: number, campo: keyof OfertaForm, valor: string | number) => {
        const nuevas = [...ofertas];
        nuevas[index] = { ...nuevas[index], [campo]: valor };
        setOfertas(nuevas);
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const respuesta = await guardarNuevoProducto({
                nombre,
                codigoBarras,
                ofertas: ofertas.map(o => ({
                    idProveedor: o.idProveedor,
                    precio: String(o.precio),
                    existencias: o.existencias,
                    presentacion: o.presentacion
                }))
            });

            if (respuesta.error) {
                setErrorMessage(respuesta.error);
                setIsSubmitting(false);
            } else if (respuesta.exito) {
                router.push("/panel_admin/productos");
            }
        } catch (error) {
            setErrorMessage("Ocurrió un error inesperado al intentar guardar.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Nuevo Medicamento
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Registrar un nuevo producto en el inventario.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Cerrar"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardar}>
                <div className="space-y-6 px-6 py-5">
                    {errorMessage && (
                        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{errorMessage}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nombre */}
                    <div>
                        <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-gray-600">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Paracetamol 500mg"
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </div>

                    {/* Código de Barras */}
                    <div>
                        <label htmlFor="codigoBarras" className="mb-1.5 block text-sm font-medium text-gray-600">
                            Código de Barras
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="codigoBarras"
                                value={codigoBarras}
                                onChange={(e) => setCodigoBarras(e.target.value)}
                                placeholder="Escanear o ingresar"
                                className="w-full rounded-lg border border-gray-200 py-2.5 pl-4 pr-10 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                                title="Escanear código de barras"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Proveedores, Precios, Existencias y Presentación */}
                    <div>
                        <label className="mb-3 block text-base font-bold text-gray-800">
                            Proveedores e Inventario
                        </label>
                        <div className="space-y-4">
                            {ofertas.map((oferta, idx) => (
                                <div key={idx} className="relative rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-600">
                                            Proveedor {idx + 1}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => quitarOferta(idx)}
                                            disabled={ofertas.length === 1}
                                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                            title="Eliminar proveedor"
                                        >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-500">Proveedor <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    value={oferta.idProveedor}
                                                    onChange={(e) => actualizarOferta(idx, "idProveedor", e.target.value)}
                                                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                    required
                                                >
                                                    <option value="">Seleccionar proveedor</option>
                                                    {proveedores.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-500">Precio Unitario <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                                    $
                                                </span>
                                                <input
                                                    type="number"
                                                    value={oferta.precio}
                                                    onChange={(e) => actualizarOferta(idx, "precio", e.target.value)}
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-8 pr-4 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-500">Existencias</label>
                                            <input
                                                type="number"
                                                value={oferta.existencias}
                                                onChange={(e) => actualizarOferta(idx, "existencias", e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-gray-500">Presentación</label>
                                            <input
                                                type="text"
                                                value={oferta.presentacion}
                                                onChange={(e) => actualizarOferta(idx, "presentacion", e.target.value)}
                                                placeholder="Ej. Caja con 20"
                                                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={agregarOferta}
                            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Agregar proveedor
                        </button>
                    </div>
                </div>

                {/* Footer del Modal */}
                <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => router.back()}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                            </svg>
                        )}
                        {isSubmitting ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
