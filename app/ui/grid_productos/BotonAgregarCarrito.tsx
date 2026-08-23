"use client";

import { useState, useTransition } from "react";
import { agregarAlCarritoDeSesion } from "../../lib/acciones/carrito";

type BotonAgregarCarritoProps = {
    codigoBarras: string;
    /** Proveedor elegido en el ranking, o `null` si no hay ninguno disponible. */
    proveedor: string | null;
    /** Nombre del medicamento, solo para la etiqueta accesible. */
    nombre: string;
    /** Piezas a agregar, del selector de cantidad de la tarjeta. */
    cantidad: number;
    /** Se avisa mientras la escritura está en vuelo, para bloquear el selector. */
    onPendiente?: (pendiente: boolean) => void;
};

/**
 * Agrega piezas al carrito guardado de la cuenta.
 *
 * Manda únicamente el código de barras, el proveedor y la cantidad: el precio lo
 * resuelve el servidor desde el catálogo, así que no se puede manipular desde el
 * cliente. La cantidad sí viene de aquí, y por eso el servidor la sanea antes de
 * escribirla.
 */
export default function BotonAgregarCarrito({
    codigoBarras,
    proveedor,
    nombre,
    cantidad,
    onPendiente,
}: BotonAgregarCarritoProps) {
    // `useTransition` en lugar de un `useState` de carga: mantiene el botón
    // reactivo y deja que React coordine el refresco del servidor que dispara
    // la acción.
    const [pendiente, iniciarTransicion] = useTransition();
    const [estado, setEstado] = useState<"inicial" | "agregado" | "error">(
        "inicial",
    );

    if (!proveedor) {
        return (
            <button
                type="button"
                disabled
                className="mt-3 w-full rounded-2xl bg-gray-300 px-5 py-4 text-base font-semibold text-white disabled:cursor-not-allowed"
            >
                Sin proveedor disponible
            </button>
        );
    }

    function agregar() {
        onPendiente?.(true);

        iniciarTransicion(async () => {
            const resultado = await agregarAlCarritoDeSesion(
                codigoBarras,
                proveedor!,
                cantidad,
            );
            setEstado(resultado.ok ? "agregado" : "error");
            onPendiente?.(false);
        });
    }

    const etiqueta =
        estado === "error"
            ? "No se pudo agregar"
            : pendiente
                ? "Agregando..."
                : estado === "agregado"
                    ? "Agregado al carrito"
                    : cantidad === 1
                        ? "Agregar al carrito"
                        : `Agregar ${cantidad} al carrito`;

    return (
        <button
            type="button"
            onClick={agregar}
            disabled={pendiente}
            aria-label={`Agregar ${cantidad} ${cantidad === 1 ? "pieza" : "piezas"} de ${nombre} al carrito, proveedor ${proveedor}`}
            className={`mt-3 w-full rounded-2xl px-5 py-4 text-base font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait ${estado === "error"
                ? "bg-rose-600 hover:bg-rose-700"
                : estado === "agregado"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-800 hover:bg-slate-900"
                }`}
        >
            {etiqueta}
        </button>
    );
}
