import BurbujasPrecio from "./BurbujasPrecio";
import {
    coloresDe,
    formatoPrecio,
    precioCompacto,
} from "./coloresProveedor";
import type { PaletasProveedor } from "../../lib/proveedores";
import type { OfertaVisible } from "../../lib/tiposCatalogo";

/**
 * Banner del proveedor elegido en la tarjeta.
 *
 * Refleja la selección del ranking, no el ganador de la comparación: al marcar
 * otro proveedor cambia el nombre, el precio y la paleta de las burbujas, así que
 * el banner siempre habla del proveedor con el que se va a comprar.
 *
 * Con el primer puesto elegido la leyenda es la de siempre ("Mejor precio" para
 * administradores, "Proveedor sugerido" para sucursales, "Único proveedor" si no
 * hay con quién comparar). Con cualquier otro pasa a decir el puesto que ocupa y
 * cuánto se paga de más respecto al primero, que es el aviso de que se está
 * dejando pasar el precio más bajo.
 *
 * Estaba en `page.tsx` como servidor. Se movió aquí porque la selección es estado
 * de cliente y el banner tiene que seguirla. Los importes siguen sin llegar al
 * navegador cuando no tocan: llegan en `ofertas`, que la página ya recorta con
 * `sinPreciosOfertas` antes de pasarlas.
 */

export default function BannerProveedor({
    idFiltro,
    ofertas,
    seleccionada,
    paletas,
    mostrarPrecios,
}: {
    /** Id del filtro SVG de las burbujas; único por tarjeta. */
    idFiltro: string;
    /** Todas las ofertas del producto, en el orden del ranking. */
    ofertas: OfertaVisible[];
    /** La oferta marcada en el ranking. */
    seleccionada: OfertaVisible;
    paletas: PaletasProveedor;
    mostrarPrecios: boolean;
}) {
    const colores = coloresDe(seleccionada.proveedor, paletas);

    // Puesto tal como lo numera el ranking de abajo, para que el banner y la
    // lista digan el mismo número. Se busca por nombre y no por identidad del
    // objeto, que es lo que no puede fallar si en el futuro las ofertas se
    // reconstruyen en el camino.
    const puesto =
        ofertas.findIndex((o) => o.proveedor === seleccionada.proveedor) + 1;
    const disponibles = ofertas.filter((o) => o.disponible);

    const precios = disponibles
        .map((o) => o.precio)
        .filter((p): p is number => p !== undefined);
    const menor = precios.length ? Math.min(...precios) : null;
    const mayor = precios.length ? Math.max(...precios) : null;

    // Viene calculado del servidor, así que está también cuando los precios no:
    // el sobrecoste es una proporción y no revela el importe (ver `OfertaVisible`).
    const extra = puesto > 1 ? (seleccionada.extra ?? 0) : 0;

    const leyenda =
        puesto > 1
            ? `Puesto ${puesto} de ${ofertas.length}`
            : disponibles.length === 1
                ? "Único proveedor"
                : mostrarPrecios
                    ? "Mejor precio"
                    : "Proveedor sugerido";

    const conPrecio = mostrarPrecios && seleccionada.precio !== undefined;

    return (
        <div
            className={`relative isolate mt-4 overflow-hidden rounded-2xl px-5 py-4 ${colores.banner}`}
        >
            {/* Fondo animado. `isolate` + `-z-10` lo dejan detrás del contenido
                sin sacarlo de la tarjeta. La paleta es la del proveedor elegido,
                así que el banner se tiñe de nuevo al cambiar la selección. */}
            <div className="absolute inset-0 -z-10">
                <BurbujasPrecio idFiltro={idFiltro} paleta={colores.burbujas} />
            </div>

            <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">
                    {leyenda}
                </p>
                {/* Con precios el nombre del proveedor va arriba, porque el dato
                    grande es el importe. Sin ellos el proveedor pasa a ser el
                    dato grande y aquí sobraría. */}
                {conPrecio && (
                    <p className="text-base font-bold leading-none">
                        {seleccionada.proveedor}
                    </p>
                )}
            </div>

            <div className="mt-2 flex items-end justify-between gap-2">
                {conPrecio ? (
                    <p className="font-mono text-3xl font-bold leading-none tabular-nums">
                        {formatoPrecio(seleccionada.precio!)}
                    </p>
                ) : (
                    <p className="text-2xl font-bold leading-tight">
                        {seleccionada.proveedor}
                    </p>
                )}

                {/* El hueco de la derecha va al dato más pertinente de los tres.
                    El sobrecoste manda sobre el rango: si se eligió un proveedor
                    que no es el más barato, lo que hace falta saber es cuánto se
                    paga de más, no entre qué precios se mueve el producto. */}
                {extra > 0 ? (
                    <p className="text-right text-xs leading-tight opacity-75">
                        de más
                        <br />
                        <span className="font-mono font-bold tabular-nums">
                            +{extra}%
                        </span>
                    </p>
                ) : conPrecio && menor !== null && mayor !== null && menor !== mayor ? (
                    <p className="text-right text-xs leading-tight opacity-75">
                        rango
                        <br />
                        <span className="font-mono tabular-nums">
                            {precioCompacto(menor)}-{precioCompacto(mayor)}
                        </span>
                    </p>
                ) : (
                    seleccionada.unidad && (
                        <p className="text-right text-xs leading-tight opacity-75">
                            por
                            <br />
                            <span className="font-semibold">
                                {seleccionada.unidad}
                            </span>
                        </p>
                    )
                )}
            </div>
        </div>
    );
}
