"use client";

import { useEffect, useRef, useState } from "react";

type BotonCopiarCodigoProps = {
    /** Código de barras que se copia al portapapeles. */
    codigo: string;
};

/**
 * Botón discreto que copia el código de barras del medicamento y muestra
 * un check durante dos segundos como confirmación.
 *
 * Es un componente de cliente porque necesita `navigator.clipboard` y estado
 * local; el resto de la tarjeta se sigue renderizando en el servidor.
 */
export default function BotonCopiarCodigo({ codigo }: BotonCopiarCodigoProps) {
    const [copiado, setCopiado] = useState(false);
    const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Evita actualizar el estado si la tarjeta se desmonta antes de los 2 s.
    useEffect(() => {
        return () => {
            if (temporizador.current) clearTimeout(temporizador.current);
        };
    }, []);

    async function copiar() {
        try {
            await navigator.clipboard.writeText(codigo);
            setCopiado(true);
            if (temporizador.current) clearTimeout(temporizador.current);
            temporizador.current = setTimeout(() => setCopiado(false), 2000);
        } catch {
            // Sin permiso de portapapeles (o contexto no seguro): no hacemos nada.
        }
    }

    return (
        <button
            type="button"
            onClick={copiar}
            aria-label={copiado ? "Código copiado" : `Copiar código ${codigo}`}
            className="rounded p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            {copiado ? (
                <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path
                        strokeLinecap="round"
                        d="M15 5.5A1.5 1.5 0 0 0 13.5 4H5.5A1.5 1.5 0 0 0 4 5.5v8A1.5 1.5 0 0 0 5.5 15"
                    />
                </svg>
            )}
        </button>
    );
}
