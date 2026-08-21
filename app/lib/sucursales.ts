import {
    normalizarEmail,
    nombreParaMostrar,
    type CuentaConCredencial,
} from "./credenciales";

/**
 * Pestaña `Sucursal` de la hoja "Base de Datos Sistema Farmacia".
 *
 * Columnas (A..E):
 *   A email_sucursal | B nombre | C zona | D contrasena | E telefono
 *
 * Ojo: son cinco columnas, no seis como en `Administrador`, y el orden es
 * distinto (aquí `contrasena` va en D). De ahí que cada pestaña tenga su propio
 * mapeo en lugar de compartir uno.
 */
export const RANGO_SUCURSALES = "Sucursal!A2:E";
export const COLUMNAS_SUCURSALES = 5;

const COL = {
    email: 0,
    nombre: 1,
    zona: 2,
    contrasena: 3,
    telefono: 4,
} as const;

/**
 * Busca una sucursal por correo dentro de filas ya leídas.
 *
 * Igual que en `administradores.ts`, recibe las filas para que `cuentas.ts`
 * pueda leer ambas pestañas en una sola petición.
 */
export function buscarSucursalEnFilas(
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
    const zona = fila[COL.zona].trim();

    return {
        contrasena: fila[COL.contrasena],
        cuenta: {
            email: emailNormalizado,
            // La columna `nombre` está vacía en todas las filas actuales, así
            // que el nombre visible se apoya en la zona o en el correo.
            nombreCompleto: nombreParaMostrar(
                [fila[COL.nombre], zona && `Sucursal ${zona}`],
                emailNormalizado,
            ),
            telefono: fila[COL.telefono].trim(),
            rol: "sucursal",
            zona: zona || null,
        },
    };
}
