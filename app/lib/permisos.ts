import type { Rol } from "./credenciales";

/**
 * Qué puede ver cada rol.
 *
 * Vive aparte y sin dependencias para que la regla exista una sola vez y se
 * pueda importar tanto desde el servidor como desde un componente de cliente.
 * Duplicar la condición es la forma habitual de que una copia se quede sin
 * actualizar y acabe enseñando lo que no debe.
 */

/**
 * Solo los administradores ven importes.
 *
 * Las sucursales ven el ranking de proveedores (el orden de más barato a más
 * caro) pero no los precios: eso les dice a quién comprar sin exponerles el
 * costo.
 *
 * Deniega por omisión: si el rol no llega, se asume el permiso más restrictivo
 * en lugar de enseñar los precios ante una sesión a medio construir.
 */
export function puedeVerPrecios(rol: Rol | undefined | null): boolean {
    return rol === "administrador";
}
