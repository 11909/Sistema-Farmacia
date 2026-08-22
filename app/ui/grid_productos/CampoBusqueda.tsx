"use client";

import { useSearchParams } from "next/navigation";

/**
 * Buscador del catálogo.
 *
 * Es un `form` GET sin JavaScript de por medio: al enviarlo el navegador
 * navega a `/grid_productos?q=...` y la página filtra en el servidor. No hace
 * falta estado ni `onSubmit`.
 *
 * Es componente de cliente solo por `useSearchParams`, que sirve para que el
 * término siga escrito en el campo después de buscar. Los layouts no reciben
 * `searchParams`, así que leerlo aquí es la forma de enterarse.
 *
 * `action` apunta explícitamente al catálogo porque la barra también se muestra
 * en `/grid_productos/carrito`, y sin él la búsqueda se enviaría al carrito.
 */
export default function CampoBusqueda() {
    const parametros = useSearchParams();
    const q = parametros.get("q") ?? "";

    return (
        <form
            role="search"
            action="/grid_productos"
            className="order-3 w-full flex-1 sm:order-none sm:w-auto sm:min-w-64"
        >
            <label htmlFor="buscar" className="sr-only">
                Buscar productos por nombre o código de barras
            </label>
            <div className="relative">
                <svg
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                </svg>
                {/* `key` fuerza el remontaje cuando cambia el término, para que
                    el campo adopte el nuevo valor por defecto tras navegar sin
                    convertirlo en un input controlado. */}
                <input
                    key={q}
                    id="buscar"
                    name="q"
                    type="search"
                    defaultValue={q}
                    placeholder="Buscar por nombre o código de barras"
                    className="w-full rounded-lg border border-white/60 bg-white/50 py-2.5 pl-10 pr-4 text-sm text-gray-800 backdrop-blur-sm transition placeholder:text-gray-500 focus:border-transparent focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </form>
    );
}
