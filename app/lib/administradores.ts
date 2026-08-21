import {
    normalizarEmail,
    nombreParaMostrar,
    type CuentaConCredencial,
} from "./credenciales";

/**
 * Pestaña `Administrador` de la hoja "Base de Datos Sistema Farmacia".
 *
 * Columnas (A..F):
 *   A email_admin | B nombre_pila | C apellido_paterno
 *   D apellido_materno | E contrasena | F telefono
 *
 * Si se reordenan las columnas en la hoja, actualiza `COL`.
 */
export const RANGO_ADMINISTRADORES = "Administrador!A2:F";
export const COLUMNAS_ADMINISTRADORES = 6;

const COL = {
    email: 0,
    nombre: 1,
    apellidoPaterno: 2,
    apellidoMaterno: 3,
    contrasena: 4,
    telefono: 5,
} as const;

/**
 * Busca un administrador por correo dentro de filas ya leídas.
 *
 * Recibe las filas en lugar de leerlas para que `cuentas.ts` pueda traer esta
 * pestaña y la de sucursales en una sola petición a la API.
 *
 * Devuelve la cuenta junto a su contraseña sin verificar; la comparación la
 * hace `intentarAcceso`.
 */
export function buscarAdministradorEnFilas(
    filas: string[][],
    email: string,
): CuentaConCredencial | null {
    const emailBuscado = normalizarEmail(email);
    if (!emailBuscado) return null;

    const fila = filas.find(
        (f) => normalizarEmail(f[COL.email]) === emailBuscado,
    );
    if (!fila) return null;

    const emailNormalizado = normalizarEmail(fila[COL.email]);

    return {
        contrasena: fila[COL.contrasena],
        cuenta: {
            email: emailNormalizado,
            nombreCompleto: nombreParaMostrar(
                [
                    fila[COL.nombre],
                    fila[COL.apellidoPaterno],
                    fila[COL.apellidoMaterno],
                ],
                emailNormalizado,
            ),
            telefono: fila[COL.telefono].trim(),
            rol: "administrador",
            zona: null,
        },
    };
}
