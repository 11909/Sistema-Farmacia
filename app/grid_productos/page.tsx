// Comparador de precios por proveedor
import { Suspense } from "react";
import Link from "next/link";
import IconoLogin from "../ui/shared/IconoLogin";
import CardSkeleton from "../ui/grid_productos/CardSkeleton";

type Icono = "pastilla" | "frasco" | "tubo" | "caja";

type PrecioProveedor = {
    proveedor: string;
    precio: number;
    disponible: boolean;
};

type Medicamento = {
    id: number;
    nombre: string;
    presentacion: string;
    icono: Icono;
    gradiente: string;
    precios: PrecioProveedor[];
};

const PROVEEDORES = ["City", "Farmater", "Ofasa", "Tenorio"] as const;

// Color asociado a cada proveedor para el ranking de cristal líquido.
// City -> azul, Ofasa -> naranja, Farmater (Farmacenter) -> negro, Tenorio -> amarillo.
const COLOR_PROVEEDOR: Record<
    string,
    { bg: string; text: string; border: string; glow: string }
> = {
    City: {
        bg: "bg-blue-500/20",
        text: "text-blue-900",
        border: "border-blue-300/60",
        glow: "rgba(59, 130, 246, 0.65)", // azul
    },
    Farmater: {
        bg: "bg-neutral-900/15",
        text: "text-neutral-900",
        border: "border-neutral-500/50",
        glow: "rgba(23, 23, 23, 0.55)", // negro
    },
    Ofasa: {
        bg: "bg-orange-500/20",
        text: "text-orange-900",
        border: "border-orange-300/60",
        glow: "rgba(249, 115, 22, 0.65)", // naranja
    },
    Tenorio: {
        bg: "bg-yellow-400/25",
        text: "text-yellow-900",
        border: "border-yellow-400/60",
        glow: "rgba(250, 204, 21, 0.7)", // amarillo
    },
};

const MEDICAMENTOS: Medicamento[] = [
    {
        id: 1,
        nombre: "Paracetamol 500 mg",
        presentacion: "Caja con 20 tabletas",
        icono: "pastilla",
        gradiente: "from-blue-100 to-cyan-50",
        precios: [
            { proveedor: "City", precio: 45, disponible: true },
            { proveedor: "Farmater", precio: 52, disponible: true },
            { proveedor: "Ofasa", precio: 48.5, disponible: true },
            { proveedor: "Tenorio", precio: 60, disponible: true },
        ],
    },
    {
        id: 2,
        nombre: "Ibuprofeno 400 mg",
        presentacion: "Caja con 30 tabletas",
        icono: "pastilla",
        gradiente: "from-rose-100 to-orange-50",
        precios: [
            { proveedor: "City", precio: 78.5, disponible: true },
            { proveedor: "Farmater", precio: 72, disponible: true },
            { proveedor: "Ofasa", precio: 85, disponible: true },
            { proveedor: "Tenorio", precio: 69.9, disponible: true },
        ],
    },
    {
        id: 3,
        nombre: "Amoxicilina 500 mg",
        presentacion: "Caja con 12 cápsulas",
        icono: "caja",
        gradiente: "from-emerald-100 to-teal-50",
        precios: [
            { proveedor: "City", precio: 152, disponible: true },
            { proveedor: "Farmater", precio: 145, disponible: true },
            { proveedor: "Ofasa", precio: 160, disponible: false },
            { proveedor: "Tenorio", precio: 148, disponible: true },
        ],
    },
    {
        id: 4,
        nombre: "Loratadina 10 mg",
        presentacion: "Caja con 20 tabletas",
        icono: "pastilla",
        gradiente: "from-violet-100 to-indigo-50",
        precios: [
            { proveedor: "City", precio: 62, disponible: true },
            { proveedor: "Farmater", precio: 58, disponible: true },
            { proveedor: "Ofasa", precio: 65, disponible: true },
            { proveedor: "Tenorio", precio: 55, disponible: true },
        ],
    },
    {
        id: 5,
        nombre: "Omeprazol 20 mg",
        presentacion: "Caja con 14 cápsulas",
        icono: "caja",
        gradiente: "from-amber-100 to-yellow-50",
        precios: [
            { proveedor: "City", precio: 89, disponible: true },
            { proveedor: "Farmater", precio: 95, disponible: true },
            { proveedor: "Ofasa", precio: 82, disponible: true },
            { proveedor: "Tenorio", precio: 110, disponible: false },
        ],
    },
    {
        id: 6,
        nombre: "Vitamina C 1 g",
        presentacion: "30 tabletas efervescentes",
        icono: "frasco",
        gradiente: "from-orange-100 to-amber-50",
        precios: [
            { proveedor: "City", precio: 135, disponible: true },
            { proveedor: "Farmater", precio: 128, disponible: true },
            { proveedor: "Ofasa", precio: 140, disponible: true },
            { proveedor: "Tenorio", precio: 125, disponible: true },
        ],
    },
    {
        id: 7,
        nombre: "Jarabe expectorante",
        presentacion: "Frasco de 120 ml",
        icono: "frasco",
        gradiente: "from-sky-100 to-blue-50",
        precios: [
            { proveedor: "City", precio: 98, disponible: true },
            { proveedor: "Farmater", precio: 105, disponible: false },
            { proveedor: "Ofasa", precio: 92, disponible: true },
            { proveedor: "Tenorio", precio: 99, disponible: true },
        ],
    },
    {
        id: 8,
        nombre: "Gel antibacterial 70%",
        presentacion: "Botella de 500 ml",
        icono: "frasco",
        gradiente: "from-teal-100 to-emerald-50",
        precios: [
            { proveedor: "City", precio: 55, disponible: true },
            { proveedor: "Farmater", precio: 60, disponible: true },
            { proveedor: "Ofasa", precio: 52, disponible: true },
            { proveedor: "Tenorio", precio: 58, disponible: true },
        ],
    },
    {
        id: 9,
        nombre: "Crema hidratante corporal",
        presentacion: "Tubo de 100 g",
        icono: "tubo",
        gradiente: "from-pink-100 to-rose-50",
        precios: [
            { proveedor: "City", precio: 124, disponible: true },
            { proveedor: "Farmater", precio: 118, disponible: true },
            { proveedor: "Ofasa", precio: 130, disponible: true },
            { proveedor: "Tenorio", precio: 115, disponible: true },
        ],
    },
    {
        id: 10,
        nombre: "Suero oral electrolitos",
        presentacion: "Botella de 625 ml",
        icono: "frasco",
        gradiente: "from-lime-100 to-green-50",
        precios: [
            { proveedor: "City", precio: 32, disponible: true },
            { proveedor: "Farmater", precio: 35, disponible: true },
            { proveedor: "Ofasa", precio: 30, disponible: true },
            { proveedor: "Tenorio", precio: 38, disponible: false },
        ],
    },
    {
        id: 11,
        nombre: "Termómetro digital",
        presentacion: "1 pieza con estuche",
        icono: "caja",
        gradiente: "from-slate-100 to-gray-50",
        precios: [
            { proveedor: "City", precio: 249, disponible: true },
            { proveedor: "Farmater", precio: 235, disponible: true },
            { proveedor: "Ofasa", precio: 260, disponible: true },
            { proveedor: "Tenorio", precio: 240, disponible: true },
        ],
    },
    {
        id: 12,
        nombre: "Cubrebocas KN95",
        presentacion: "Caja con 10 piezas",
        icono: "caja",
        gradiente: "from-indigo-100 to-sky-50",
        precios: [
            { proveedor: "City", precio: 89, disponible: true },
            { proveedor: "Farmater", precio: 82, disponible: true },
            { proveedor: "Ofasa", precio: 95, disponible: false },
            { proveedor: "Tenorio", precio: 85, disponible: true },
        ],
    },
];

function formatoPrecio(valor: number) {
    return `$${valor.toFixed(2)}`;
}

function IconoProducto({ tipo }: { tipo: Icono }) {
    const comun = {
        className: "w-16 h-16 text-gray-500/70",
        fill: "none" as const,
        stroke: "currentColor" as const,
        strokeWidth: 1.5,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
        viewBox: "0 0 24 24",
        "aria-hidden": true,
    };

    if (tipo === "pastilla") {
        return (
            <svg {...comun}>
                <g transform="rotate(-45 12 12)">
                    <rect x="3" y="9" width="18" height="6" rx="3" />
                    <line x1="12" y1="9" x2="12" y2="15" />
                </g>
            </svg>
        );
    }

    if (tipo === "frasco") {
        return (
            <svg {...comun}>
                <path d="M10 2.5h4v3h-4z" />
                <path d="M8 5.5h8a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2z" />
                <line x1="9" y1="12" x2="15" y2="12" />
            </svg>
        );
    }

    if (tipo === "tubo") {
        return (
            <svg {...comun}>
                <rect x="10" y="2.5" width="4" height="3" rx="1" />
                <path d="M8 5.5h8V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" />
                <line x1="8" y1="17.5" x2="16" y2="17.5" />
            </svg>
        );
    }

    return (
        <svg {...comun}>
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <path d="M9 7V4.5h6V7" />
        </svg>
    );
}

function RankingProveedores({ precios }: { precios: PrecioProveedor[] }) {
    // Sort by price ascending; unavailable go to the end
    const ordenados = [...precios].sort((a, b) => {
        if (!a.disponible && b.disponible) return 1;
        if (a.disponible && !b.disponible) return -1;
        return a.precio - b.precio;
    });

    const mejorPrecio = ordenados.find((p) => p.disponible)?.precio ?? null;

    return (
        <div className="flex w-16 shrink-0 flex-col self-stretch border-r border-gray-200/70 sm:w-[4.5rem]">
            {ordenados.map((p, idx) => {
                const colores = COLOR_PROVEEDOR[p.proveedor] ?? {
                    bg: "bg-gray-100/30",
                    text: "text-gray-700",
                    border: "border-gray-300/50",
                    glow: "rgba(148, 163, 184, 0.5)",
                };

                const esMejor = p.disponible && p.precio === mejorPrecio;

                return (
                    <div
                        key={p.proveedor}
                        style={
                            esMejor
                                ? ({
                                    "--glow-color": colores.glow,
                                    borderLeftColor: colores.glow,
                                } as React.CSSProperties)
                                : undefined
                        }
                        className={`
                            etiqueta-cristal relative flex flex-1 flex-col items-center justify-center gap-0.5 border-b border-white/40 px-1 py-2 text-center last:border-b-0
                            ${p.disponible ? colores.bg : "bg-gray-100/40"}
                            ${p.disponible ? colores.text : "text-gray-400"}
                            ${esMejor ? "etiqueta-brillante border-l-4 font-bold" : ""}
                        `}
                    >
                        <span className="z-[3] flex items-center gap-1">
                            <span className="text-[11px] font-bold leading-none opacity-70">
                                {idx + 1}
                            </span>
                            {esMejor && (
                                <svg
                                    aria-hidden="true"
                                    className="h-3 w-3 drop-shadow-sm"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </span>
                        <span className="z-[3] text-[11px] font-semibold leading-tight">
                            {p.proveedor}
                        </span>
                        <span
                            className={`z-[3] text-xs font-semibold leading-tight ${!p.disponible ? "line-through opacity-70" : ""
                                }`}
                        >
                            {formatoPrecio(p.precio)}
                        </span>
                        {!p.disponible && (
                            <span className="z-[3] text-[9px] italic leading-none">Agotado</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function TarjetaProducto({ medicamento }: { medicamento: Medicamento }) {
    const preciosDisponibles = medicamento.precios.filter((p) => p.disponible);
    const menorPrecio = preciosDisponibles.length
        ? Math.min(...preciosDisponibles.map((p) => p.precio))
        : null;
    const mayorPrecio = preciosDisponibles.length
        ? Math.max(...preciosDisponibles.map((p) => p.precio))
        : null;

    return (
        <article className="group relative flex overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
            {/* Rail de ranking de proveedores, integrado en el costado izquierdo
                de la tarjeta (1ro = más barato, último = más caro) */}
            <RankingProveedores precios={medicamento.precios} />

            {/* Columna derecha: arte del producto + detalle */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Imagen / arte del producto */}
                <div
                    className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${medicamento.gradiente}`}
                >
                    <div className="transition-transform duration-300 group-hover:scale-110">
                        <IconoProducto tipo={medicamento.icono} />
                    </div>
                </div>

                {/* Detalle */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
                        <Link
                            href={`/grid_productos/${medicamento.id}`}
                            className="transition hover:text-blue-700 focus:underline focus:outline-none"
                        >
                            {medicamento.nombre}
                        </Link>
                    </h3>
                    <p className="text-xs text-gray-500">{medicamento.presentacion}</p>

                    {/* Rango de precios */}
                    {menorPrecio !== null && mayorPrecio !== null && (
                        <div className="mt-auto pt-3">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base font-bold text-emerald-700">
                                    {formatoPrecio(menorPrecio)}
                                </span>
                                {menorPrecio !== mayorPrecio && (
                                    <>
                                        <span className="text-xs text-gray-400">—</span>
                                        <span className="text-sm text-gray-500">
                                            {formatoPrecio(mayorPrecio)}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-gray-400">
                                {preciosDisponibles.length} de {medicamento.precios.length} proveedores
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function GridProductos() {
    return (
        <main className="min-h-screen bg-gray-50">
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
                    <Link href="/" className="flex items-center gap-2">
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

                    <button
                        type="button"
                        className="relative ml-auto flex items-center gap-2 rounded-lg border border-white/60 bg-white/50 px-3 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                            3
                        </span>
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">




                <p className="mb-4 text-sm text-gray-500">
                    Mostrando{" "}
                    <span className="font-semibold text-gray-700">
                        {MEDICAMENTOS.length}
                    </span>{" "}
                    medicamentos
                </p>

                {/* Grid de tarjetas.
                    Cada tarjeta tiene su propio límite de Suspense, así que en
                    cuanto `TarjetaProducto` pase a leer datos (await a la BD o
                    a la API de proveedores) cada una podrá hacer streaming por
                    separado mostrando su esqueleto, sin bloquear a las demás. */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {MEDICAMENTOS.map((med) => (
                        <Suspense key={med.id} fallback={<CardSkeleton />}>
                            <TarjetaProducto medicamento={med} />
                        </Suspense>
                    ))}
                </div>

                {/* Paginación */}
                <nav
                    aria-label="Paginación"
                    className="mt-10 flex items-center justify-center gap-2"
                >
                    <button
                        type="button"
                        disabled
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 disabled:cursor-not-allowed"
                    >
                        Anterior
                    </button>
                    {[1, 2, 3].map((pagina) => (
                        <button
                            key={pagina}
                            type="button"
                            aria-current={pagina === 1 ? "page" : undefined}
                            className={`h-10 w-10 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${pagina === 1
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {pagina}
                        </button>
                    ))}
                    <button
                        type="button"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Siguiente
                    </button>
                </nav>
            </div>
        </main>
    );
}
