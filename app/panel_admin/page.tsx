import Link from "next/link";

/**
 * Página raíz del panel de administración.
 * Muestra una bienvenida con accesos directos a cada sección.
 */
export default function PanelAdmin() {
    return (
        <div className="flex flex-col gap-10 py-2">
            {/* Encabezado de bienvenida */}
            <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    Panel de administración
                </p>
                <h1 className="text-3xl font-bold text-gray-800">
                    Bienvenido de nuevo
                </h1>
                <p className="mx-auto max-w-lg text-base text-gray-500">
                    Desde aquí puedes gestionar el catálogo de productos y los
                    proveedores del sistema.
                </p>
            </div>

            {/* Divisor glass */}
            <div
                aria-hidden="true"
                className="h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent"
            />

            {/* Tarjetas de acceso rápido */}
            <section aria-label="Accesos rápidos">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                    Acceso rápido
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                    {/* Tarjeta Productos */}
                    <Link
                        href="/panel_admin/productos"
                        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/40 bg-white/25 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl backdrop-saturate-150 transition hover:border-white/60 hover:bg-white/35 hover:shadow-blue-900/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {/* Halo decorativo */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl transition group-hover:bg-blue-400/20"
                        />
                        {/* Filo superior */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                        />

                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/40 bg-blue-600/10 text-blue-600 shadow-sm">
                            <svg
                                aria-hidden="true"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 3h8M8 12h8M8 16h5"
                                />
                            </svg>
                        </span>

                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-bold text-gray-800 transition group-hover:text-blue-700">
                                Productos
                            </span>
                            <span className="text-sm text-gray-500">
                                Agrega, edita o elimina productos del catálogo.
                            </span>
                        </div>

                        <span className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition group-hover:opacity-100">
                            Ir a productos
                            <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </span>
                    </Link>

                    {/* Tarjeta Proveedores */}
                    <Link
                        href="/panel_admin/proveedores"
                        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/40 bg-white/25 p-6 shadow-lg shadow-blue-900/5 backdrop-blur-xl backdrop-saturate-150 transition hover:border-white/60 hover:bg-white/35 hover:shadow-blue-900/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {/* Halo decorativo */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/10 blur-2xl transition group-hover:bg-cyan-400/20"
                        />
                        {/* Filo superior */}
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                        />

                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/40 bg-cyan-600/10 text-cyan-700 shadow-sm">
                            <svg
                                aria-hidden="true"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M8 10h.01M12 10h.01M16 10h.01"
                                />
                            </svg>
                        </span>

                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-bold text-gray-800 transition group-hover:text-cyan-700">
                                Proveedores
                            </span>
                            <span className="text-sm text-gray-500">
                                Administra los proveedores vinculados al sistema.
                            </span>
                        </div>

                        <span className="mt-auto flex items-center gap-1 text-sm font-medium text-cyan-700 opacity-0 transition group-hover:opacity-100">
                            Ir a proveedores
                            <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </span>
                    </Link>
                </div>
            </section>
        </div>
    );
}