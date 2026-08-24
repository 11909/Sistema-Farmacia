import { obtenerCatalogo, normalizarTexto } from "../../lib/catalogo";
import TablaMedicamentos from "../../ui/panel_admin/TablaMedicamentos";

const POR_PAGINA = 24;

/**
 * Página de medicamentos del panel de administración.
 *
 * Muestra todos los productos del catálogo en una tabla con búsqueda,
 * filtro por proveedor y acciones de editar/eliminar.
 */
export default async function PanelProductos({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; prov?: string; p?: string }>;
}) {
    const [catalogo, parametros] = await Promise.all([
        obtenerCatalogo(),
        searchParams,
    ]);

    const q = (parametros.q ?? "").trim();
    const provPedido = (parametros.prov ?? "").trim();
    const termino = normalizarTexto(q);
    // Proveedores únicos para el filtro (de todo el catálogo)
    const proveedoresUnicos = [
        ...new Set(
            catalogo.medicamentos.flatMap((m) =>
                m.precios.map((p) => p.proveedor),
            ),
        ),
    ].sort((a, b) => a.localeCompare(b, "es"));

    // Filtrar por término de búsqueda
    let buscados = catalogo.medicamentos;
    if (termino) {
        buscados = buscados.filter((m) => m.textoBusqueda.includes(termino));
    }

    // Filtrar por proveedor
    let encontrados = buscados;
    if (provPedido) {
        encontrados = encontrados.filter((m) =>
            m.precios.some((p) => p.proveedor === provPedido),
        );
    }

    // Paginación
    const totalPaginas = Math.max(Math.ceil(encontrados.length / POR_PAGINA), 1);
    const pedida = Number.parseInt(parametros.p ?? "1", 10);
    const pagina = Number.isFinite(pedida)
        ? Math.min(Math.max(pedida, 1), totalPaginas)
        : 1;

    const desde = (pagina - 1) * POR_PAGINA;
    const visibles = encontrados.slice(desde, desde + POR_PAGINA);

    // Mapear a filas
    const filas = visibles.map((med) => {
        // Ordenar por precio para tomar el más barato como referencia
        const ordenados = [...med.precios].sort((a, b) => a.precio - b.precio);
        // Si hay un filtro de proveedor, mostramos el precio de ese proveedor
        const mejor = provPedido
            ? ordenados.find((p) => p.proveedor === provPedido) ?? ordenados[0]
            : ordenados[0];

        return {
            nombre: med.nombre,
            codigoBarras: med.codigoBarras,
            proveedor: mejor?.proveedor ?? "—",
            precio: mejor?.precio ?? 0,
            existencias: mejor?.existencias,
            unidad: mejor?.unidad,
        };
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    Medicamentos
                </h1>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Nuevo medicamento
                </button>
            </div>

            {/* Tabla interactiva */}
            <TablaMedicamentos
                filas={filas}
                proveedores={proveedoresUnicos}
                q={q}
                prov={provPedido}
                pagina={pagina}
                totalPaginas={totalPaginas}
                totalResultados={encontrados.length}
            />
        </div>
    );
}