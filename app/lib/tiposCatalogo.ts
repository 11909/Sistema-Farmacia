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
    /**
     * Piezas en existencia, que es el tope del selector de cantidad.
     *
     * No es dato de importe, así que viaja también a las cuentas que no ven
     * precios: sin él no podrían saber cuántas piezas pueden pedir. El carrito
     * hace lo mismo con `LineaVisible`.
     */
    existencias: number;
    /**
     * Cuánto más caro es este proveedor que el más barato disponible, en
     * porcentaje entero. `0` en el primer puesto del ranking.
     *
     * Se calcula en el servidor y sigue viajando aunque los precios no lo hagan.
     * Es deliberado: es una proporción entre dos precios, no un importe, así que
     * no dice cuánto cuesta el producto, y es lo que permite que una cuenta de
     * sucursal —que no ve precios— sepa que elegir el puesto 3 sale un 10% más
     * caro. Sin esto el aviso del banner solo lo verían los administradores, que
     * son justo los que menos lo necesitan.
     */
    extra?: number;
};

/**
 * Cuánto más se paga por una oferta frente a la más barata, en porcentaje.
 *
 * Se redondea hacia arriba, al contrario que el porcentaje de diferencia de la
 * tarjeta, que se trunca: los dos van en la dirección que no engaña. Ahí el
 * número es un ahorro posible y pasarse lo prometería de más; aquí es un
 * sobrecoste y quedarse corto lo haría parecer más barato de lo que es.
 */
export function calcularExtra(precio: number, masBarato: number): number {
    if (masBarato <= 0) return 0;
    return Math.ceil(((precio - masBarato) / masBarato) * 100);
}

/**
 * Rellena `extra` en cada oferta, respecto a la más barata disponible.
 *
 * Tiene que correr **antes** de `sinPreciosOfertas`: después ya no quedan
 * precios con los que calcularlo.
 */
export function conSobrecoste(ofertas: OfertaVisible[]): OfertaVisible[] {
    const precios = ofertas
        .filter((o) => o.disponible)
        .map((o) => o.precio)
        .filter((p): p is number => p !== undefined);

    if (precios.length === 0) return ofertas;
    const masBarato = Math.min(...precios);

    return ofertas.map((oferta) => {
        if (oferta.precio === undefined) return oferta;
        return { ...oferta, extra: calcularExtra(oferta.precio, masBarato) };
    });
}

/**
 * Quita los importes de las ofertas antes de mandarlas al navegador.
 *
 * `extra` se conserva a propósito (ver el tipo): es una proporción, no un
 * importe.
 */
export function sinPreciosOfertas(ofertas: OfertaVisible[]): OfertaVisible[] {
    return ofertas.map((oferta) => {
        const visible: OfertaVisible = { ...oferta };
        delete visible.precio;
        return visible;
    });
}

export const EXISTENCIAS_POR_DEFECTO = 99;

export type PrecioProveedor = {
    proveedor: string;
    precio: number;
    disponible: boolean;
    existencias?: number;
    unidad?: string;
};

export type Medicamento = {
    codigoBarras: string;
    nombre: string;
    imagen?: string;
    precios: PrecioProveedor[];
    textoBusqueda: string;
};

export function ofertasOrdenadas(medicamento: Medicamento): PrecioProveedor[] {
    return [...medicamento.precios].sort((a, b) => {
        if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
        return a.precio - b.precio;
    });
}
