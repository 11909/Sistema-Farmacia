import BotonCopiarCodigo from "./BotonCopiarCodigo";
import SelectorProveedor from "./SelectorProveedor";
import type { FondosSeleccion, PaletasProveedor } from "../../lib/proveedores";
import {
    conSobrecoste,
    sinPreciosOfertas,
    EXISTENCIAS_POR_DEFECTO,
    ofertasOrdenadas,
    type OfertaVisible,
    type Medicamento,
} from "../../lib/tiposCatalogo";

export default function TarjetaProducto({
    medicamento,
    paletas,
    fondos,
    mostrarPrecios,
    desactivarCarrito,
}: {
    medicamento: Medicamento;
    paletas: PaletasProveedor;
    fondos: FondosSeleccion;
    mostrarPrecios: boolean;
    desactivarCarrito?: boolean;
}) {
    const ordenados = ofertasOrdenadas(medicamento);

    const ofertas: OfertaVisible[] = conSobrecoste(
        ordenados.map((p) => {
            const oferta: OfertaVisible = {
                proveedor: p.proveedor,
                precio: p.precio,
                disponible: p.disponible,
                existencias: p.existencias ?? EXISTENCIAS_POR_DEFECTO,
            };
            if (p.unidad !== undefined) oferta.unidad = p.unidad;
            return oferta;
        }),
    );

    return (
        <article className="flex flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-200/80 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5 hover:ring-gray-300">
            <h3 className="text-lg font-bold leading-snug text-gray-900">
                {medicamento.nombre}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5">
                <span className="font-mono text-[13px] tracking-tight text-gray-400">
                    {medicamento.codigoBarras}
                </span>
                <BotonCopiarCodigo codigo={medicamento.codigoBarras} />
            </div>

            <div className="mt-4 border-t border-gray-100" />

            <SelectorProveedor
                codigoBarras={medicamento.codigoBarras}
                nombre={medicamento.nombre}
                ofertas={mostrarPrecios ? ofertas : sinPreciosOfertas(ofertas)}
                paletas={paletas}
                fondos={fondos}
                mostrarPrecios={mostrarPrecios}
                desactivarCarrito={desactivarCarrito}
            />
        </article>
    );
}
