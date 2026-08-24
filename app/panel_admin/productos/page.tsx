import { obtenerCatalogo } from "../../lib/catalogo";
import TablaMedicamentos from "../../ui/panel_admin/TablaMedicamentos";

/**
 * Página de medicamentos del panel de administración.
 *
 * Muestra todos los productos del catálogo en una tabla con búsqueda,
 * filtro por proveedor y acciones de editar/eliminar.
 */
export default async function PanelProductos() {
    const catalogo = await obtenerCatalogo();

    // Lista plana: un medicamento puede tener varias ofertas de proveedores.
    // Aplanamos a filas de tabla con el primer proveedor (o el más barato).
    const filas = catalogo.medicamentos.map((med) => {
        // Ordenar por precio para tomar el más barato como referencia
        const ordenados = [...med.precios].sort((a, b) => a.precio - b.precio);
        const mejor = ordenados[0] ?? null;

        return {
            nombre: med.nombre,
            codigoBarras: med.codigoBarras,
            proveedor: mejor?.proveedor ?? "—",
            precio: mejor?.precio ?? 0,
            existencias: mejor?.existencias,
            unidad: mejor?.unidad,
        };
    });

    // Proveedores únicos para el filtro
    const proveedoresUnicos = [
        ...new Set(
            catalogo.medicamentos.flatMap((m) =>
                m.precios.map((p) => p.proveedor),
            ),
        ),
    ].sort((a, b) => a.localeCompare(b, "es"));

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

            {/* Tabla interactiva (cliente) con búsqueda y filtro */}
            <TablaMedicamentos
                filas={filas}
                proveedores={proveedoresUnicos}
            />
        </div>
    );
}