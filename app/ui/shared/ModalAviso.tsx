"use client";

import { useEffect, useRef } from "react";

type ModalAvisoProps = {
    abierto: boolean;
    titulo: string;
    detalle: string;
    onCerrar: () => void;
};

/**
 * Modal de aviso.
 *
 * Usa el `<dialog>` nativo con `showModal()`, que ya trae gratis lo que suele
 * fallar en los modales hechos a mano: el foco queda atrapado dentro, el resto
 * de la página se marca inerte para lectores de pantalla, y Esc lo cierra.
 * El único añadido es cerrar al hacer clic en el fondo.
 */
export default function ModalAviso({
    abierto,
    titulo,
    detalle,
    onCerrar,
}: ModalAvisoProps) {
    const dialogo = useRef<HTMLDialogElement>(null);

    // Se sincroniza el DOM imperativo del <dialog> con el estado de React.
    // `showModal()` sobre un diálogo ya abierto lanza, de ahí las guardas.
    useEffect(() => {
        const el = dialogo.current;
        if (!el) return;

        if (abierto && !el.open) el.showModal();
        if (!abierto && el.open) el.close();
    }, [abierto]);

    return (
        <dialog
            ref={dialogo}
            // Cubre Esc y cualquier otro cierre nativo, para que el estado de
            // React no se quede pensando que sigue abierto.
            onClose={onCerrar}
            // Clic en el ::backdrop: el target es el propio <dialog> solo
            // cuando se pulsa fuera del contenido.
            onClick={(evento) => {
                if (evento.target === dialogo.current) onCerrar();
            }}
            aria-labelledby="modal-aviso-titulo"
            aria-describedby="modal-aviso-detalle"
            className="
                m-auto w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-white/60
                bg-white p-0 shadow-2xl backdrop:bg-gray-900/40 backdrop:backdrop-blur-sm
            "
        >
            <div className="p-6 text-center">
                <div
                    aria-hidden="true"
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100"
                >
                    <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                </div>

                <h2
                    id="modal-aviso-titulo"
                    className="text-lg font-bold text-gray-800"
                >
                    {titulo}
                </h2>
                <p
                    id="modal-aviso-detalle"
                    className="mt-2 text-sm text-gray-600"
                >
                    {detalle}
                </p>

                <button
                    type="button"
                    onClick={onCerrar}
                    className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Entendido
                </button>
            </div>
        </dialog>
    );
}
