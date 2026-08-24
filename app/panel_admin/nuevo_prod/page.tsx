import { obtenerCatalogo } from "../../lib/catalogo";
import FormNuevoProducto from "../../ui/panel_admin/FormNuevoProducto";

export const metadata = {
    title: "Nuevo Medicamento | Panel",
};

export default async function NuevoProductoPage() {
    // Obtenemos los proveedores del catálogo para el dropdown
    const catalogo = await obtenerCatalogo();
    
    // Convertimos a un arreglo simple id/nombre
    const proveedores = catalogo.directorio.lista.map((p) => ({
        id: p.id,
        nombre: p.nombre,
    }));

    return (
        <div className="flex w-full items-center justify-center p-4">
            <FormNuevoProducto proveedores={proveedores} />
        </div>
    );
}
