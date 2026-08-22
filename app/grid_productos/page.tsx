// Comparador de precios por proveedor
import Link from "next/link";
import BotonCopiarCodigo from "../ui/grid_productos/BotonCopiarCodigo";
import BotonAgregarCarrito from "../ui/grid_productos/BotonAgregarCarrito";
import BurbujasPrecio from "../ui/grid_productos/BurbujasPrecio";
import {
    coloresDe,
    formatoPrecio,
    precioCompacto,
} from "../ui/grid_productos/coloresProveedor";
import type { PaletasProveedor } from "../lib/proveedores";
import { requerirSesion } from "../lib/sesion";
import { puedeVerPrecios } from "../lib/permisos";
// El catálogo vive en `app/lib/catalogo.ts` porque el carrito también lo
// necesita para reconstruir sus partidas desde los códigos de barras guardados.
import {
    normalizarTexto,
    obtenerCatalogo,
    ofertasOrdenadas,
    type Medicamento,
    type PrecioProveedor,
} from "../lib/catalogo";

/**
 * Tarjetas por página.
 *
 * La hoja tiene unos 9 700 productos: pintarlos todos daría una respuesta de
 * decenas de megabytes y un DOM inmanejable. Es múltiplo de 3 para que la
 * última fila del grid quede completa en pantallas anchas.
 */
const POR_PAGINA = 24;

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
    ordenados,
    mostrarPrecios,
}: {
    ordenados: PrecioProveedor[];
    /** Con `false` se ve el orden de proveedores pero no los importes. */
    mostrarPrecios: boolean;
}) {
    const ganador = ordenados.find((p) => p.disponible);

    // La mayoría de los productos de la hoja solo tiene un proveedor, así que
    // conviene decirlo en lugar de pintar una comparativa de un solo renglón
    // como si fuera el resultado de comparar.
    if (ordenados.length === 0) {
        return (
            <p className="mt-4 rounded-xl bg-gray-50 px-3 py-2.5 text-[13px] text-gray-500">
                Sin precios registrados en la hoja.
            </p>
        );
    }

    return (
        <ul className="mt-4 flex flex-col gap-1">
            {ordenados.map((p, idx) => {
                // Sin paletas de la hoja: el ranking solo usa clases de
                // Tailwind (`fila`, `insignia`, `guion`), no las burbujas.
                const colores = coloresDe(p.proveedor);
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

                        {!p.disponible ? (
                            <span className="shrink-0 text-[13px] font-semibold text-rose-400">
                                Agotado
                            </span>
                        ) : (
                            mostrarPrecios && (
                                <span
                                    className={`shrink-0 font-mono text-sm tabular-nums ${esGanador ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                                        }`}
                                >
                                    {formatoPrecio(p.precio)}
                                </span>
                            )
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

function TarjetaProducto({
    medicamento,
    paletas,
    mostrarPrecios,
}: {
    medicamento: Medicamento;
    /** Colores de burbujas de `Lista_Proveedores`, para teñir el banner. */
    paletas: PaletasProveedor;
    /**
     * Si se pintan los importes. Con `false` la tarjeta enseña el ranking de
     * proveedores y el ganador, pero ningún precio.
     *
     * Como es un componente de servidor, lo que no se pinta aquí tampoco llega
     * al navegador: no hay precio escondido en el HTML ni en el payload.
     */
    mostrarPrecios: boolean;
}) {
    // Orden ascendente por precio; los agotados van al final.
    const ordenados = ofertasOrdenadas(medicamento);

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

    const colores = coloresDe(ganador?.proveedor, paletas);

    return (
        <article className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200/80 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5 hover:ring-gray-300">
            {/* Encabezado: nombre y código de barras, los dos de `Producto`.
                El nombre va en texto plano porque no hay ficha de producto a la
                que enlazar: `/grid_productos/[codigo]` no existe como ruta. */}
            <h3 className="text-lg font-bold leading-snug text-gray-900">
                {medicamento.nombre}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5">
                <span className="font-mono text-[13px] tracking-tight text-gray-400">
                    {medicamento.codigoBarras}
                </span>
                <BotonCopiarCodigo codigo={medicamento.codigoBarras} />
            </div>

            {/* Resumen: ahorro respecto al proveedor más caro. El porcentaje se
                deriva de los precios, así que también es dato de importe y solo
                lo ve quien puede verlos. */}
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 text-[13px]">
                {mostrarPrecios && ahorro > 0 && (
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
                            idFiltro={`goo-precio-${medicamento.codigoBarras}`}
                            paleta={colores.burbujas}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
                            {disponibles.length === 1
                                ? "Único proveedor"
                                : mostrarPrecios
                                    ? "Mejor precio"
                                    : "Proveedor sugerido"}
                        </p>
                        {/* Con precios el nombre del proveedor va arriba, porque
                            el dato grande es el importe. Sin ellos el proveedor
                            pasa a ser el dato grande y aquí sobraría. */}
                        {mostrarPrecios && (
                            <p className="text-base font-bold leading-none">
                                {ganador.proveedor}
                            </p>
                        )}
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                        {mostrarPrecios ? (
                            <p className="font-mono text-3xl font-bold leading-none tabular-nums">
                                {formatoPrecio(menorPrecio)}
                            </p>
                        ) : (
                            <p className="text-2xl font-bold leading-tight">
                                {ganador.proveedor}
                            </p>
                        )}
                        {mostrarPrecios && menorPrecio !== mayorPrecio && (
                            <p className="text-right text-xs leading-tight opacity-75">
                                rango
                                <br />
                                <span className="font-mono tabular-nums">
                                    {precioCompacto(menorPrecio)}-{precioCompacto(mayorPrecio)}
                                </span>
                            </p>
                        )}
                        {(!mostrarPrecios || menorPrecio === mayorPrecio) &&
                            ganador.unidad && (
                                <p className="text-right text-xs leading-tight opacity-75">
                                    por
                                    <br />
                                    <span className="font-semibold">{ganador.unidad}</span>
                                </p>
                            )}
                    </div>
                </div>
            )}

            {/* Ranking completo. Es lo que ve una sucursal: el orden de
                proveedores de más barato a más caro, sin los importes. */}
            <RankingProveedores
                ordenados={ordenados}
                mostrarPrecios={mostrarPrecios}
            />

            {/* El proveedor que se agrega es el ganador del comparador: el más
                barato entre los disponibles. */}
            <BotonAgregarCarrito
                codigoBarras={medicamento.codigoBarras}
                proveedor={ganador?.proveedor ?? null}
                nombre={medicamento.nombre}
            />
        </article>
    );
}

/**
 * Números de página a mostrar, con `null` donde va una elipsis.
 *
 * Con ~400 páginas no se pueden listar todas: se muestran la primera, la
 * última y una ventana alrededor de la actual.
 */
function ventanaDePaginas(actual: number, total: number): (number | null)[] {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const paginas = new Set<number>([1, total, actual]);
    for (const delta of [-2, -1, 1, 2]) {
        const pagina = actual + delta;
        if (pagina > 1 && pagina < total) paginas.add(pagina);
    }

    const ordenadas = [...paginas].sort((a, b) => a - b);
    const conHuecos: (number | null)[] = [];

    ordenadas.forEach((pagina, i) => {
        if (i > 0 && pagina - ordenadas[i - 1] > 1) conHuecos.push(null);
        conHuecos.push(pagina);
    });

    return conHuecos;
}

/** Enlace de paginación que conserva el término de búsqueda. */
function enlacePagina(pagina: number, q: string): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (pagina > 1) params.set("p", String(pagina));

    const cadena = params.toString();
    return cadena ? `/grid_productos?${cadena}` : "/grid_productos";
}

export default async function GridProductos({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; p?: string }>;
}) {
    const [parametros, catalogo, sesion] = await Promise.all([
        searchParams,
        // Trae los productos, sus precios por proveedor y las paletas de color
        // en una sola lectura de la hoja.
        obtenerCatalogo(),
        // El layout del segmento ya exige sesión, pero aquí hace falta el rol
        // para decidir qué se enseña, así que se vuelve a pedir en lugar de
        // confiar en el padre.
        requerirSesion("/grid_productos"),
    ]);

    // Las sucursales ven el ranking de proveedores pero no los precios.
    const mostrarPrecios = puedeVerPrecios(sesion.user?.rol);

    const q = (parametros.q ?? "").trim();

    // El filtro compara contra `textoBusqueda`, que ya viene normalizado, así
    // que sirve tanto para el nombre como para el código de barras.
    const termino = normalizarTexto(q);
    const encontrados = termino
        ? catalogo.medicamentos.filter((m) => m.textoBusqueda.includes(termino))
        : catalogo.medicamentos;

    const totalPaginas = Math.max(Math.ceil(encontrados.length / POR_PAGINA), 1);

    // La página llega por URL, así que puede venir con cualquier cosa: se acota
    // al rango válido en lugar de devolver una página vacía.
    const pedida = Number.parseInt(parametros.p ?? "1", 10);
    const pagina = Number.isFinite(pedida)
        ? Math.min(Math.max(pedida, 1), totalPaginas)
        : 1;

    const desde = (pagina - 1) * POR_PAGINA;
    const visibles = encontrados.slice(desde, desde + POR_PAGINA);

    return (
        // El fondo degradado y la barra superior viven en `layout.tsx`,
        // compartidos con las rutas hijas del segmento y con `loading.tsx`.
        <main>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <p className="mb-4 text-sm text-gray-500">
                    {encontrados.length > 0 ? (
                        <>
                            Mostrando{" "}
                            <span className="font-semibold text-gray-700">
                                {desde + 1}-{desde + visibles.length}
                            </span>{" "}
                            de{" "}
                            <span className="font-semibold text-gray-700">
                                {encontrados.length.toLocaleString("es-MX")}
                            </span>{" "}
                            productos
                            {q && (
                                <>
                                    {" "}
                                    para{" "}
                                    <span className="font-semibold text-gray-700">“{q}”</span>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            Ningún producto coincide con{" "}
                            <span className="font-semibold text-gray-700">“{q}”</span>.{" "}
                            <Link
                                href="/grid_productos"
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                Ver todo el catálogo
                            </Link>
                        </>
                    )}
                </p>

                {/* Grid de tarjetas.
                    Sin `Suspense` por tarjeta: los precios ya vienen resueltos
                    en `catalogo`, así que `TarjetaProducto` es síncrona y un
                    límite por tarjeta solo añadiría 24 esqueletos a cada
                    respuesta para luego sustituirlos. El esqueleto de la carga
                    inicial lo pone `loading.tsx`, que cubre toda la página
                    mientras se resuelve esta. */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {visibles.map((med) => (
                        <TarjetaProducto
                            key={med.codigoBarras}
                            medicamento={med}
                            paletas={catalogo.paletas}
                            mostrarPrecios={mostrarPrecios}
                        />
                    ))}
                </div>

                {/* Paginación. Son enlaces y no botones para que cada página
                    tenga su URL y funcione el historial del navegador. */}
                {totalPaginas > 1 && (
                    <nav
                        aria-label="Paginación"
                        className="mt-10 flex flex-wrap items-center justify-center gap-2"
                    >
                        {pagina > 1 ? (
                            <Link
                                href={enlacePagina(pagina - 1, q)}
                                rel="prev"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Anterior
                            </Link>
                        ) : (
                            <span
                                aria-hidden="true"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400"
                            >
                                Anterior
                            </span>
                        )}

                        {ventanaDePaginas(pagina, totalPaginas).map((n, i) =>
                            n === null ? (
                                <span
                                    key={`hueco-${i}`}
                                    aria-hidden="true"
                                    className="px-1 text-sm text-gray-400"
                                >
                                    …
                                </span>
                            ) : (
                                <Link
                                    key={n}
                                    href={enlacePagina(n, q)}
                                    aria-current={n === pagina ? "page" : undefined}
                                    aria-label={`Página ${n}`}
                                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${n === pagina
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {n}
                                </Link>
                            ),
                        )}

                        {pagina < totalPaginas ? (
                            <Link
                                href={enlacePagina(pagina + 1, q)}
                                rel="next"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Siguiente
                            </Link>
                        ) : (
                            <span
                                aria-hidden="true"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400"
                            >
                                Siguiente
                            </span>
                        )}
                    </nav>
                )}
            </div>
        </main>
    );
}
