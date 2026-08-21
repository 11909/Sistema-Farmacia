import Link from "next/link";
import IconoLogin from "../ui/shared/IconoLogin";
import BotonCerrarSesion from "../ui/shared/BotonCerrarSesion";
import { requerirSesion } from "../lib/sesion";
import { contarPiezas } from "../lib/carrito";

/**
 * Layout del segmento /grid_productos.
 *
 * Aloja el cromo compartido por la ruta y sus rutas hijas (por ejemplo
 * /grid_productos/[id] y /grid_productos/carrito): el fondo degradado y la
 * barra superior. Al vivir aquí no se vuelven a montar en cada navegación
 * dentro del segmento y `loading.tsx` ya los hereda, así que el esqueleto de
 * carga se ve con el mismo fondo y la misma barra, sin saltos de layout.
 */
export default async function GridProductosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Puerta de entrada al segmento: sin sesión válida se redirige al login.
    // El layout corre antes que sus páginas hijas, así que esto cubre
    // /grid_productos y /grid_productos/carrito con una sola comprobación.
    const sesion = await requerirSesion("/grid_productos");
    const piezas = await contarPiezas(sesion.user!.email!);

    return (
        <div className="relative min-h-screen font-sans">
            {/* Fondo: degradado suave azul -> blanco. Va en una capa fija al
                viewport (-z-10) para que la transición sea continua y no se
                corte ni se repita al hacer scroll en páginas largas.
                Todas las paradas son opacas: con una parada translúcida se
                asomaría el fondo del <body>, que en modo oscuro es casi negro. */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-blue-100 via-blue-50 to-white"
            >
                {/* Halos difusos que dan profundidad al degradado sin competir
                    con las tarjetas. Puramente decorativos. */}
                <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-200/25 blur-3xl" />
                <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-blue-100/30 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-white/60 blur-3xl" />
            </div>

            {/* Barra superior con efecto glass.
                El degradado azul se mantiene entre 75-85% de opacidad para que
                el texto siga siendo legible en navegadores sin backdrop-filter;
                donde sí hay soporte, se aligera y el blur hace el trabajo. */}
            <header
                className="
                    sticky top-0 z-20 border-b border-white/40
                    bg-gradient-to-r from-blue-100/80 via-white/75 to-cyan-100/80
                    shadow-sm shadow-blue-900/5
                    backdrop-blur-xl backdrop-saturate-150
                    supports-[backdrop-filter]:from-blue-100/50
                    supports-[backdrop-filter]:via-white/40
                    supports-[backdrop-filter]:to-cyan-100/50
                "
            >
                {/* Filo superior claro: simula el borde biselado del cristal */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                />

                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link href="/grid_productos" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                            <IconoLogin />
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                            Sistema Farmacia
                        </span>
                    </Link>

                    <form
                        role="search"
                        className="order-3 w-full flex-1 sm:order-none sm:w-auto sm:min-w-64"
                    >
                        <label htmlFor="buscar" className="sr-only">
                            Buscar
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
                            <input
                                id="buscar"
                                name="q"
                                type="search"
                                placeholder="Buscar medicamentos por código de barras"
                                className="w-full rounded-lg border border-white/60 bg-white/50 py-2.5 pl-10 pr-4 text-sm text-gray-800 backdrop-blur-sm transition placeholder:text-gray-500 focus:border-transparent focus:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </form>

                    {/* Un <Link> y no un <button> con un <a> dentro: anidar un
                        enlace en un botón es HTML inválido y rompe la
                        navegación de cliente de Next. */}
                    <Link
                        href="/grid_productos/carrito"
                        className="relative ml-auto flex items-center gap-2 rounded-lg border border-white/60 bg-white/50 px-5 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <span className="hidden sm:inline">Carrito</span>
                        {/* Piezas realmente guardadas en el carrito de la
                            cuenta. Se oculta en cero para no mostrar una
                            insignia vacía. */}
                        {piezas > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white">
                                {piezas}
                            </span>
                        )}
                    </Link>

                    {/* Cuenta en sesión + salida */}
                    <div className="flex items-center gap-3">
                        <span className="hidden text-right text-sm leading-tight md:block">
                            <span className="block font-semibold text-gray-800">
                                {sesion.user?.name}
                            </span>
                            <span className="block text-xs text-gray-500">
                                {sesion.user?.rol === "sucursal"
                                    ? "Sucursal"
                                    : "Administrador"}
                                {" · "}
                                {sesion.user?.email}
                            </span>
                        </span>
                        <BotonCerrarSesion />
                    </div>
                </div>
            </header>

            {children}
        </div>
    );
}
