/**
 * Nombres de proveedor, sin dependencias de Google Sheets.
 *
 * Vive aparte de `proveedores.ts` a propósito: la interfaz también necesita
 * normalizar el nombre (`coloresProveedor.ts` busca la paleta que viene de la
 * hoja por nombre de proveedor) y `proveedores.ts` importa el cliente de
 * Sheets. Traerlo desde un componente de cliente metería `googleapis` en el
 * bundle del navegador.
 */

/**
 * Nombres del catálogo de ejemplo que no coinciden con los de la hoja.
 *
 * El catálogo en código usa "Farmater" y en `Lista_Proveedores` el proveedor se
 * llama "Farmacenter" (id 3). Sin este alias las partidas de ese proveedor no
 * se podrían guardar, porque no habría `id_proveedor` que escribir, ni saldría
 * su paleta de burbujas.
 *
 * Es un parche, no una solución: lo correcto es unificar el nombre en un lado.
 * Se deja explícito y en un solo sitio para que se vea que hay una discrepancia
 * pendiente en los datos.
 */
const ALIAS: Record<string, string> = {
    farmater: "farmacenter",
};

/**
 * Clave canónica de un proveedor: minúsculas, sin espacios sobrantes y con el
 * alias aplicado. Es la que se usa para cruzar el nombre de la interfaz con el
 * de la hoja en cualquier dirección.
 */
export function claveProveedor(nombre: string): string {
    const normalizado = nombre.trim().toLowerCase();
    return ALIAS[normalizado] ?? normalizado;
}

/**
 * Inverso del alias: nombre tal como está en la hoja -> nombre que espera el
 * código. Si el proveedor no tiene alias se devuelve sin tocar.
 */
export function nombreEnCodigo(nombreEnHoja: string): string {
    const normalizado = nombreEnHoja.trim().toLowerCase();

    const entrada = Object.entries(ALIAS).find(
        ([, canonico]) => canonico === normalizado,
    );
    if (!entrada) return nombreEnHoja;

    // Se recupera la capitalización del catálogo en código.
    const [enCodigo] = entrada;
    return enCodigo.charAt(0).toUpperCase() + enCodigo.slice(1);
}
