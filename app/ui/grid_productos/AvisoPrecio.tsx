import type { OfertaVisible } from "../../lib/tiposCatalogo";

/**
 * Renglón de aviso de sobrecoste de la tarjeta, encima del banner.
 *
 * Aparece solo cuando el proveedor elegido no es el del primer puesto, y dice
 * cuánto se paga de más respecto a él. Con el primer puesto elegido no hay nada
 * que advertir y el renglón no se pinta.
 *
 * Aquí iba también un "Hasta X% de diferencia" en verde con el primer puesto
 * elegido. Se quitó porque para un administrador repetía lo que ya dice el rango
 * de precios del banner, y para una sucursal nunca llegaba a aparecer: la
 * diferencia se calcula a partir de los importes, y a esas cuentas no les llegan.
 * Al quedarse solo el aviso rojo, los dos roles ven exactamente lo mismo.
 *
 * El renglón vivía en `page.tsx` como servidor. Está aquí porque depende de la
 * selección, que es estado de cliente.
 */

/**
 * Tendencia al alza: el precio que se paga de más.
 *
 * Va hacia arriba a propósito. Con el trazo descendente del icono de ahorro, una
 * flecha roja junto a un "+21%" diría lo contrario que el texto.
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
    if (extra <= 0) return null;

    return (
        <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-rose-600">
            <IconoAlza />+{extra}% sobre el más barato
        </p>
    );
}
