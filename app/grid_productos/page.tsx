// Comparador de precios por proveedor
import Link from "next/link";
import BotonCopiarCodigo from "../ui/grid_productos/BotonCopiarCodigo";
import FiltroProveedores from "../ui/grid_productos/FiltroProveedores";
import SelectorProveedor from "../ui/grid_productos/SelectorProveedor";
import type {
    FondosSeleccion,
    PaletasProveedor,
} from "../lib/proveedores";
import {
    conSobrecoste,
    sinPreciosOfertas,
    type OfertaVisible,
} from "../lib/tiposCatalogo";
import { requerirSesion } from "../lib/sesion";
import { puedeVerPrecios } from "../lib/permisos";
// El catálogo vive en `app/lib/catalogo.ts` porque el carrito también lo
// necesita para reconstruir sus partidas desde los códigos de barras guardados.
import {
    EXISTENCIAS_POR_DEFECTO,
    normalizarTexto,
    obtenerCatalogo,
    ofertasOrdenadas,
    ofreceProveedor,
    type Medicamento,
} from "../lib/catalogo";

/**
 * Tarjetas por página.
 *
 * La hoja tiene unos 9 700 productos: pintarlos todos daría una respuesta de
 * decenas de megabytes y un DOM inmanejable. Es múltiplo de 3 para que la
 * última fila del grid quede completa en pantallas anchas.
 */
const POR_PAGINA = 24;

function TarjetaProducto({
    medicamento,
    paletas,
    fondos,
    mostrarPrecios,
}: {
    medicamento: Medicamento;
    /** Colores de burbujas de `Lista_Proveedores`, para teñir el banner. */
    paletas: PaletasProveedor;
    /** Paradas de `selector_color`, para marcar al proveedor elegido. */
    fondos: FondosSeleccion;
    /**
     * Si se pintan los importes. Con `false` la tarjeta enseña el ranking de
     * proveedores y el ganador, pero ningún precio.
     *
     * Lo que la tarjeta pinta por su cuenta es de servidor, así que con `false`
     * no llega al navegador ni en el HTML ni en el payload. Las ofertas son el
     * caso aparte: van como prop al selector, que es de cliente, y ahí sí
     * viajarían, así que se les quita el precio antes (ver `ofertas`).
     */
    mostrarPrecios: boolean;
}) {
    // Orden ascendente por precio; los agotados van al final.
    const ordenados = ofertasOrdenadas(medicamento);

    // Lo que se le entrega al selector, que es de cliente. A una cuenta de
    // sucursal se le quitan los importes aquí, antes de que las ofertas entren
    // en el payload: no basta con no pintarlos, porque lo que va como prop a un
    // componente de cliente viaja al navegador.
    //
    // `conSobrecoste` va antes del recorte porque necesita los precios para
    // calcular el porcentaje. El porcentaje sí sobrevive al recorte: es una
    // proporción, no un importe (ver `OfertaVisible`).
    const ofertas: OfertaVisible[] = conSobrecoste(
        ordenados.map((p) => {
            const oferta: OfertaVisible = {
                proveedor: p.proveedor,
                precio: p.precio,
                disponible: p.disponible,
                // Cuando la hoja no da una cantidad (trae la unidad de venta en
                // esa celda) no hay tope real que aplicar, así que se usa el
                // mismo por defecto que el carrito.
                existencias: p.existencias ?? EXISTENCIAS_POR_DEFECTO,
            };
            if (p.unidad !== undefined) oferta.unidad = p.unidad;
            return oferta;
        }),
    );

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

            {/* Separador entre la ficha del producto y el comparador. El aviso
                de precio que iba aquí lo pinta ahora `AvisoPrecio`, dentro de
                `SelectorProveedor`, porque su texto y su color dependen del
                proveedor que esté elegido. */}
            <div className="mt-4 border-t border-gray-100" />

            {/* El banner del proveedor lo pinta `SelectorProveedor`, porque
                tiene que seguir a la selección del ranking.

                Ranking completo y elegible: el orden de proveedores de más
                barato a más caro, con el ganador marcado por defecto y la fila
                elegida teñida con el `bubble_background` de su proveedor. El
                botón agrega el proveedor que quede seleccionado, no forzosamente
                el más barato. */}
            <SelectorProveedor
                codigoBarras={medicamento.codigoBarras}
                nombre={medicamento.nombre}
                ofertas={mostrarPrecios ? ofertas : sinPreciosOfertas(ofertas)}
                paletas={paletas}
                fondos={fondos}
                mostrarPrecios={mostrarPrecios}
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

/**
 * URL del catálogo con el estado que se le pase.
 *
 * Único sitio donde se arma la query, para que ningún enlace se deje por el
 * camino un parámetro de otro: la paginación tiene que conservar el filtro y la
 * búsqueda, y el filtro tiene que conservar la búsqueda.
 *
 * Los valores por defecto (sin búsqueda, sin filtro, página 1) se omiten, así la
 * portada del catálogo es `/grid_productos` a secas.
 */
function enlaceCatalogo({
    q = "",
    prov = null,
    pagina = 1,
}: {
    q?: string;
    prov?: string | null;
    pagina?: number;
}): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (prov) params.set("prov", prov);
    if (pagina > 1) params.set("p", String(pagina));

    const cadena = params.toString();
    return cadena ? `/grid_productos?${cadena}` : "/grid_productos";
}

export default async function GridProductos({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; p?: string; prov?: string }>;
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

    // La búsqueda compara contra `textoBusqueda`, que ya viene normalizado, así
    // que sirve tanto para el nombre como para el código de barras.
    const termino = normalizarTexto(q);
    const buscados = termino
        ? catalogo.medicamentos.filter((m) => m.textoBusqueda.includes(termino))
        : catalogo.medicamentos;

    // Proveedor filtrado. Llega por URL como `id_proveedor`, así que puede venir
    // con cualquier cosa: si no está en `Lista_Proveedores` se ignora el filtro
    // en lugar de devolver una página vacía sin explicación.
    const provPedido = (parametros.prov ?? "").trim();
    const nombreFiltrado =
        catalogo.directorio.nombrePorId.get(provPedido) ?? null;
    const prov = nombreFiltrado ? provPedido : null;

    // Cuántos productos ofrece cada proveedor de lo ya encontrado por la
    // búsqueda. Se cuenta sobre `buscados` y no sobre el catálogo entero para que
    // el número de la pastilla diga lo que se va a ver al pulsarla.
    const conteos = new Map<string, number>();
    for (const proveedor of catalogo.directorio.lista) {
        conteos.set(
            proveedor.id,
            buscados.reduce(
                (total, m) => (ofreceProveedor(m, proveedor.nombre) ? total + 1 : total),
                0,
            ),
        );
    }

    const encontrados = nombreFiltrado
        ? buscados.filter((m) => ofreceProveedor(m, nombreFiltrado))
        : buscados;

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
                {/* Cambiar de proveedor vuelve a la página 1: el conjunto de
                    resultados es otro, y la página 12 del filtro anterior no
                    significa nada en el nuevo. La búsqueda sí se conserva. */}
                <FiltroProveedores
                    proveedores={catalogo.directorio.lista}
                    activo={prov}
                    conteos={conteos}
                    paletas={catalogo.paletas}
                    enlaceDe={(id) => enlaceCatalogo({ q, prov: id })}
                />

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
                            {nombreFiltrado && (
                                <>
                                    {" "}
                                    de{" "}
                                    <span className="font-semibold text-gray-700">
                                        {nombreFiltrado}
                                    </span>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            Ningún producto{" "}
                            {nombreFiltrado && (
                                <>
                                    de{" "}
                                    <span className="font-semibold text-gray-700">
                                        {nombreFiltrado}
                                    </span>{" "}
                                </>
                            )}
                            {q ? (
                                <>
                                    coincide con{" "}
                                    <span className="font-semibold text-gray-700">
                                        “{q}”
                                    </span>
                                </>
                            ) : (
                                "está registrado en la hoja"
                            )}
                            .{" "}
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
                            fondos={catalogo.fondosSeleccion}
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
                                href={enlaceCatalogo({ q, prov, pagina: pagina - 1 })}
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
                                    href={enlaceCatalogo({ q, prov, pagina: n })}
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
                                href={enlaceCatalogo({ q, prov, pagina: pagina + 1 })}
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
