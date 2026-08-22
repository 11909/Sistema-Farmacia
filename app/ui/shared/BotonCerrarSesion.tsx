"use client";

import { signOut } from "next-auth/react";

/**
 * Cierra la sesión y devuelve al login.
 *
 * Es componente de cliente porque `signOut` necesita hacer la petición con el
 * token CSRF que NextAuth guarda en el navegador.
 */
export default function BotonCerrarSesion() {
    return (
        <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 rounded-lg border border-white/60 bg-white/50 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
            </svg>
            <span className="hidden sm:inline">Salir</span>
        </button>
    );
}
