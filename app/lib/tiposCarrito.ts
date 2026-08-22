/**
 * Tipos del carrito compartidos entre servidor y cliente.
 *
 * Están en su propio módulo, sin importar nada de Google Sheets, para que el
 * componente de cliente pueda usarlos sin arrastrar `googleapis` al bundle del
 * navegador.
 */

/** Una partida del pedido: un medicamento comprado a un proveedor concreto. */
export type LineaCarrito = {
    /**
     * Identidad de la partida: `codigo_barras|proveedor`.
     *
     * Lleva el proveedor dentro porque el mismo producto puede estar dos veces
     * en el carrito comprado a proveedores distintos, y son partidas separadas.
     * Con solo el código de barras, cambiar la cantidad de una afectaría a las
     * dos.
     */
    id: string;
    nombre: string;
    /** Clave con la que la hoja identifica el producto. */
    codigoBarras: string;
    /** Proveedor elegido en el comparador. */
    proveedor: string;
    /** Precio unitario del proveedor elegido. */
    precioUnitario: number;
    /**
     * Precio unitario más alto entre los proveedores disponibles. Sirve para
     * calcular el ahorro de haber comprado en el comparador; si no se conoce se
     * omite y la línea simplemente no aporta ahorro.
     */
    precioMasAlto?: number;
    cantidad: number;
    /** Piezas que el proveedor tiene en existencia (tope del selector). */
    existencias: number;
    /**
     * Unidad de venta del proveedor (PZ, PAQ, CAJA...), cuando la hoja la trae
     * en lugar de una cantidad. Ocupa el hueco donde antes iba la presentación.
     */
    unidad?: string;
};

/**
 * Lo único que se persiste de cada partida.
 *
 * Coincide con las columnas de `Carrito_Producto`. El resto de campos de
 * `LineaCarrito` (nombre, precios, existencia) se resuelven desde el catálogo al
 * leer, así que no se duplican en la hoja.
 */
export type PartidaGuardada = {
    codigoBarras: string;
    proveedor: string;
    cantidad: number;
};

export const CANTIDAD_MAXIMA = 99;

/** Recorta una cantidad al rango permitido por el stock del proveedor. */
export function acotarCantidad(cantidad: number, existencias: number): number {
    const tope = Math.min(existencias, CANTIDAD_MAXIMA);
    return Math.min(Math.max(Math.trunc(cantidad), 1), Math.max(tope, 1));
}
