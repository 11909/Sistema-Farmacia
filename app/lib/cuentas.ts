import { buscarAdministrador } from "./administradores";
import { buscarSucursal } from "./sucursales";
import { contrasenaCoincide, type Cuenta } from "./credenciales";

/**
 * Punto único de validación de credenciales.
 *
 * Un correo puede estar en la pestaña `Administrador` o en `Sucursal`. Aquí se
 * consultan ambas y se decide; los módulos por pestaña solo saben mapear
 * columnas.
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

/**
 * Orden de precedencia si un mismo correo apareciera en las dos pestañas: gana
 * `Administrador`, por ser el rol con más permisos y el que se registra a mano.
 */
const FUENTES = [buscarAdministrador, buscarSucursal] as const;

export async function intentarAcceso(
    email: string,
    contrasena: string,
): Promise<ResultadoAcceso> {
    // En paralelo: son dos lecturas a la misma hoja y esperarlas en serie
    // duplicaría la latencia del login sin ahorrar nada apreciable.
    const resultados = await Promise.all(FUENTES.map((buscar) => buscar(email)));

    const encontrado = resultados.find((r) => r !== null);
    if (!encontrado) return { estado: "usuario-inexistente" };

    // Los espacios en los extremos se cuelan con facilidad al editar la hoja a
    // mano, así que se ignoran en ambos lados.
    if (
        !contrasenaCoincide(contrasena.trim(), encontrado.contrasena.trim())
    ) {
        return { estado: "contrasena-incorrecta" };
    }

    return { estado: "ok", cuenta: encontrado.cuenta };
}
