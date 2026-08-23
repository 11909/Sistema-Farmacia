/**
 * Nombres de proveedor, sin dependencias de Google Sheets.
 *
 * Vive aparte de `proveedores.ts` a propósito: la interfaz también necesita
 * normalizar el nombre (`coloresProveedor.ts` busca la paleta que viene de la
 * hoja por nombre de proveedor) y `proveedores.ts` importa el cliente de
 * Sheets. Traerlo desde un componente de cliente metería `googleapis` en el
 * bundle del navegador.
 *
 * Aquí había una tabla de alias porque el código llamaba "Farmater" a lo que en
 * `Lista_Proveedores` es "Farmacenter". Ya no: los cuatro proveedores se llaman
 * igual en los dos lados, así que cruzar el nombre es comparar la misma cadena.
 */

/**
 * Clave canónica de un proveedor: minúsculas y sin espacios sobrantes.
 *
 * Es la que se usa para cruzar el nombre de la interfaz con el de la hoja en
 * cualquier dirección. Sigue existiendo aunque los nombres ya coincidan, porque
 * las celdas las escriben personas y un espacio de más o una mayúscula distinta
 * no deben dejar a un proveedor sin color ni sin `id_proveedor`.
 */
export function claveProveedor(nombre: string): string {
    return nombre.trim().toLowerCase();
}
