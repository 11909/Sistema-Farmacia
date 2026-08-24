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

    // Aplanar el catálogo: cada oferta de proveedor es una fila independiente.
    // Esto refleja directamente la tabla Producto_Lista_Proveedores cruzada con Producto y Lista_Proveedores.
    let todasLasOfertas = catalogo.medicamentos.flatMap((med) =>
        med.precios.map((precio) => ({
            nombre: med.nombre,
            codigoBarras: med.codigoBarras,
            proveedor: precio.proveedor,
            precio: precio.precio,
            existencias: precio.existencias,
            unidad: precio.unidad,
            textoBusqueda: med.textoBusqueda,
        }))
    );

    // Filtrar por término de búsqueda (aplica al nombre y código de barras)
    if (termino) {
        todasLasOfertas = todasLasOfertas.filter((o) =>
            o.textoBusqueda.includes(termino)
        );
    }

    // Filtrar por proveedor
    if (provPedido) {
        todasLasOfertas = todasLasOfertas.filter(
            (o) => o.proveedor === provPedido
        );
    }

    // Paginación
    const totalPaginas = Math.max(Math.ceil(todasLasOfertas.length / POR_PAGINA), 1);
    const pedida = Number.parseInt(parametros.p ?? "1", 10);
    const pagina = Number.isFinite(pedida)
        ? Math.min(Math.max(pedida, 1), totalPaginas)
        : 1;

    const desde = (pagina - 1) * POR_PAGINA;
    const filas = todasLasOfertas.slice(desde, desde + POR_PAGINA);

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
                totalResultados={todasLasOfertas.length}
            />
        </div>
    );
}