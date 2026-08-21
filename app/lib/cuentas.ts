import { leerVariosRangos } from "./sheets";
import {
    buscarAdministradorEnFilas,
    COLUMNAS_ADMINISTRADORES,
    RANGO_ADMINISTRADORES,
} from "./administradores";
import {
    buscarSucursalEnFilas,
    COLUMNAS_SUCURSALES,
    RANGO_SUCURSALES,
} from "./sucursales";
import { contrasenaCoincide, type Cuenta } from "./credenciales";

/**
 * Punto único de validación de credenciales.
 *
 * Un correo puede estar en la pestaña `Administrador` o en `Sucursal`. Ambas se
 * leen en una sola petición y aquí se decide; los módulos por pestaña solo
 * saben mapear columnas.
 */

/**
 * Resultado de un intento de acceso.
 *
 * Tipo discriminado a propósito: obliga a distinguir los tres casos en lugar
 * de recibir `null` y adivinar el motivo, que es justo lo que necesita la
 * interfaz para elegir el mensaje del modal.
 */
export type ResultadoAcceso =
    | { estado: "ok"; cuenta: Cuenta }
    | { estado: "usuario-inexistente" }
    | { estado: "contrasena-incorrecta" };

export async function intentarAcceso(
    email: string,
    contrasena: string,
): Promise<ResultadoAcceso> {
    const [filasAdmin, filasSucursal] = await leerVariosRangos(
        [RANGO_ADMINISTRADORES, RANGO_SUCURSALES],
        [COLUMNAS_ADMINISTRADORES, COLUMNAS_SUCURSALES],
    );

    // Si un mismo correo estuviera en las dos pestañas gana `Administrador`,
    // por ser el rol con más permisos.
    const encontrado =
        buscarAdministradorEnFilas(filasAdmin, email) ??
        buscarSucursalEnFilas(filasSucursal, email);

    if (!encontrado) return { estado: "usuario-inexistente" };

    // Los espacios en los extremos se cuelan con facilidad al editar la hoja a
    // mano, así que se ignoran en ambos lados.
    if (!contrasenaCoincide(contrasena.trim(), encontrado.contrasena.trim())) {
        return { estado: "contrasena-incorrecta" };
    }

    return { estado: "ok", cuenta: encontrado.cuenta };
}
