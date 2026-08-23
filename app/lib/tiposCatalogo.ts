/**
 * Tipos del catálogo compartidos entre servidor y cliente.
 *
 * Mismo motivo que `tiposCarrito.ts`: `catalogo.ts` importa el cliente de
 * Google Sheets, así que un componente de cliente no puede tirar de sus tipos
 * sin arrastrar `googleapis` al bundle del navegador.
 */

/**
 * Una oferta tal como se le entrega al selector de proveedor de la tarjeta.
 *
 * `precio` es opcional porque a las cuentas de sucursal se les quita antes de
 * salir del servidor (ver `sinPreciosOfertas`). No basta con no pintarlo: el
 * selector es un componente de cliente, así que todo lo que reciba como prop
 * viaja dentro del payload que el navegador recibe para hidratarlo, y ahí queda
 * a la vista de quien abra las herramientas de desarrollo.
 */
export type OfertaVisible = {
    proveedor: string;
    /** Precio unitario. Ausente cuando la cuenta no puede ver importes. */
    precio?: number;
    /** Si el proveedor tiene existencia. Un agotado no se puede seleccionar. */
    disponible: boolean;
    /** Unidad de venta declarada por el proveedor (PZ, PAQ, CAJA...). */
    unidad?: string;
};

/** Quita los importes de las ofertas antes de mandarlas al navegador. */
export function sinPreciosOfertas(ofertas: OfertaVisible[]): OfertaVisible[] {
    return ofertas.map((oferta) => {
        const visible: OfertaVisible = { ...oferta };
        delete visible.precio;
        return visible;
    });
}
