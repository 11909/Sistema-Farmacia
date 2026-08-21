import { timingSafeEqual } from "node:crypto";
import { leerFilas } from "./sheets";

/**
 * Pestaña `Administrador` de la hoja "Base de Datos Sistema Farmacia".
 *
 * Columnas (A..F):
 *   A email_admin | B nombre_pila | C apellido_paterno
 *   D apellido_materno | E contrasena | F telefono
 *
 * Si se reordenan las columnas en la hoja, actualiza `COL`.
 */
const RANGO_ADMINISTRADORES = "Administrador!A2:F";
const TOTAL_COLUMNAS = 6;

const COL = {
    email: 0,
    nombre: 1,
    apellidoPaterno: 2,
    apellidoMaterno: 3,
    contrasena: 4,
    telefono: 5,
} as const;

export type Administrador = {
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    telefono: string;
    /** Nombre completo, listo para mostrar en la interfaz. */
    nombreCompleto: string;
};

/**
 * Resultado de un intento de acceso.
 *
 * Es un tipo discriminado para que quien lo consuma tenga que distinguir los
 * tres casos explícitamente, en lugar de recibir `null` y adivinar el motivo.
 */
export type ResultadoAcceso =
    | { estado: "ok"; administrador: Administrador }
    | { estado: "usuario-inexistente" }
    | { estado: "contrasena-incorrecta" };

/** Normaliza para comparar correos: sin espacios y en minúsculas. */
function normalizarEmail(valor: string): string {
    return valor.trim().toLowerCase();
}

/**
 * Compara dos secretos sin cortar en el primer byte distinto.
 *
 * `timingSafeEqual` exige buffers del mismo tamaño, así que se rellenan al
 * largo mayor y la diferencia de longitud se comprueba aparte.
 */
function contrasenaCoincide(recibida: string, esperada: string): boolean {
    const a = Buffer.from(recibida, "utf8");
    const b = Buffer.from(esperada, "utf8");
    const largo = Math.max(a.length, b.length, 1);

    const aRelleno = Buffer.alloc(largo);
    const bRelleno = Buffer.alloc(largo);
    a.copy(aRelleno);
    b.copy(bRelleno);

    return timingSafeEqual(aRelleno, bRelleno) && a.length === b.length;
}

function construirAdministrador(fila: string[]): Administrador {
    const nombre = fila[COL.nombre].trim();
    const apellidoPaterno = fila[COL.apellidoPaterno].trim();
    const apellidoMaterno = fila[COL.apellidoMaterno].trim();

    return {
        email: normalizarEmail(fila[COL.email]),
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        telefono: fila[COL.telefono].trim(),
        nombreCompleto: [nombre, apellidoPaterno, apellidoMaterno]
            .filter(Boolean)
            .join(" "),
    };
}

/**
 * Busca la fila de un administrador por correo. Devuelve `null` si no existe.
 */
async function buscarFilaPorEmail(email: string): Promise<string[] | null> {
    const emailBuscado = normalizarEmail(email);
    if (!emailBuscado) return null;

    const filas = await leerFilas(RANGO_ADMINISTRADORES, TOTAL_COLUMNAS);

    return (
        filas.find((f) => normalizarEmail(f[COL.email]) === emailBuscado) ?? null
    );
}

/**
 * Comprueba si un correo está registrado como administrador.
 *
 * Se expone aparte de `intentarAcceso` porque el formulario de recuperación de
 * contraseña también necesita esta comprobación, sin contraseña de por medio.
 */
export async function existeAdministrador(email: string): Promise<boolean> {
    return (await buscarFilaPorEmail(email)) !== null;
}

/**
 * Valida un intento de acceso contra la pestaña `Administrador`.
 *
 * Distingue "el usuario no existe" de "la contraseña no coincide" porque la
 * interfaz muestra mensajes distintos para cada caso.
 */
export async function intentarAcceso(
    email: string,
    contrasena: string,
): Promise<ResultadoAcceso> {
    const fila = await buscarFilaPorEmail(email);
    if (!fila) return { estado: "usuario-inexistente" };

    // Los espacios en los extremos se cuelan con facilidad al editar la hoja
    // a mano, así que se ignoran en ambos lados.
    if (!contrasenaCoincide(contrasena.trim(), fila[COL.contrasena].trim())) {
        return { estado: "contrasena-incorrecta" };
    }

    return { estado: "ok", administrador: construirAdministrador(fila) };
}
