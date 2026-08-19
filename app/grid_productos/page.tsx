// Catálogo de productos (estilo e-commerce)
import Link from "next/link";
import IconoLogin from "../components/IconoLogin";

type Icono = "pastilla" | "frasco" | "tubo" | "caja";

type Producto = {
    id: number;
    nombre: string;
    precio: number;
    precioAnterior?: number;
    rating: number;
    reseñas: number;
    stock: number;
    icono: Icono;
    gradiente: string;
};

const CATEGORIAS = [
    "Todos",
    "City",
    "Farmater",
    "Ofasa",
    "Tenorio"
];

const PRODUCTOS: Producto[] = [
    {
        id: 1,
        nombre: "Paracetamol 500 mg",

        precio: 45,
        precioAnterior: 60,
        rating: 4.8,
        reseñas: 214,
        stock: 128,
        icono: "pastilla",
        gradiente: "from-blue-100 to-cyan-50",
    },
    {
        id: 2,
        nombre: "Ibuprofeno 400 mg",
        precio: 78.5,
        rating: 4.6,
        reseñas: 96,
        stock: 64,
        icono: "pastilla",
        gradiente: "from-rose-100 to-orange-50",
    },
    {
        id: 3,
        nombre: "Amoxicilina 500 mg",
        precio: 152,
        precioAnterior: 180,
        rating: 4.4,
        reseñas: 51,
        stock: 22,
        icono: "caja",
        gradiente: "from-emerald-100 to-teal-50",
    },
    {
        id: 4,
        nombre: "Loratadina 10 mg",

        precio: 62,
        rating: 4.5,
        reseñas: 78,
        stock: 9,
        icono: "pastilla",
        gradiente: "from-violet-100 to-indigo-50",
    },
    {
        id: 5,
        nombre: "Omeprazol 20 mg",

        precio: 89,
        precioAnterior: 110,
        rating: 4.7,
        reseñas: 133,
        stock: 47,
        icono: "caja",
        gradiente: "from-amber-100 to-yellow-50",
    },
    {
        id: 6,
        nombre: "Vitamina C 1 g",

        precio: 135,
        rating: 4.9,
        reseñas: 302,
        stock: 85,
        icono: "frasco",
        gradiente: "from-orange-100 to-amber-50",
    },
    {
        id: 7,
        nombre: "Jarabe expectorante",

        precio: 98,
        rating: 4.2,
        reseñas: 44,
        stock: 31,
        icono: "frasco",
        gradiente: "from-sky-100 to-blue-50",
    },
    {
        id: 8,
        nombre: "Gel antibacterial 70%",

        precio: 55,
        precioAnterior: 75,
        rating: 4.3,
        reseñas: 187,
        stock: 210,
        icono: "frasco",
        gradiente: "from-teal-100 to-emerald-50",
    },
    {
        id: 9,
        nombre: "Crema hidratante corporal",

        precio: 124,
        rating: 4.6,
        reseñas: 65,
        stock: 0,
        icono: "tubo",
        gradiente: "from-pink-100 to-rose-50",
    },
    {
        id: 10,
        nombre: "Suero oral electrolitos",

        precio: 32,
        rating: 4.5,
        reseñas: 58,
        stock: 143,
        icono: "frasco",
        gradiente: "from-lime-100 to-green-50",
    },
    {
        id: 11,
        nombre: "Termómetro digital",

        precio: 249,
        precioAnterior: 320,
        rating: 4.7,
        reseñas: 91,
        stock: 6,
        icono: "caja",
        gradiente: "from-slate-100 to-gray-50",
    },
    {
        id: 12,
        nombre: "Cubrebocas KN95",

        precio: 89,
        rating: 4.1,
        reseñas: 122,
        stock: 74,
        icono: "caja",
        gradiente: "from-indigo-100 to-sky-50",
    },
];

function formatoPrecio(valor: number) {
    return `$${valor.toFixed(2)}`;
}

function calcularDescuento(precio: number, precioAnterior: number) {
    return Math.round((1 - precio / precioAnterior) * 100);
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


function TarjetaProducto({ producto }: { producto: Producto }) {
    const agotado = producto.stock === 0;

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
            {/* Imagen / arte del producto */}
            <div
                className={`relative flex aspect-square items-center justify-center bg-gradient-to-br ${producto.gradiente}`}
            >
                <div className="transition-transform duration-300 group-hover:scale-110">
                    <IconoProducto tipo={producto.icono} />
                </div>
            </div>

            {/* Detalle */}
            <div className="flex flex-1 flex-col gap-2 p-4">

                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
                    <Link
                        href={`/grid_productos/${producto.id}`}
                        className="transition hover:text-blue-700 focus:underline focus:outline-none"
                    >
                        {producto.nombre}
                    </Link>
                </h3>

                <div className="mt-auto space-y-2 pt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                            {formatoPrecio(producto.precio)}
                        </span>
                        {producto.precioAnterior && (
                            <span className="text-sm text-gray-400 line-through">
                                {formatoPrecio(producto.precioAnterior)}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={agotado}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    >
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
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        {agotado ? "No disponible" : "Agregar al carrito"}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function GridProductos() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Barra superior */}
            <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                            <IconoLogin></IconoLogin>
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
                                placeholder="Buscar medicamentos por codigo de barras"
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm transition placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </form>

                    <button
                        type="button"
                        className="relative ml-auto flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {/* Filtros */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIAS.map((categoria, i) => (
                            <button
                                key={categoria}
                                type="button"
                                aria-pressed={i === 0}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${i === 0
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700"
                                    }`}
                            >
                                {categoria}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="orden" className="text-sm text-gray-500">
                            Ordenar por
                        </label>
                        <select
                            id="orden"
                            name="orden"
                            defaultValue="relevancia"
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="relevancia">Relevancia</option>
                            <option value="precio-asc">Menor precio</option>
                            <option value="precio-desc">Mayor precio</option>
                            <option value="rating">Mejor calificados</option>
                        </select>
                    </div>
                </div>

                <p className="mb-4 text-sm text-gray-500">
                    Mostrando{" "}
                    <span className="font-semibold text-gray-700">
                        {PRODUCTOS.length}
                    </span>{" "}
                    productos
                </p>

                {/* Grid de tarjetas */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {PRODUCTOS.map((producto) => (
                        <TarjetaProducto key={producto.id} producto={producto} />
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
