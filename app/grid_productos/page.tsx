// Comparador de precios por proveedor
import { Suspense } from "react";
import Link from "next/link";
import IconoLogin from "../ui/shared/IconoLogin";
import CardSkeleton from "../ui/grid_productos/CardSkeleton";
import BotonCopiarCodigo from "../ui/grid_productos/BotonCopiarCodigo";
import BurbujasPrecio, {
    type PaletaBurbujas,
} from "../ui/grid_productos/BurbujasPrecio";

type PrecioProveedor = {
    proveedor: string;
    precio: number;
    disponible: boolean;
};

type Medicamento = {
    id: number;
    nombre: string;
    presentacion: string;
    codigoBarras: string;
    precios: PrecioProveedor[];
};

/**
 * Paleta por proveedor. Se reutiliza en el banner de mejor precio y en la
 * insignia del primer lugar del ranking, para que el color identifique de un
 * vistazo quién está ganando la comparación.
 *
 * City -> azul, Ofasa -> naranja, Farmater -> negro, Tenorio -> amarillo.
 */
const COLOR_PROVEEDOR: Record<
    string,
    {
        /** Color de texto del banner de mejor precio (el fondo lo pintan las burbujas). */
        banner: string;
        /** Paleta de las burbujas animadas del banner. */
        burbujas: PaletaBurbujas;
        /** Insignia circular del primer lugar. */
        insignia: string;
        /** Fondo suave de la fila ganadora del ranking. */
        fila: string;
        /** Guion separador de la fila ganadora. */
        guion: string;
    }
> = {
    City: {
        banner: "text-blue-950",
        burbujas: {
            "--bp-fondo1": "rgb(219, 234, 254)",
            "--bp-fondo2": "rgb(239, 246, 255)",
            "--bp-color1": "147, 197, 253",
            "--bp-color2": "96, 165, 250",
            "--bp-color3": "191, 219, 254",
            "--bp-color4": "59, 130, 246",
        },
        insignia: "bg-blue-600 text-white",
        fila: "bg-blue-50",
        guion: "border-blue-300",
    },
    Farmater: {
        // Único caso con texto claro. Tras el umbral del filtro las manchas
        // quedan opacas, así que ninguna pasa de neutral-500: por encima de ese
        // tono el texto blanco del banner dejaría de contrastar.
        banner: "text-white",
        burbujas: {
            "--bp-fondo1": "rgb(38, 38, 38)",
            "--bp-fondo2": "rgb(23, 23, 23)",
            "--bp-color1": "82, 82, 82",
            "--bp-color2": "115, 115, 115",
            "--bp-color3": "64, 64, 64",
            "--bp-color4": "96, 96, 96",
        },
        insignia: "bg-neutral-800 text-white",
        fila: "bg-neutral-100",
        guion: "border-neutral-400",
    },
    Ofasa: {
        banner: "text-orange-950",
        burbujas: {
            "--bp-fondo1": "rgb(255, 237, 213)",
            "--bp-fondo2": "rgb(255, 247, 237)",
            "--bp-color1": "253, 186, 116",
            "--bp-color2": "249, 115, 22",
            "--bp-color3": "254, 215, 170",
            "--bp-color4": "251, 146, 60",
        },
        insignia: "bg-orange-500 text-white",
        fila: "bg-orange-50",
        guion: "border-orange-300",
    },
    Tenorio: {
        banner: "text-amber-950",
        burbujas: {
            "--bp-fondo1": "rgb(254, 243, 199)",
            "--bp-fondo2": "rgb(255, 251, 235)",
            "--bp-color1": "252, 211, 77",
            "--bp-color2": "245, 158, 11",
            "--bp-color3": "253, 230, 138",
            "--bp-color4": "251, 191, 36",
        },
        insignia: "bg-amber-400 text-amber-950",
        fila: "bg-amber-50",
        guion: "border-amber-400",
    },
};

const COLOR_NEUTRO = {
    banner: "text-gray-900",
    burbujas: {
        "--bp-fondo1": "rgb(229, 231, 235)",
        "--bp-fondo2": "rgb(243, 244, 246)",
        "--bp-color1": "209, 213, 219",
        "--bp-color2": "156, 163, 175",
        "--bp-color3": "229, 231, 235",
        "--bp-color4": "107, 114, 128",
    } as PaletaBurbujas,
    insignia: "bg-gray-500 text-white",
    fila: "bg-gray-50",
    guion: "border-gray-300",
};

const MEDICAMENTOS: Medicamento[] = [
    {
        id: 1,
        nombre: "Paracetamol 500 mg",
        presentacion: "Caja con 20 tabletas",
        codigoBarras: "7501234567890",
        precios: [
            { proveedor: "City", precio: 45, disponible: true },
            { proveedor: "Farmater", precio: 52, disponible: true },
            { proveedor: "Ofasa", precio: 48.5, disponible: true },
            { proveedor: "Tenorio", precio: 60, disponible: true },
        ],
    },
    {
        id: 2,
        nombre: "Loratadina 10 mg",
        presentacion: "Caja con 20 tabletas",
        codigoBarras: "7509876543210",
        precios: [
            { proveedor: "City", precio: 62, disponible: true },
            { proveedor: "Farmater", precio: 58, disponible: true },
            { proveedor: "Ofasa", precio: 65, disponible: true },
            { proveedor: "Tenorio", precio: 55, disponible: true },
        ],
    },
    {
        id: 3,
        nombre: "Amoxicilina 500 mg",
        presentacion: "Caja con 12 cápsulas",
        codigoBarras: "7501122334455",
        precios: [
            { proveedor: "City", precio: 152, disponible: true },
            { proveedor: "Farmater", precio: 145, disponible: true },
            { proveedor: "Ofasa", precio: 160, disponible: false },
            { proveedor: "Tenorio", precio: 148, disponible: true },
        ],
    },
    {
        id: 4,
        nombre: "Ibuprofeno 400 mg",
        presentacion: "Caja con 30 tabletas",
        codigoBarras: "7505566778899",
        precios: [
            { proveedor: "City", precio: 88.5, disponible: true },
            { proveedor: "Farmater", precio: 92, disponible: true },
            { proveedor: "Ofasa", precio: 85, disponible: true },
            { proveedor: "Tenorio", precio: 100, disponible: true },
        ],
    },
    {
        id: 5,
        nombre: "Omeprazol 20 mg",
        presentacion: "Caja con 14 cápsulas",
        codigoBarras: "7502233445566",
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
        codigoBarras: "7503344556677",
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
        codigoBarras: "7504455667788",
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
        codigoBarras: "7505566778800",
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
        codigoBarras: "7506677889900",
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
        codigoBarras: "7507788990011",
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
        codigoBarras: "7508899001122",
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
        codigoBarras: "7509900112233",
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

/** Precio sin decimales, para el rango compacto del banner ($45-$60). */
function precioCompacto(valor: number) {
    return `$${Math.round(valor)}`;
}

function IconoAhorro() {
    return (
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
                d="M3 7l6 6 4-4 8 8m0 0h-5m5 0v-5"
            />
        </svg>
    );
}

/**
 * Ranking de proveedores ordenado de más barato a más caro. Los agotados se
 * mandan al final y se muestran atenuados, ya que no compiten por el precio.
 */
function RankingProveedores({
    precios,
    ordenados,
}: {
    precios: PrecioProveedor[];
    ordenados: PrecioProveedor[];
}) {
    const ganador = ordenados.find((p) => p.disponible);

    return (
        <ul className="mt-4 flex flex-col gap-1">
            {ordenados.map((p, idx) => {
                const colores = COLOR_PROVEEDOR[p.proveedor] ?? COLOR_NEUTRO;
                const esGanador = p === ganador;

                return (
                    <li
                        key={p.proveedor}
                        className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${esGanador ? colores.fila : ""
                            }`}
                    >
                        {esGanador ? (
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${colores.insignia}`}
                            >
                                {idx + 1}
                            </span>
                        ) : (
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center font-mono text-sm ${p.disponible ? "text-gray-400" : "text-gray-300"
                                    }`}
                            >
                                {idx + 1}
                            </span>
                        )}

                        <span
                            className={`truncate text-sm ${esGanador
                                ? "font-bold text-gray-900"
                                : p.disponible
                                    ? "font-medium text-gray-600"
                                    : "font-medium text-gray-300"
                                }`}
                        >
                            {p.proveedor}
                        </span>

                        <span
                            aria-hidden="true"
                            className={`min-w-4 flex-1 border-t border-dashed ${esGanador
                                ? colores.guion
                                : p.disponible
                                    ? "border-gray-300"
                                    : "border-gray-200"
                                }`}
                        />

                        {p.disponible ? (
                            <span
                                className={`shrink-0 font-mono text-sm tabular-nums ${esGanador ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                                    }`}
                            >
                                {formatoPrecio(p.precio)}
                            </span>
                        ) : (
                            <span className="shrink-0 text-[13px] font-semibold text-rose-400">
                                Agotado
                            </span>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

function TarjetaProducto({ medicamento }: { medicamento: Medicamento }) {
    // Orden ascendente por precio; los agotados van al final.
    const ordenados = [...medicamento.precios].sort((a, b) => {
        if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
        return a.precio - b.precio;
    });

    const disponibles = ordenados.filter((p) => p.disponible);
    const ganador = disponibles[0] ?? null;
    const menorPrecio = ganador?.precio ?? null;
    const mayorPrecio = disponibles.length
        ? disponibles[disponibles.length - 1].precio
        : null;

    // Ahorro respecto al proveedor más caro disponible. Se trunca para no
    // prometer un porcentaje mayor al real.
    const ahorro =
        menorPrecio !== null && mayorPrecio !== null && mayorPrecio > 0
            ? Math.floor(((mayorPrecio - menorPrecio) / mayorPrecio) * 100)
            : 0;

    const colores = ganador
        ? COLOR_PROVEEDOR[ganador.proveedor] ?? COLOR_NEUTRO
        : COLOR_NEUTRO;

    return (
        <article className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200/80 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5 hover:ring-gray-300">
            {/* Encabezado: nombre y código de barras */}
            <h3 className="text-lg font-bold leading-snug text-gray-900">
                <Link
                    href={`/grid_productos/${medicamento.id}`}
                    className="transition hover:text-blue-700 focus:outline-none focus-visible:underline"
                >
                    {medicamento.nombre}
                </Link>
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5">
                <span className="font-mono text-[13px] tracking-tight text-gray-400">
                    {medicamento.codigoBarras}
                </span>
                <BotonCopiarCodigo codigo={medicamento.codigoBarras} />
            </div>

            {/* Resumen: cobertura de proveedores y ahorro */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 text-[13px]">
                {ahorro > 0 && (
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                        <IconoAhorro />
                        Ahorra {ahorro}%
                    </span>
                )}
            </div>

            {/* Banner del mejor precio, teñido con el color del proveedor ganador */}
            {ganador && menorPrecio !== null && mayorPrecio !== null && (
                <div
                    className={`relative isolate mt-4 overflow-hidden rounded-2xl px-5 py-4 ${colores.banner}`}
                >
                    {/* Fondo animado. `isolate` + `-z-10` lo dejan detrás del
                        contenido sin sacarlo de la tarjeta. */}
                    <div className="absolute inset-0 -z-10">
                        <BurbujasPrecio
                            idFiltro={`goo-precio-${medicamento.id}`}
                            paleta={colores.burbujas}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
                            Mejor precio
                        </p>
                        <p className="text-base font-bold leading-none">
                            {ganador.proveedor}
                        </p>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                        <p className="font-mono text-3xl font-bold leading-none tabular-nums">
                            {formatoPrecio(menorPrecio)}
                        </p>
                        {menorPrecio !== mayorPrecio && (
                            <p className="text-right text-xs leading-tight opacity-75">
                                rango
                                <br />
                                <span className="font-mono tabular-nums">
                                    {precioCompacto(menorPrecio)}-{precioCompacto(mayorPrecio)}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Ranking completo */}
            <RankingProveedores
                precios={medicamento.precios}
                ordenados={ordenados}
            />

            <button
                type="button"
                disabled={!ganador}
                className="mt-5 w-full rounded-2xl bg-slate-800 px-5 py-4 text-base font-semibold text-white transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
                Agregar al carrito
            </button>
        </article>
    );
}

export default function GridProductos() {
    return (
        <main className="relative isolate min-h-screen font-sans">
            {/* Fondo: degradado suave azul -> blanco. Va en una capa fija al
                viewport (-z-10) para que la transición sea continua y no se
                corte ni se repita al hacer scroll en páginas largas. */}
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
