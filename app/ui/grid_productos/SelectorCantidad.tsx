"use client";

import { useState } from "react";
import { CANTIDAD_MAXIMA } from "../../lib/tiposCarrito";

/**
 * Stepper de cantidad, compartido por el carrito y las tarjetas del catálogo.
 *
 * El número es un `input` y no solo un contador para poder teclear pedidos
 * grandes sin pulsar el `+` cincuenta veces; el valor se normaliza al salir del
 * campo para que nunca quede vacío ni fuera del rango permitido.
 *
 * Vivía dentro de `CarritoCliente`. Se sacó aquí al añadir la cantidad a la
 * tarjeta del catálogo: son el mismo control y tienen que verse y comportarse
 * igual en los dos sitios.
 */

type SelectorCantidadProps = {
    valor: number;
    /** Tope por existencias del proveedor. Se acota además a `CANTIDAD_MAXIMA`. */
    maximo: number;
    /** Nombre del producto, para las etiquetas accesibles. */
    etiqueta: string;
    onCambio: (cantidad: number) => void;
    /** Bloquea el control mientras hay una escritura en vuelo. */
    deshabilitado?: boolean;
};

export default function SelectorCantidad({
    valor,
    maximo,
    etiqueta,
    onCambio,
    deshabilitado = false,
}: SelectorCantidadProps) {
    const [borrador, setBorrador] = useState<string | null>(null);
    const tope = Math.min(maximo, CANTIDAD_MAXIMA);

    function confirmar(texto: string) {
        const numero = Number.parseInt(texto, 10);
        setBorrador(null);
        if (Number.isNaN(numero)) return;
        onCambio(Math.min(Math.max(numero, 1), tope));
    }

    return (
        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
            <button
                type="button"
                onClick={() => onCambio(valor - 1)}
                disabled={deshabilitado || valor <= 1}
                aria-label={`Quitar una pieza de ${etiqueta}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-semibold leading-none text-gray-600 transition hover:bg-white hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
                −
            </button>

            {/* Etiqueta por `aria-label` y no con un `<label for>`: el catálogo
                pinta 24 de estos por página y el `id` tendría que ser único, así
                que salía del nombre del producto, que lleva espacios y no es un
                `id` válido. */}
            <input
                type="text"
                inputMode="numeric"
                value={borrador ?? String(valor)}
                disabled={deshabilitado}
                aria-label={`Cantidad de ${etiqueta}`}
                onChange={(e) => setBorrador(e.target.value.replace(/\D/g, ""))}
                onBlur={(e) => confirmar(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="w-11 bg-transparent text-center font-mono text-sm font-bold tabular-nums text-gray-900 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-blue-500 disabled:text-gray-400"
            />

            <button
                type="button"
                onClick={() => onCambio(valor + 1)}
                disabled={deshabilitado || valor >= tope}
                aria-label={`Agregar una pieza de ${etiqueta}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-semibold leading-none text-gray-600 transition hover:bg-white hover:text-gray-900 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
                +
            </button>
        </div>
    );
}
