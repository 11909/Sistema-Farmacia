import type { OfertaVisible } from "../../lib/tiposCatalogo";

/**
 * Renglón de aviso de precio de la tarjeta, encima del banner.
 *
 * Dice una de dos cosas según el proveedor que esté elegido en el ranking:
 *
 *  - Primer puesto: cuánto separa al proveedor más barato del más caro, en verde.
 *    Es la oportunidad que ofrece la comparación.
 *  - Cualquier otro puesto: cuánto se paga de más respecto al primero, en rojo.
 *    Es el coste de no haber comprado lo más barato.
 *
 * Estaba en `page.tsx` como servidor, con el texto verde fijo. Se movió aquí
 * porque ahora depende de la selección, que es estado de cliente.
 */

/** Tendencia a la baja: el precio que se ahorra. */
function IconoBaja() {
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
 * Tendencia al alza: el precio que se paga de más.
 *
 * Es el mismo trazo del icono de baja reflejado en vertical. No basta con
 * cambiarle el color a rojo: una flecha que apunta hacia abajo junto a un
 * "+21%" diría lo contrario que el texto.
 */
function IconoAlza() {
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
                d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5"
            />
        </svg>
    );
}

export default function AvisoPrecio({
    ofertas,
    seleccionada,
}: {
    /** Todas las ofertas del producto, en el orden del ranking. */
    ofertas: OfertaVisible[];
    /** La oferta marcada en el ranking. */
    seleccionada: OfertaVisible;
}) {
    const puesto =
        ofertas.findIndex((o) => o.proveedor === seleccionada.proveedor) + 1;

    // El sobrecoste lo calcula el servidor, así que llega también a las cuentas
    // que no ven precios: es una proporción, no un importe (ver `OfertaVisible`).
    const extra = puesto > 1 ? (seleccionada.extra ?? 0) : 0;

    if (extra > 0) {
        return (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-rose-600">
                <IconoAlza />+{extra}% sobre el más barato
            </p>
        );
    }

    // La diferencia sí sale de los importes, y estos no llegan al navegador
    // cuando la cuenta no puede verlos. Sin precios no hay renglón verde: no es
    // una decisión de este componente, es que no tiene con qué calcularlo.
    const precios = ofertas
        .filter((o) => o.disponible)
        .map((o) => o.precio)
        .filter((p): p is number => p !== undefined);
    if (precios.length < 2) return null;

    const menor = Math.min(...precios);
    const mayor = Math.max(...precios);
    // Se trunca para no anunciar una diferencia mayor a la real.
    const diferencia = mayor > 0 ? Math.floor(((mayor - menor) / mayor) * 100) : 0;
    if (diferencia <= 0) return null;

    return (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
            <IconoBaja />
            Hasta {diferencia}% de diferencia
        </p>
    );
}
